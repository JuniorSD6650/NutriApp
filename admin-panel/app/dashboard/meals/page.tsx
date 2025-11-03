'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';

interface MealRecord {
  id: string;
  url_foto: string;
  fecha: string;
  hierro_mg: number;
  calorias: number;
  json_nutrientes: {
    proteinas: number;
    carbohidratos: number;
    grasas: number;
    fibra: number;
    vitamina_c: number;
    calcio: number;
  };
  nino: {
    id: string;
    nombre: string;
  };
}

export default function MealsPage() {
  const [meals, setMeals] = useState<MealRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedChild, setSelectedChild] = useState<string>('');
  const router = useRouter();

  const mealsPerPage = 10;

  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/dashboard/nutrition');
      setMeals(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar registros de comida');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMeals = selectedChild 
    ? meals.filter(meal => meal.nino.id === selectedChild)
    : meals;

  const totalPages = Math.ceil(filteredMeals.length / mealsPerPage);
  const startIndex = (currentPage - 1) * mealsPerPage;
  const currentMeals = filteredMeals.slice(startIndex, startIndex + mealsPerPage);

  const uniqueChildren = Array.from(new Set(meals.filter(meal => meal.nino && meal.nino.id).map(meal => meal.nino.id)))
    .map(id => meals.find(meal => meal.nino && meal.nino.id === id)?.nino)
    .filter(Boolean);

  const handleMealClick = (meal: MealRecord) => {
    // Mostrar modal con detalles en lugar de navegar a página individual
    setSelectedMeal(meal);
    setIsModalOpen(true);
  };

  const [selectedMeal, setSelectedMeal] = useState<MealRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMeal(null);
  };

  if (isLoading) {
    return <div className="text-center">Cargando registros de comida...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">🍎 Registros de Comida</h1>
        <div className="text-sm text-gray-500">
          Total: {filteredMeals.length} registros
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filtros */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Filtrar por niño:</label>
          <select
            value={selectedChild}
            onChange={(e) => {
              setSelectedChild(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="">Todos los niños</option>
            {uniqueChildren.map((child) => (
              <option key={child?.id} value={child?.id}>
                {child?.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de registros */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {currentMeals.map((meal) => (
            <li 
              key={meal.id}
              onClick={() => handleMealClick(meal)}
              className="cursor-pointer hover:bg-gray-50 transition-colors duration-150"
            >
              <div className="px-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                      <img
                        className="h-12 w-12 rounded-lg object-cover"
                        src={meal.url_foto || '/placeholder-food.jpg'}
                        alt="Comida"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjIwIiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOUI5QjlCIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn42OPC90ZXh0Pgo8L3N2Zz4K';
                        }}
                      />
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {meal.nino?.nombre || 'Niño no especificado'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(meal.fecha).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {meal.calorias} kcal
                          </div>
                          <div className="text-sm text-gray-500">
                            {typeof meal.hierro_mg === 'number' ? meal.hierro_mg.toFixed(1) : Number(meal.hierro_mg || 0).toFixed(1)} mg hierro
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 flex space-x-4 text-xs text-gray-500">
                        <span>Proteínas: {Number(meal.json_nutrientes.proteinas || 0)}g</span>
                        <span>Carbohidratos: {Number(meal.json_nutrientes.carbohidratos || 0)}g</span>
                        <span>Grasas: {Number(meal.json_nutrientes.grasas || 0)}g</span>
                      </div>
                    </div>
                    <div className="ml-4 text-gray-400">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {currentMeals.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No hay registros de comida disponibles
          </div>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <nav className="flex space-x-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 text-sm rounded-md ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Modal para mostrar detalles de la comida */}
      {isModalOpen && selectedMeal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  🍎 Detalle del Registro de Comida
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Imagen */}
                <div>
                  <img
                    className="w-full h-48 object-cover rounded-lg"
                    src={selectedMeal.url_foto}
                    alt="Comida"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTEwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDAiIGZpbGw9IiM5QjlCOUIiIHRleHQtYW5jaG9yPSJtaWRkbGUiPvCfjY48L3RleHQ+Cjwvc3ZnPgo=';
                    }}
                  />
                </div>
                
                {/* Información */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Niño:</label>
                    <p className="text-lg font-medium text-gray-900">{selectedMeal.nino?.nombre || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha:</label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedMeal.fecha).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Calorías:</label>
                    <p className="text-lg font-medium text-blue-600">{selectedMeal.calorias} kcal</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Hierro:</label>
                    <p className="text-lg font-medium text-red-600">
                      {typeof selectedMeal.hierro_mg === 'number' ? selectedMeal.hierro_mg.toFixed(1) : Number(selectedMeal.hierro_mg || 0).toFixed(1)} mg
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Información nutricional */}
              <div className="mt-6">
                <h4 className="text-md font-medium text-gray-900 mb-3">Información Nutricional:</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-blue-50 p-3 rounded-md">
                    <span className="font-medium text-blue-800">Proteínas:</span>
                    <p className="text-blue-600 text-lg">{Number(selectedMeal.json_nutrientes.proteinas || 0)}g</p>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-md">
                    <span className="font-medium text-yellow-800">Carbohidratos:</span>
                    <p className="text-yellow-600 text-lg">{Number(selectedMeal.json_nutrientes.carbohidratos || 0)}g</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-md">
                    <span className="font-medium text-purple-800">Grasas:</span>
                    <p className="text-purple-600 text-lg">{Number(selectedMeal.json_nutrientes.grasas || 0)}g</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-md">
                    <span className="font-medium text-green-800">Fibra:</span>
                    <p className="text-green-600 text-lg">{Number(selectedMeal.json_nutrientes.fibra || 0)}g</p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-md">
                    <span className="font-medium text-orange-800">Vitamina C:</span>
                    <p className="text-orange-600 text-lg">{Number(selectedMeal.json_nutrientes.vitamina_c || 0)}mg</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <span className="font-medium text-gray-800">Calcio:</span>
                    <p className="text-gray-600 text-lg">{Number(selectedMeal.json_nutrientes.calcio || 0)}mg</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-yellow-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
