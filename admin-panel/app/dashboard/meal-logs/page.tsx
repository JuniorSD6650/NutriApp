'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../../lib/api';
import { PlusIcon, EyeIcon, TrashIcon, CalculatorIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useSweetAlert } from '../../../hooks/useSweetAlert';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

interface Patient {
  id: string;
  nombre: string;
  birthYear: number;
}

interface Dish {
  id: string;
  name: string;
  description?: string;
}

interface MealLog {
  id: string;
  date: string;
  grams_served: number;
  iron_consumed_mg: number;
  calories_consumed: number;
  patient: Patient;
  dish: Dish;
  created_at: string;
}

interface CreateMealLogData {
  patientId: string;
  dishId?: string;
  dishName?: string;
}

interface MealLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateMealLogData) => void;
}

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  mealLog: MealLog | null;
}

interface PaginatedMealLogs {
  data: MealLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const CreateMealLogModal = ({ isOpen, onClose, onSave }: MealLogModalProps) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [formData, setFormData] = useState<CreateMealLogData>({
    patientId: '',
    dishId: '',
  });
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPatients();
      fetchDishes();
    }
  }, [isOpen]);

  const fetchPatients = async () => {
    try {
      const response = await api.get('/dashboard/children');
      setPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchDishes = async () => {
    try {
      const response = await api.get('/dishes');
      setDishes(response.data);
    } catch (error) {
      console.error('Error fetching dishes:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);
    
    // Simular cálculo de IA
    setTimeout(() => {
      onSave(formData);
      setIsCalculating(false);
      setFormData({ patientId: '', dishId: '' });
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              🍽️ Nuevo Registro de Comida
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Paciente (Niño)
              </label>
              <select
                value={formData.patientId}
                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Seleccionar paciente...</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.nombre} ({new Date().getFullYear() - patient.birthYear} años)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Platillo
              </label>
              <select
                value={formData.dishId}
                onChange={(e) => setFormData({ ...formData, dishId: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Seleccionar platillo...</option>
                {dishes.map((dish) => (
                  <option key={dish.id} value={dish.id}>
                    {dish.name}
                  </option>
                ))}
              </select>
            </div>

            {formData.patientId && formData.dishId && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">🧮 Cálculo Automático</h4>
                <p className="text-sm text-blue-700 mb-2">
                  El sistema calculará automáticamente:
                </p>
                <ul className="text-sm text-blue-600 space-y-1">
                  <li>• Edad del paciente en meses</li>
                  <li>• Rango de edad apropiado</li>
                  <li>• Tamaño de porción según edad</li>
                  <li>• Composición nutricional del platillo</li>
                  <li>• Hierro y calorías consumidas</li>
                </ul>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={isCalculating}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!formData.patientId || !formData.dishId || isCalculating}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 flex items-center"
            >
              {isCalculating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Calculando...
                </>
              ) : (
                <>
                  <CalculatorIcon className="h-4 w-4 mr-2" />
                  Crear y Calcular
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DetailModal = ({ isOpen, onClose, mealLog }: DetailModalProps) => {
  if (!isOpen || !mealLog) return null;

  const ageInMonths = ((new Date().getFullYear() - mealLog.patient.birthYear) * 12);
  const ironPer100g = (Number(mealLog.iron_consumed_mg) || 0) / (Number(mealLog.grams_served) || 1) * 100;
  const caloriesPer100g = (Number(mealLog.calories_consumed) || 0) / (Number(mealLog.grams_served) || 1) * 100;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            📊 Detalle del Cálculo Nutricional
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información del paciente */}
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-3">👶 Información del Paciente</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Nombre:</span>
                  <span className="font-medium text-blue-900">{mealLog.patient.nombre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Edad:</span>
                  <span className="font-medium text-blue-900">
                    {Math.floor(ageInMonths / 12)} años ({ageInMonths} meses)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Año de nacimiento:</span>
                  <span className="font-medium text-blue-900">{mealLog.patient.birthYear}</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-900 mb-3">🍽️ Platillo Consumido</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-700">Platillo:</span>
                  <span className="font-medium text-green-900">{mealLog.dish.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Fecha:</span>
                  <span className="font-medium text-green-900">
                    {new Date(mealLog.date).toLocaleDateString('es-ES')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Porción servida:</span>
                  <span className="font-medium text-green-900">{mealLog.grams_served}g</span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-3">🧮 Proceso de Cálculo</h4>
              <div className="space-y-2 text-xs text-yellow-700">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                  1. Edad calculada: {ageInMonths} meses
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                  2. Rango de edad determinado automáticamente
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                  3. Tamaño de porción: {mealLog.grams_served}g
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                  4. Composición del platillo analizada
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                  5. Factor de escalado aplicado
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                  6. Nutrientes finales calculados
                </div>
              </div>
            </div>
          </div>

          {/* Resultados nutricionales */}
          <div className="space-y-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-medium text-red-900 mb-3">🔴 Hierro Consumido</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-red-700">Total consumido:</span>
                  <span className="text-2xl font-bold text-red-600">
                    {(Number(mealLog.iron_consumed_mg) || 0).toFixed(1)} mg
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-red-600">Por 100g:</span>
                  <span className="font-medium text-red-700">
                    {ironPer100g.toFixed(1)} mg/100g
                  </span>
                </div>
                <div className="w-full bg-red-200 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full" 
                    style={{ width: `${Math.min(((Number(mealLog.iron_consumed_mg) || 0) / 15) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-red-600">
                  Requerimiento diario típico: 7-11mg
                </p>
              </div>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-medium text-orange-900 mb-3">🟠 Calorías Consumidas</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-orange-700">Total consumidas:</span>
                  <span className="text-2xl font-bold text-orange-600">
                    {(Number(mealLog.calories_consumed) || 0).toFixed(0)} kcal
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-orange-600">Por 100g:</span>
                  <span className="font-medium text-orange-700">
                    {caloriesPer100g.toFixed(0)} kcal/100g
                  </span>
                </div>
                <div className="w-full bg-orange-200 rounded-full h-2">
                  <div 
                    className="bg-orange-600 h-2 rounded-full" 
                    style={{ width: `${Math.min(((Number(mealLog.calories_consumed) || 0) / 400) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-orange-600">
                  Porción típica: 200-400 kcal
                </p>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-3">📈 Análisis Nutricional</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-purple-700">Densidad de hierro:</span>
                  <span className={`font-medium ${ironPer100g > 2 ? 'text-green-600' : ironPer100g > 1 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {ironPer100g > 2 ? 'Alta' : ironPer100g > 1 ? 'Media' : 'Baja'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-700">Calidad nutricional:</span>
                  <span className={`font-medium ${(Number(mealLog.iron_consumed_mg) || 0) > 5 ? 'text-green-600' : (Number(mealLog.iron_consumed_mg) || 0) > 2 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {(Number(mealLog.iron_consumed_mg) || 0) > 5 ? 'Excelente' : (Number(mealLog.iron_consumed_mg) || 0) > 2 ? 'Buena' : 'Regular'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-700">Aporte diario:</span>
                  <span className="font-medium text-purple-900">
                    {(((Number(mealLog.iron_consumed_mg) || 0) / 10) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">ℹ️ Información del Sistema</h4>
              <p className="text-xs text-gray-600">
                Este cálculo fue realizado automáticamente por el sistema utilizando:
                la edad del paciente, el rango de edad correspondiente, el tamaño de porción 
                apropiado y la composición nutricional exacta del platillo seleccionado.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default function MealLogsPage() {
  const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
  const [paginationInfo, setPaginationInfo] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedMealLog, setSelectedMealLog] = useState<MealLog | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { showSuccess, showError, showConfirmDelete, showLoading, showToast } = useSweetAlert();

  // Función debounced para búsqueda
  const debouncedSearch = useCallback((term: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      // Solo buscar si hay al menos 3 caracteres o si está vacío (para mostrar todos)
      if (term.trim().length >= 3 || term.trim().length === 0) {
        fetchMealLogs(1, term); // Resetear a página 1 en nueva búsqueda
      }
    }, 500); // Esperar 500ms después de que el usuario deje de escribir
  }, []); // Sin dependencias para evitar recreación

  const fetchMealLogs = useCallback(async (page: number = 1, search?: string) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });
      
      if (search && search.trim()) {
        params.append('search', search.trim());
      }
      
      const response = await api.get(`/meal-logs?${params.toString()}`);
      const result: PaginatedMealLogs = response.data;
      
      setMealLogs(result.data);
      setPaginationInfo({
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar meal logs');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMealLogs();
  }, [fetchMealLogs]);

  useEffect(() => {
    debouncedSearch(searchTerm);
    
    // Cleanup function para limpiar el timeout cuando el componente se desmonte
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, debouncedSearch]);

  const handleCreate = () => {
    setIsCreateModalOpen(true);
  };

  const handleSave = async (data: CreateMealLogData) => {
    try {
      showLoading('Calculando nutrientes...', 'El sistema está analizando el platillo y calculando los valores nutricionales automáticamente');
      
      await api.post('/meal-logs', data);
      setIsCreateModalOpen(false);
      
      await showSuccess(
        '¡Cálculo completado!', 
        'El registro de comida ha sido creado con cálculos nutricionales automáticos.',
        4000
      );
      
      fetchMealLogs(paginationInfo.page, searchTerm);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al crear meal log';
      await showError('Error en el cálculo', errorMessage);
      setError(errorMessage);
    }
  };

  const handleViewDetail = (mealLog: MealLog) => {
    setSelectedMealLog(mealLog);
    setIsDetailModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const mealLog = mealLogs.find(log => log.id === id);
    if (!mealLog) return;

    const result = await showConfirmDelete(
      `${mealLog.patient.nombre} - ${mealLog.dish.name}`, 
      'registro de comida'
    );
    
    if (result.isConfirmed) {
      try {
        await api.delete(`/meal-logs/${id}`);
        await showToast('success', 'Registro eliminado exitosamente');
        fetchMealLogs(paginationInfo.page, searchTerm);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Error al eliminar meal log';
        await showError('Error al eliminar', errorMessage);
        setError(errorMessage);
      }
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= paginationInfo.totalPages) {
      fetchMealLogs(newPage, searchTerm);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Preparar datos para gráficos (usar solo los datos actuales visibles)
  const chartData = {
    labels: mealLogs.slice(0, 10).map(log => 
      `${log.patient.nombre.split(' ')[0]} - ${new Date(log.date).toLocaleDateString()}`
    ),
    datasets: [
      {
        label: 'Hierro consumido (mg)',
        data: mealLogs.slice(0, 10).map(log => Number(log.iron_consumed_mg) || 0),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1,
      },
    ],
  };

  const lineChartData = {
    labels: mealLogs.slice(0, 10).map(log => 
      new Date(log.date).toLocaleDateString()
    ),
    datasets: [
      {
        label: 'Hierro promedio (mg)',
        data: mealLogs.slice(0, 10).map(log => Number(log.iron_consumed_mg) || 0),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Calorías (÷10)',
        data: mealLogs.slice(0, 10).map(log => (Number(log.calories_consumed) || 0) / 10),
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
      },
    ],
  };

  if (isLoading && mealLogs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-2">Cargando meal logs...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">📊 Meal Logs - Cálculo Nutricional Automático</h1>
        <button
          onClick={handleCreate}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Nuevo Meal Log
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Buscador */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Buscar por paciente o platillo:
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Escriba al menos 3 caracteres para buscar..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {isLoading && (
              <div className="absolute right-3 top-2.5">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
              </div>
            )}
          </div>
          {searchTerm && (
            <p className="text-xs text-gray-500 mt-1">
              {searchTerm.trim().length < 3 ? (
                `Escriba ${3 - searchTerm.trim().length} carácter(es) más para buscar`
              ) : paginationInfo.total > 0 ? (
                `Se encontraron ${paginationInfo.total} resultado(s)`
              ) : (
                'No se encontraron resultados'
              )}
            </p>
          )}
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">{paginationInfo.total}</div>
          <div className="text-sm text-gray-600">Total Registros</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-red-600">
            {mealLogs.length > 0 ? (mealLogs.reduce((sum, log) => sum + (Number(log.iron_consumed_mg) || 0), 0) / mealLogs.length).toFixed(1) : '0.0'}mg
          </div>
          <div className="text-sm text-gray-600">Hierro Promedio (Página)</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-yellow-600">
            {mealLogs.length > 0 ? Math.round(mealLogs.reduce((sum, log) => sum + (Number(log.calories_consumed) || 0), 0) / mealLogs.length) : 0}
          </div>
          <div className="text-sm text-gray-600">Calorías Promedio (Página)</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">
            {mealLogs.length > 0 ? Math.round(mealLogs.reduce((sum, log) => sum + (Number(log.grams_served) || 0), 0) / mealLogs.length) : 0}g
          </div>
          <div className="text-sm text-gray-600">Porción Promedio (Página)</div>
        </div>
      </div>

      {/* Gráficos */}
      {mealLogs.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              📊 Hierro Consumido por Registro
            </h3>
            <div className="h-64">
              <Bar 
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Hierro (mg)'
                      }
                    }
                  }
                }}
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              📈 Tendencia Nutricional
            </h3>
            <div className="h-64">
              <Line 
                data={lineChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Lista de meal logs */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md mb-6">
        {mealLogs.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {mealLogs.map((log) => (
              <li key={log.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">
                        {log.patient.nombre} - {log.dish.name}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {(Number(log.iron_consumed_mg) || 0).toFixed(1)}mg Fe
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          {(Number(log.calories_consumed) || 0).toFixed(0)} kcal
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {Number(log.grams_served) || 0}g
                        </span>
                      </div>
                    </div>
                    <div className="mt-1 text-sm text-gray-600">
                      Calculado automáticamente el {new Date(log.date).toLocaleDateString('es-ES')}
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Creado: {new Date(log.created_at).toLocaleDateString()} • 
                      Edad: {new Date().getFullYear() - log.patient.birthYear} años
                    </div>
                  </div>
                  <div className="ml-4 flex items-center space-x-2">
                    <button
                      onClick={() => handleViewDetail(log)}
                      className="text-green-600 hover:text-green-900"
                      title="Ver detalles del cálculo"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(log.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Eliminar"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12 text-gray-500">
            {searchTerm ? (
              <div>
                <div className="text-4xl mb-4">🔍</div>
                <p className="text-lg mb-2">No se encontraron resultados</p>
                <p className="text-sm">Intenta con otro término de búsqueda</p>
              </div>
            ) : (
              <div>
                <div className="text-4xl mb-4">📊</div>
                <p className="text-lg mb-2">No hay registros de comida</p>
                <p className="text-sm">Crea el primer registro para comenzar</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Paginación */}
      {paginationInfo.totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(paginationInfo.page - 1)}
              disabled={paginationInfo.page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => handlePageChange(paginationInfo.page + 1)}
              disabled={paginationInfo.page === paginationInfo.totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando{' '}
                <span className="font-medium">
                  {(paginationInfo.page - 1) * paginationInfo.limit + 1}
                </span>{' '}
                a{' '}
                <span className="font-medium">
                  {Math.min(paginationInfo.page * paginationInfo.limit, paginationInfo.total)}
                </span>{' '}
                de{' '}
                <span className="font-medium">{paginationInfo.total}</span> registros
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(paginationInfo.page - 1)}
                  disabled={paginationInfo.page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                
                {/* Números de página */}
                {Array.from({ length: Math.min(5, paginationInfo.totalPages) }, (_, i) => {
                  let pageNumber;
                  if (paginationInfo.totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (paginationInfo.page <= 3) {
                    pageNumber = i + 1;
                  } else if (paginationInfo.page >= paginationInfo.totalPages - 2) {
                    pageNumber = paginationInfo.totalPages - 4 + i;
                  } else {
                    pageNumber = paginationInfo.page - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pageNumber === paginationInfo.page
                          ? 'z-10 bg-green-50 border-green-500 text-green-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(paginationInfo.page + 1)}
                  disabled={paginationInfo.page === paginationInfo.totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      <CreateMealLogModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleSave}
      />

      <DetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        mealLog={selectedMealLog}
      />
    </div>
  );
}
