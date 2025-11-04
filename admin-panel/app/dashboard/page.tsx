'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
);

interface DashboardStats {
  totalUsers: number;
  totalChildren: number;
  totalMealRecords: number;
  totalEarlyDetections: number;
  recentActivity: any[];
  alerts: any[];
}

interface NutritionStats {
  totalIngredients: number;
  totalDishes: number;
  totalMealLogs: number;
  averageIronPerMeal: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [nutritionStats, setNutritionStats] = useState<NutritionStats | null>(null);
  const [earlyDetectionProgress, setEarlyDetectionProgress] = useState<any[]>([]);
  const [earlyDetectionDistribution, setEarlyDetectionDistribution] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      
      const statsRes = await api.get('/dashboard/stats');
      setStats(statsRes.data);

      // Obtener estadísticas de nutrición con endpoints paginados
      const [ingredientsRes, dishesRes, mealLogsRes] = await Promise.all([
        api.get('/ingredients?limit=1'), // Solo necesitamos el total, no los datos
        api.get('/dishes?limit=1'), // Solo necesitamos el total, no los datos
        api.get('/meal-logs?limit=1000'), // Obtener un límite alto para contar todos
      ]);

      // Extraer totales de las respuestas paginadas
      const totalIngredients = ingredientsRes.data.total || 0;
      const totalDishes = dishesRes.data.total || 0;
      const mealLogsData = mealLogsRes.data.data || [];
      const totalMealLogs = mealLogsRes.data.total || 0;

      const avgIron = mealLogsData.length > 0 
        ? mealLogsData.reduce((sum: number, log: any) => sum + (Number(log.iron_consumed_mg) || 0), 0) / mealLogsData.length
        : 0;

      setNutritionStats({
        totalIngredients: totalIngredients,
        totalDishes: totalDishes,
        totalMealLogs: totalMealLogs,
        averageIronPerMeal: avgIron,
      });
      
      const [earlyProgressRes, earlyDistRes] = await Promise.all([
        api.get('/dashboard/early-detection-progress'),
        api.get('/dashboard/early-detection-distribution'),
      ]);
      
      setEarlyDetectionProgress(earlyProgressRes.data);
      setEarlyDetectionDistribution(earlyDistRes.data);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      if (error?.response?.status === 401) {
        return;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = (cardType: string) => {
    switch(cardType) {
      case 'users':
        router.push('/dashboard/products'); // Redirigir a gestión de usuarios
        break;
      case 'children':
        router.push('/dashboard/products'); // Redirigir a gestión de usuarios
        break;
      case 'detections':
        router.push('/dashboard/detections');
        break;
      case 'ingredients':
        router.push('/dashboard/ingredients');
        break;
      case 'dishes':
        router.push('/dashboard/dishes');
        break;
      case 'meal-logs':
        router.push('/dashboard/meal-logs');
        break;
    }
  };

  if (isLoading) {
    return <div className="text-center">Cargando estadísticas...</div>;
  }

  // Chart configurations
  const earlyDetectionChartData = {
    labels: earlyDetectionProgress.map(item => {
      const date = new Date(item.month + '-01');
      return date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
    }),
    datasets: [
      {
        label: 'Tasa de Mejora (%)',
        data: earlyDetectionProgress.map(item => item.improvementRate),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Confianza IA Promedio (%)',
        data: earlyDetectionProgress.map(item => item.averageConfidence),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        yAxisID: 'y1',
      },
    ],
  };

  const earlyDetectionDistChartData = earlyDetectionDistribution ? {
    labels: earlyDetectionDistribution.labels,
    datasets: [
      {
        data: earlyDetectionDistribution.data,
        backgroundColor: earlyDetectionDistribution.colors,
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  } : null;

  const earlyDetectionLevelsData = {
    labels: earlyDetectionProgress.map(item => {
      const date = new Date(item.month + '-01');
      return date.toLocaleDateString('es-ES', { month: 'short' });
    }),
    datasets: [
      {
        label: 'Normal',
        data: earlyDetectionProgress.map(item => item.normalCount),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
      },
      {
        label: 'Sospechoso',
        data: earlyDetectionProgress.map(item => item.sospechososCount),
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
      },
      {
        label: 'Probable Anemia',
        data: earlyDetectionProgress.map(item => item.probableAnemiaCount),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
      },
    ],
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        Bienvenido, {user?.nombre || user?.email}
      </h1>
      
      {/* Stats Cards Principales - Solo 3 cards ahora */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div 
          onClick={() => handleCardClick('users')}
          className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition-shadow duration-200"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">👥</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Usuarios
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.totalUsers || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div 
          onClick={() => handleCardClick('children')}
          className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition-shadow duration-200"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">👶</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Niños
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.totalChildren || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div 
          onClick={() => handleCardClick('detections')}
          className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition-shadow duration-200"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">👁️</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Detecciones IA
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.totalEarlyDetections || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Nuevas Stats Cards del Sistema de Nutrición */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">🍽️ Sistema de Nutrición Avanzado</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div 
            onClick={() => handleCardClick('ingredients')}
            className="bg-gradient-to-br from-orange-50 to-orange-100 overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition-all duration-200 border border-orange-200"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">🥘</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-orange-700 truncate">
                      Ingredientes
                    </dt>
                    <dd className="text-lg font-medium text-orange-900">
                      {nutritionStats?.totalIngredients || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div 
            onClick={() => handleCardClick('dishes')}
            className="bg-gradient-to-br from-indigo-50 to-indigo-100 overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition-all duration-200 border border-indigo-200"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">🍽️</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-indigo-700 truncate">
                      Platillos & Recetas
                    </dt>
                    <dd className="text-lg font-medium text-indigo-900">
                      {nutritionStats?.totalDishes || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div 
            onClick={() => handleCardClick('meal-logs')}
            className="bg-gradient-to-br from-emerald-50 to-emerald-100 overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition-all duration-200 border border-emerald-200"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-emerald-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">📊</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-emerald-700 truncate">
                      Cálculo Nutricional
                    </dt>
                    <dd className="text-lg font-medium text-emerald-900">
                      {nutritionStats?.totalMealLogs || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 overflow-hidden shadow rounded-lg border border-red-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">🔴</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-red-700 truncate">
                      Hierro Promedio
                    </dt>
                    <dd className="text-lg font-medium text-red-900">
                      {nutritionStats?.averageIronPerMeal.toFixed(1) || '0.0'} mg
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Progreso de Detección Temprana con IA */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            👁️ Progreso de Detección Temprana con IA
          </h3>
          <div className="h-64">
            <Line 
              data={earlyDetectionChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    min: 0,
                    max: 100,
                    title: {
                      display: true,
                      text: 'Tasa de Mejora (%)'
                    }
                  },
                  y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    min: 70,
                    max: 100,
                    title: {
                      display: true,
                      text: 'Confianza IA (%)'
                    },
                    grid: {
                      drawOnChartArea: false,
                    },
                  },
                },
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                  title: {
                    display: true,
                    text: 'Análisis de mucosa ocular para detección temprana de anemia'
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Distribución de Detección Temprana */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            🎯 Estado Actual - Detección Temprana
          </h3>
          <div className="h-64">
            {earlyDetectionDistChartData && (
              <Doughnut 
                data={earlyDetectionDistChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom' as const,
                    },
                    title: {
                      display: true,
                      text: 'Resultados de análisis de mucosa ocular'
                    }
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Tendencia de Niveles de Detección Temprana */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          📊 Evolución de Detecciones Tempranas por Mes
        </h3>
        <div className="h-80">
          <Bar 
            data={earlyDetectionLevelsData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: {
                  stacked: true,
                },
                y: {
                  stacked: true,
                  title: {
                    display: true,
                    text: 'Número de Detecciones'
                  }
                }
              },
              plugins: {
                legend: {
                  position: 'top' as const,
                },
                title: {
                  display: true,
                  text: 'Progreso en las detecciones tempranas con IA a lo largo del tiempo'
                }
              }
            }}
          />
        </div>
      </div>

      {/* Activity and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              📋 Actividad Reciente
            </h3>
            <div className="space-y-3">
              {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                stats.recentActivity.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        {activity.description || 'Actividad registrada'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No hay actividad reciente</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              ⚠️ Alertas de Detección Temprana
            </h3>
            <div className="space-y-3">
              {stats?.alerts && stats.alerts.length > 0 ? (
                stats.alerts.slice(0, 5).map((alert, index) => (
                  <div key={index} className="bg-yellow-50 border-l-4 border-yellow-400 p-3">
                    <div className="flex">
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          {alert.message || 'Alerta sin mensaje'}
                        </p>
                        <p className="text-xs text-yellow-600 mt-1">
                          {new Date(alert.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No hay alertas activas</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
