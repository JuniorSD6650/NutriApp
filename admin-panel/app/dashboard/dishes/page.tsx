'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { Doughnut } from 'react-chartjs-2';
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
    } catch (error) {
      console.error('Error adding composition:', error);
    } finally {
      setIsAddingIngredient(false);
    }
  };

  const removeComposition = async (compositionId: string) => {
    try {
      await api.delete(`/dish-compositions/${compositionId}`);
      
      // Refrescar las composiciones desde el backend
      await refreshCompositions();
      
      // Refrescar la lista principal también
      onRefresh();
    } catch (error) {
      console.error('Error removing composition:', error);
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
                      onClick={() => removeComposition(comp.id)}
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

export default function DishesPage() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCompositionModalOpen, setIsCompositionModalOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDishes();
  }, []);

  const fetchDishes = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/dishes');
      setDishes(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar platillos');
    } finally {
      setIsLoading(false);
    }
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
      if (selectedDish) {
        await api.patch(`/dishes/${selectedDish.id}`, data);
      } else {
        await api.post('/dishes', data);
      }
      setIsModalOpen(false);
      fetchDishes();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar platillo');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este platillo?')) {
      try {
        await api.delete(`/dishes/${id}`);
        fetchDishes();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error al eliminar platillo');
      }
    }
  };

  const filteredDishes = dishes.filter(dish =>
    dish.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Barra de búsqueda */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar platillos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">{dishes.length}</div>
          <div className="text-sm text-gray-600">Total Platillos</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">
            {dishes.filter(d => d.compositions?.length > 0).length}
          </div>
          <div className="text-sm text-gray-600">Con Receta</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-yellow-600">
            {Math.round(dishes.reduce((sum, d) => sum + (d.compositions?.length || 0), 0) / dishes.length) || 0}
          </div>
          <div className="text-sm text-gray-600">Ingredientes Promedio</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-purple-600">
            {dishes.filter(d => !d.compositions?.length).length}
          </div>
          <div className="text-sm text-gray-600">Sin Receta</div>
        </div>
      </div>

      {/* Lista de platillos */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredDishes.map((dish) => {
            const totalIngredients = dish.compositions?.length || 0;
            const totalIron = dish.compositions?.reduce((sum, comp) => 
              sum + (comp.ingredient.iron_mg_per_100g / 100) * comp.grams, 0
            ) || 0;
            
            return (
              <li key={dish.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">{dish.name}</h3>
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
                      <p className="mt-1 text-sm text-gray-600">{dish.description}</p>
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
                      onClick={() => handleDelete(dish.id)}
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

        {filteredDishes.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No se encontraron platillos
          </div>
        )}
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
