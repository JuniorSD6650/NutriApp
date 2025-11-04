'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { Doughnut } from 'react-chartjs-2';
import Swal from 'sweetalert2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Ingredient {
  id: string;
  name: string;
  iron_mg_per_100g: number;
  calories_per_100g: number;
}

interface DishComposition {
  id: string;
  grams: number;
  ingredient: Ingredient;
}

interface Dish {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  compositions: DishComposition[];
  created_at: string;
}

interface DishFormData {
  name: string;
  description?: string;
}

interface DishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: DishFormData) => void;
  dish?: Dish | null;
}

interface CompositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  dish: Dish | null;
  onRefresh: () => void;
}

const DishModal = ({ isOpen, onClose, onSave, dish }: DishModalProps) => {
  const [formData, setFormData] = useState<DishFormData>({
    name: '',
    description: '',
  });

  useEffect(() => {
    if (dish) {
      setFormData({
        name: dish.name,
        description: dish.description || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
      });
    }
  }, [dish]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {dish ? 'Editar Platillo' : 'Nuevo Platillo'}
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
                Nombre del Platillo
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Guiso de Sangresita"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descripción del platillo..."
                rows={3}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {dish ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CompositionModal = ({ isOpen, onClose, dish, onRefresh }: CompositionModalProps) => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selectedIngredient, setSelectedIngredient] = useState('');
  const [grams, setGrams] = useState(0);
  const [compositions, setCompositions] = useState<DishComposition[]>([]);
  const [isAddingIngredient, setIsAddingIngredient] = useState(false);

  // Función para refrescar las composiciones desde el backend
  const refreshCompositions = async () => {
    if (!dish) return;
    try {
      const response = await api.get(`/dish-compositions/dish/${dish.id}`);
      setCompositions(response.data);
    } catch (error) {
      console.error('Error refreshing compositions:', error);
    }
  };

  useEffect(() => {
    if (isOpen && dish) {
      fetchIngredients();
      refreshCompositions(); // Usar la función para refrescar desde el backend
    }
  }, [isOpen, dish]);

  const fetchIngredients = async () => {
    try {
      const response = await api.get('/ingredients');
      setIngredients(response.data);
    } catch (error) {
      console.error('Error fetching ingredients:', error);
    }
  };

  const addComposition = async () => {
    if (!selectedIngredient || grams <= 0 || !dish) return;

    try {
      setIsAddingIngredient(true);
      const data = {
        dishId: dish.id,
        ingredientId: selectedIngredient,
        grams: grams,
      };
      
      await api.post('/dish-compositions', data);
      
      // Refrescar las composiciones desde el backend
      await refreshCompositions();
      
      setSelectedIngredient('');
      setGrams(0);
      
      // Refrescar la lista principal también
      onRefresh();

      // Notificación de éxito discreta
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      });

      Toast.fire({
        icon: 'success',
        title: 'Ingrediente agregado exitosamente'
      });

    } catch (error) {
      console.error('Error adding composition:', error);
      await Swal.fire({
        title: 'Error',
        text: 'No se pudo agregar el ingrediente. Inténtelo nuevamente.',
        icon: 'error',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setIsAddingIngredient(false);
    }
  };

  const removeComposition = async (compositionId: string, ingredientName: string) => {
    try {
      const result = await Swal.fire({
        title: '¿Remover ingrediente?',
        html: `
          <div class="text-center">
            <div class="text-4xl mb-3">🗑️</div>
            <p class="mb-2">¿Está seguro de remover el ingrediente:</p>
            <p class="font-semibold text-lg">"${ingredientName}"</p>
            <p class="mt-2 text-sm text-gray-600">del platillo "${dish?.name}"?</p>
          </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, remover',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#EF4444',
        cancelButtonColor: '#6B7280',
      });

      if (result.isConfirmed) {
        await api.delete(`/dish-compositions/${compositionId}`);
        
        // Refrescar las composiciones desde el backend
        await refreshCompositions();
        
        // Refrescar la lista principal también
        onRefresh();

        // Notificación de éxito discreta
        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        });

        Toast.fire({
          icon: 'success',
          title: 'Ingrediente removido exitosamente'
        });
      }
    } catch (error) {
      console.error('Error removing composition:', error);
      await Swal.fire({
        title: 'Error',
        text: 'No se pudo remover el ingrediente. Inténtelo nuevamente.',
        icon: 'error',
        confirmButtonColor: '#EF4444',
      });
    }
  };

  // Preparar datos para el gráfico circular
  const chartData = compositions.length > 0 ? {
    labels: compositions.map(comp => comp.ingredient.name),
    datasets: [
      {
        data: compositions.map(comp => comp.grams),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#FF6384',
          '#C9CBCF',
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  } : null;

  const totalGrams = compositions.reduce((sum, comp) => sum + comp.grams, 0);
  const totalIron = compositions.reduce((sum, comp) => 
    sum + (comp.ingredient.iron_mg_per_100g / 100) * comp.grams, 0
  );
  const totalCalories = compositions.reduce((sum, comp) => 
    sum + (comp.ingredient.calories_per_100g / 100) * comp.grams, 0
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-6xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            🍽️ Composición del Platillo: {dish?.name}
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
          {/* Panel izquierdo: Gestión de ingredientes */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Agregar Ingrediente</h4>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ingrediente
                </label>
                <select
                  value={selectedIngredient}
                  onChange={(e) => setSelectedIngredient(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar ingrediente...</option>
                  {ingredients.map((ingredient) => (
                    <option key={ingredient.id} value={ingredient.id}>
                      {ingredient.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad (gramos)
                </label>
                <input
                  type="number"
                  value={grams}
                  onChange={(e) => setGrams(parseInt(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
              </div>

              <button
                onClick={addComposition}
                disabled={!selectedIngredient || grams <= 0 || isAddingIngredient}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-300"
              >
                {isAddingIngredient ? 'Agregando...' : 'Agregar Ingrediente'}
              </button>
            </div>

            {/* Lista de ingredientes */}
            <div className="border rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-3">Ingredientes Actuales</h5>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {compositions.map((comp) => (
                  <div key={comp.id} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{comp.ingredient.name}</div>
                      <div className="text-xs text-gray-500">
                        {comp.grams}g • {((comp.ingredient.iron_mg_per_100g / 100) * comp.grams).toFixed(1)}mg hierro
                      </div>
                    </div>
                    <button
                      onClick={() => removeComposition(comp.id, comp.ingredient.name)}
                      className="text-red-600 hover:text-red-800 ml-2"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {compositions.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No hay ingredientes agregados
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Panel derecho: Visualización circular y estadísticas */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Visualización del Plato</h4>
            
            {chartData ? (
              <div className="space-y-6">
                {/* Gráfico circular como plato */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="relative h-64 flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-72 h-72 bg-white rounded-full shadow-lg border-8 border-gray-200 flex items-center justify-center">
                        <Doughnut 
                          data={chartData}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            cutout: '20%',
                            plugins: {
                              legend: {
                                display: false,
                              },
                              tooltip: {
                                callbacks: {
                                  label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed;
                                    const percentage = ((value / totalGrams) * 100).toFixed(1);
                                    return `${label}: ${value}g (${percentage}%)`;
                                  }
                                }
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <p className="text-center text-sm text-gray-600">
                      🍽️ Representación visual del plato
                    </p>
                  </div>
                </div>

                {/* Estadísticas nutricionales */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{totalGrams}g</div>
                    <div className="text-sm text-blue-800">Peso Total</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{totalIron.toFixed(1)}mg</div>
                    <div className="text-sm text-red-800">Hierro Total</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{totalCalories.toFixed(0)}</div>
                    <div className="text-sm text-yellow-800">Calorías</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {((totalIron / totalGrams) * 100).toFixed(1)}
                    </div>
                    <div className="text-sm text-green-800">mg Fe/100g</div>
                  </div>
                </div>

                {/* Leyenda de ingredientes */}
                <div className="space-y-2">
                  <h5 className="font-medium text-gray-900">Proporciones</h5>
                  {compositions.map((comp, index) => (
                    <div key={comp.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <div 
                          className="w-4 h-4 rounded mr-2"
                          style={{ backgroundColor: chartData.datasets[0].backgroundColor[index] }}
                        ></div>
                        <span>{comp.ingredient.name}</span>
                      </div>
                      <span className="font-medium">
                        {comp.grams}g ({((comp.grams / totalGrams) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <div className="text-6xl mb-4">🍽️</div>
                <p>Agrega ingredientes para ver la visualización del plato</p>
              </div>
            )}
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

interface PaginatedDishes {
  data: Dish[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function DishesPage() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [paginationInfo, setPaginationInfo] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCompositionModalOpen, setIsCompositionModalOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => {
    fetchDishes();
  }, []);

  const fetchDishes = async (page: number = 1, search?: string, status?: string) => {
    try {
      setIsLoading(true);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });
      
      if (search && search.trim()) {
        params.append('search', search.trim());
      }
      
      if (status) {
        params.append('status', status);
      }
      
      const response = await api.get(`/dishes?${params.toString()}`);
      const result: PaginatedDishes = response.data;
      
      setDishes(result.data || []);
      setPaginationInfo({
        total: result.total || 0,
        page: result.page || 1,
        limit: result.limit || 10,
        totalPages: result.totalPages || 0,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar platillos');
      setDishes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= paginationInfo.totalPages) {
      const status = showInactive ? '' : 'active';
      fetchDishes(newPage, searchTerm, status);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    const status = showInactive ? '' : 'active';
    fetchDishes(1, value, status);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setShowInactive(checked);
    const status = checked ? '' : 'active';
    fetchDishes(1, searchTerm, status);
  };

  const handleCreate = () => {
    setSelectedDish(null);
    setIsModalOpen(true);
  };

  const handleEdit = (dish: Dish) => {
    setSelectedDish(dish);
    setIsModalOpen(true);
  };

  const handleViewComposition = (dish: Dish) => {
    setSelectedDish(dish);
    setIsCompositionModalOpen(true);
  };

  const handleSave = async (data: DishFormData) => {
    try {
      let response;
      if (selectedDish) {
        response = await api.patch(`/dishes/${selectedDish.id}`, data);
        await Swal.fire({
          title: '¡Actualizado!',
          text: `El platillo "${data.name}" ha sido actualizado exitosamente.`,
          icon: 'success',
          confirmButtonText: 'Continuar',
          confirmButtonColor: '#10B981',
          timer: 3000,
          timerProgressBar: true,
        });
      } else {
        response = await api.post('/dishes', data);
        await Swal.fire({
          title: '¡Creado!',
          text: `El platillo "${data.name}" ha sido creado exitosamente.`,
          icon: 'success',
          confirmButtonText: 'Continuar',
          confirmButtonColor: '#10B981',
          timer: 3000,
          timerProgressBar: true,
        });
      }
      setIsModalOpen(false);
      fetchDishes();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al guardar platillo';
      await Swal.fire({
        title: 'Error',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#EF4444',
      });
      setError(errorMessage);
    }
  };

  const handleToggleStatus = async (id: string, dishName: string, currentStatus: boolean) => {
    try {
      const action = currentStatus ? 'desactivar' : 'activar';
      const actionPast = currentStatus ? 'desactivado' : 'activado';
      
      const result = await Swal.fire({
        title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} platillo?`,
        html: `
          <div class="text-center">
            <div class="text-6xl mb-4">${currentStatus ? '⏸️' : '▶️'}</div>
            <p class="mb-2">¿Está seguro de que desea ${action} el platillo:</p>
            <p class="font-semibold text-lg text-gray-800">"${dishName}"</p>
            <p class="mt-3 text-sm text-gray-600">
              ${currentStatus 
                ? 'El platillo no estará disponible para nuevos registros, pero los existentes se mantendrán.'
                : 'El platillo volverá a estar disponible para nuevos registros.'
              }
            </p>
          </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: `Sí, ${action}`,
        cancelButtonText: 'Cancelar',
        confirmButtonColor: currentStatus ? '#F59E0B' : '#10B981',
        cancelButtonColor: '#6B7280',
      });

      if (result.isConfirmed) {
        const response = await api.patch(`/dishes/${id}/toggle-status`);
        
        await Swal.fire({
          title: `¡${actionPast.charAt(0).toUpperCase() + actionPast.slice(1)}!`,
          text: response.data.message,
          icon: 'success',
          confirmButtonText: 'Continuar',
          confirmButtonColor: '#10B981',
          timer: 3000,
          timerProgressBar: true,
        });
        
        fetchDishes();
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || `Error al cambiar estado del platillo`;
      await Swal.fire({
        title: 'Error',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#EF4444',
      });
    }
  };

  const handleDelete = async (id: string, dishName: string) => {
    try {
      // Primero verificar dependencias
      const dependenciesResponse = await api.get(`/dishes/${id}/dependencies`);
      const { canDelete, canDeactivate, mealLogsCount, message, currentStatus } = dependenciesResponse.data;

      if (!canDelete) {
        const result = await Swal.fire({
          title: '⚠️ No se puede eliminar',
          html: `
            <div class="text-left">
              <p class="mb-3"><strong>El platillo "${dishName}" no puede ser eliminado porque:</strong></p>
              <p class="mb-2">• Tiene <strong>${mealLogsCount}</strong> registro(s) de comida asociados</p>
              <p class="mb-4">• ${message}</p>
              <p class="text-sm text-gray-600 mb-4">
                <strong>Alternativa:</strong> Puede desactivar el platillo en lugar de eliminarlo. 
                Esto mantendrá los registros existentes pero evitará que se creen nuevos.
              </p>
            </div>
          `,
          icon: 'warning',
          showDenyButton: true,
          showCancelButton: true,
          confirmButtonText: currentStatus ? '⏸️ Desactivar' : '▶️ Activar',
          denyButtonText: '📋 Ver Registros',
          cancelButtonText: 'Cancelar',
          confirmButtonColor: currentStatus ? '#F59E0B' : '#10B981',
          denyButtonColor: '#3B82F6',
          cancelButtonColor: '#6B7280',
        });

        if (result.isConfirmed) {
          // Desactivar/Activar el platillo
          await handleToggleStatus(id, dishName, currentStatus);
        } else if (result.isDenied) {
          // Redirigir a meal logs (funcionalidad futura)
          await Swal.fire({
            title: 'Funcionalidad próximamente',
            text: 'La redirección a registros de comida estará disponible pronto.',
            icon: 'info',
            confirmButtonColor: '#3B82F6',
          });
        }
        return;
      }

      // Si se puede eliminar, mostrar confirmación normal
      const result = await Swal.fire({
        title: '¿Eliminar platillo?',
        html: `
          <div class="text-center">
            <div class="text-6xl mb-4">🗑️</div>
            <p class="mb-2">¿Está seguro de que desea eliminar el platillo:</p>
            <p class="font-semibold text-lg text-gray-800">"${dishName}"</p>
            <p class="mt-3 text-sm text-gray-600">Esta acción no se puede deshacer.</p>
          </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#EF4444',
        cancelButtonColor: '#6B7280',
        focusCancel: true,
      });

      if (result.isConfirmed) {
        // Mostrar loading
        Swal.fire({
          title: 'Eliminando...',
          text: 'Por favor espere',
          icon: 'info',
          allowOutsideClick: false,
          showConfirmButton: false,
          willOpen: () => {
            Swal.showLoading();
          },
        });

        await api.delete(`/dishes/${id}`);
        
        await Swal.fire({
          title: '¡Eliminado!',
          text: `El platillo "${dishName}" ha sido eliminado exitosamente.`,
          icon: 'success',
          confirmButtonText: 'Continuar',
          confirmButtonColor: '#10B981',
          timer: 3000,
          timerProgressBar: true,
        });
        
        fetchDishes();
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al eliminar platillo';
      await Swal.fire({
        title: 'Error al eliminar',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#EF4444',
      });
      setError(errorMessage);
    }
  };

  const filteredDishes = dishes.filter(dish => {
    const matchesSearch = dish.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = showInactive ? true : dish.is_active;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return <div className="text-center">Cargando platillos...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">🍽️ Gestión de Platillos</h1>
        <button
          onClick={handleCreate}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Nuevo Platillo
        </button>
      </div>

      {/* Filtros */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar platillos:
            </label>
            <input
              type="text"
              placeholder="Nombre o descripción..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center justify-start">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={handleStatusFilterChange}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm text-gray-700">Mostrar platillos inactivos</span>
            </label>
          </div>
        </div>
        {searchTerm && (
          <p className="text-xs text-gray-500 mt-2">
            {paginationInfo.total > 0 
              ? `Se encontraron ${paginationInfo.total} resultado(s)`
              : 'No se encontraron resultados'
            }
          </p>
        )}
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">{paginationInfo.total}</div>
          <div className="text-sm text-gray-600">Total Platillos</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">
            {dishes.filter(d => d.is_active).length}
          </div>
          <div className="text-sm text-gray-600">Activos</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-red-600">
            {dishes.filter(d => !d.is_active).length}
          </div>
          <div className="text-sm text-gray-600">Inactivos</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-yellow-600">
            {dishes.filter(d => d.compositions?.length > 0).length}
          </div>
          <div className="text-sm text-gray-600">Con Receta</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-purple-600">
            {dishes.filter(d => !d.compositions?.length).length}
          </div>
          <div className="text-sm text-gray-600">Sin Receta</div>
        </div>
      </div>

      {/* Lista de platillos */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md mb-6">
        {dishes.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {dishes.map((dish) => {
              const totalIngredients = dish.compositions?.length || 0;
              const totalIron = dish.compositions?.reduce((sum, comp) => 
                sum + (comp.ingredient.iron_mg_per_100g / 100) * comp.grams, 0
              ) || 0;
              
              return (
                <li key={dish.id} className={`px-6 py-4 hover:bg-gray-50 ${!dish.is_active ? 'bg-gray-50 opacity-75' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <h3 className={`text-lg font-medium ${dish.is_active ? 'text-gray-900' : 'text-gray-500'}`}>
                            {dish.name}
                          </h3>
                          <div className="ml-3 flex items-center">
                            {dish.is_active ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircleIcon className="h-3 w-3 mr-1" />
                                Activo
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <XCircleIcon className="h-3 w-3 mr-1" />
                                Inactivo
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {totalIngredients} ingredientes
                          </span>
                          {totalIron > 0 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              {totalIron.toFixed(1)}mg hierro
                            </span>
                          )}
                        </div>
                      </div>
                      {dish.description && (
                        <p className={`mt-1 text-sm ${dish.is_active ? 'text-gray-600' : 'text-gray-400'}`}>
                          {dish.description}
                        </p>
                      )}
                      <div className="mt-2 text-xs text-gray-500">
                        Creado: {new Date(dish.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="ml-4 flex items-center space-x-2">
                      <button
                        onClick={() => handleViewComposition(dish)}
                        className="text-green-600 hover:text-green-900"
                        title="Ver composición"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(dish)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Editar"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(dish.id, dish.name, dish.is_active)}
                        className={`${dish.is_active ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}`}
                        title={dish.is_active ? 'Desactivar' : 'Activar'}
                      >
                        {dish.is_active ? (
                          <XCircleIcon className="h-5 w-5" />
                        ) : (
                          <CheckCircleIcon className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(dish.id, dish.name)}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">🍽️</div>
            <p className="text-lg mb-2">
              {showInactive 
                ? 'No se encontraron platillos'
                : 'No se encontraron platillos activos'
              }
            </p>
            <p className="text-sm">
              {searchTerm ? 'Intenta con otro término de búsqueda' : 'Crea tu primer platillo'}
            </p>
          </div>
        )}
      </div>

      {/* Paginación */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-gray-500">
          Mostrando {paginationInfo.page * paginationInfo.limit - paginationInfo.limit + 1} - {Math.min(paginationInfo.page * paginationInfo.limit, paginationInfo.total)} de {paginationInfo.total} platillos
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handlePageChange(paginationInfo.page - 1)}
            disabled={paginationInfo.page === 1}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            onClick={() => handlePageChange(paginationInfo.page + 1)}
            disabled={paginationInfo.page === paginationInfo.totalPages}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      </div>

      <DishModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        dish={selectedDish}
      />

      <CompositionModal
        isOpen={isCompositionModalOpen}
        onClose={() => setIsCompositionModalOpen(false)}
        dish={selectedDish}
        onRefresh={fetchDishes}
      />
    </div>
  );
}
