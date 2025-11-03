'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Ingredient {
  id: string;
  name: string;
  iron_mg_per_100g: number;
  calories_per_100g: number;
  protein_g_per_100g?: number;
  carbs_g_per_100g?: number;
  created_at: string;
}

interface IngredientFormData {
  name: string;
  iron_mg_per_100g: number;
  calories_per_100g: number;
  protein_g_per_100g?: number;
  carbs_g_per_100g?: number;
}

interface IngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: IngredientFormData) => void;
  ingredient?: Ingredient | null;
}

const IngredientModal = ({ isOpen, onClose, onSave, ingredient }: IngredientModalProps) => {
  const [formData, setFormData] = useState<IngredientFormData>({
    name: '',
    iron_mg_per_100g: 0,
    calories_per_100g: 0,
    protein_g_per_100g: 0,
    carbs_g_per_100g: 0,
  });

  useEffect(() => {
    if (ingredient) {
      setFormData({
        name: ingredient.name,
        iron_mg_per_100g: ingredient.iron_mg_per_100g,
        calories_per_100g: ingredient.calories_per_100g,
        protein_g_per_100g: ingredient.protein_g_per_100g || 0,
        carbs_g_per_100g: ingredient.carbs_g_per_100g || 0,
      });
    } else {
      setFormData({
        name: '',
        iron_mg_per_100g: 0,
        calories_per_100g: 0,
        protein_g_per_100g: 0,
        carbs_g_per_100g: 0,
      });
    }
  }, [ingredient]);

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
              {ingredient ? 'Editar Ingrediente' : 'Nuevo Ingrediente'}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Ingrediente
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Sangresita de pollo (cocida)"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hierro (mg por 100g)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.iron_mg_per_100g}
                onChange={(e) => setFormData({ ...formData, iron_mg_per_100g: parseFloat(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Calorías (kcal por 100g)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.calories_per_100g}
                onChange={(e) => setFormData({ ...formData, calories_per_100g: parseFloat(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proteínas (g por 100g)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.protein_g_per_100g}
                onChange={(e) => setFormData({ ...formData, protein_g_per_100g: parseFloat(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Carbohidratos (g por 100g)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.carbs_g_per_100g}
                onChange={(e) => setFormData({ ...formData, carbs_g_per_100g: parseFloat(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              {ingredient ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function IngredientsPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/ingredients');
      setIngredients(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar ingredientes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedIngredient(null);
    setIsModalOpen(true);
  };

  const handleEdit = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setIsModalOpen(true);
  };

  const handleSave = async (data: IngredientFormData) => {
    try {
      if (selectedIngredient) {
        await api.patch(`/ingredients/${selectedIngredient.id}`, data);
      } else {
        await api.post('/ingredients', data);
      }
      setIsModalOpen(false);
      fetchIngredients();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar ingrediente');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este ingrediente?')) {
      try {
        await api.delete(`/ingredients/${id}`);
        fetchIngredients();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error al eliminar ingrediente');
      }
    }
  };

  const filteredIngredients = ingredients.filter(ingredient =>
    ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div className="text-center">Cargando ingredientes...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">🥘 Gestión de Ingredientes</h1>
        <button
          onClick={handleCreate}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Nuevo Ingrediente
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
          placeholder="Buscar ingredientes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">{ingredients.length}</div>
          <div className="text-sm text-gray-600">Total Ingredientes</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-red-600">
            {ingredients.length > 0 ? Math.max(...ingredients.map(i => Number(i.iron_mg_per_100g) || 0)).toFixed(1) : '0.0'}mg
          </div>
          <div className="text-sm text-gray-600">Mayor Hierro (100g)</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-yellow-600">
            {ingredients.length > 0 ? Math.max(...ingredients.map(i => Number(i.calories_per_100g) || 0)).toFixed(0) : '0'}kcal
          </div>
          <div className="text-sm text-gray-600">Más Calórico (100g)</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">
            {ingredients.length > 0 ? (ingredients.reduce((sum, i) => sum + (Number(i.iron_mg_per_100g) || 0), 0) / ingredients.length).toFixed(1) : '0.0'}mg
          </div>
          <div className="text-sm text-gray-600">Promedio Hierro</div>
        </div>
      </div>

      {/* Tabla de ingredientes */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ingrediente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hierro (mg/100g)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Calorías (kcal/100g)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Proteínas (g/100g)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredIngredients.map((ingredient) => (
              <tr key={ingredient.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{ingredient.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {(Number(ingredient.iron_mg_per_100g) || 0).toFixed(1)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {(Number(ingredient.calories_per_100g) || 0).toFixed(0)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {ingredient.protein_g_per_100g ? (Number(ingredient.protein_g_per_100g) || 0).toFixed(1) : 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(ingredient)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(ingredient.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredIngredients.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No se encontraron ingredientes
          </div>
        )}
      </div>

      <IngredientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        ingredient={selectedIngredient}
      />
    </div>
  );
}
