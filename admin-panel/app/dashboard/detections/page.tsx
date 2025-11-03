'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';

interface Detection {
  id: string;
  url_foto: string;
  fecha: string;
  confianza_ia: number;
  resultado_ia: string;
  nivel_alerta: string;
  parametros_detectados: {
    color_mucosa: string;
    saturacion_color: number;
    textura: string;
    vascularizacion: string;
    indice_palidez: number;
  };
  observaciones: string;
  nino: {
    id: string;
    nombre: string;
  };
}

export default function DetectionsPage() {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchName, setSearchName] = useState<string>('');
  const [selectedAlert, setSelectedAlert] = useState<string>('');
  const router = useRouter();

  const detectionsPerPage = 10;

  useEffect(() => {
    fetchDetections();
  }, []);

  const fetchDetections = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/dashboard/all-detections');
      setDetections(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar detecciones');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDetections = detections.filter(detection => {
    if (searchName && !detection.nino.nombre.toLowerCase().includes(searchName.toLowerCase())) return false;
    if (selectedAlert && detection.nivel_alerta !== selectedAlert) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredDetections.length / detectionsPerPage);
  const startIndex = (currentPage - 1) * detectionsPerPage;
  const currentDetections = filteredDetections.slice(startIndex, startIndex + detectionsPerPage);

  const getAlertColor = (nivel: string) => {
    switch(nivel) {
      case 'alta': return 'bg-red-100 text-red-800 border-red-200';
      case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'baja': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getResultColor = (resultado: string) => {
    switch(resultado) {
      case 'probable_anemia': return 'bg-red-500';
      case 'sospechoso': return 'bg-yellow-500';
      case 'normal': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const handleDetectionClick = (detection: Detection) => {
    // Mostrar modal con detalles en lugar de navegar a página individual
    setSelectedDetection(detection);
    setIsModalOpen(true);
  };

  const [selectedDetection, setSelectedDetection] = useState<Detection | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDetection(null);
  };

  if (isLoading) {
    return <div className="text-center">Cargando detecciones...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">👁️ Detecciones con IA</h1>
        <div className="text-sm text-gray-500">
          Total: {filteredDetections.length} detecciones
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
          <div>
            <label className="text-sm font-medium text-gray-700">Buscar por nombre del niño:</label>
            <input
              type="text"
              value={searchName}
              onChange={(e) => {
                setSearchName(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Escribe el nombre del niño..."
              className="ml-2 border border-gray-300 rounded-md px-3 py-2 text-sm w-64"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Nivel de alerta:</label>
            <select
              value={selectedAlert}
              onChange={(e) => {
                setSelectedAlert(e.target.value);
                setCurrentPage(1);
              }}
              className="ml-2 border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">Todos los niveles</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de detecciones */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {currentDetections.map((detection) => (
            <li 
              key={detection.id}
              onClick={() => handleDetectionClick(detection)}
              className="cursor-pointer hover:bg-gray-50 transition-colors duration-150"
            >
              <div className="px-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                      <img
                        className="h-12 w-12 rounded-lg object-cover"
                        src={detection.url_foto || '/placeholder-eye.jpg'}
                        alt="Detección ocular"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjIwIiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOUI5QjlCIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn5GDPC90ZXh0Pgo8L3N2Zz4K';
                        }}
                      />
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {detection.nino.nombre}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(detection.fecha).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${getResultColor(detection.resultado_ia)}`}></div>
                          <span className="text-sm font-medium text-gray-900 capitalize">
                            {detection.resultado_ia.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex space-x-4 text-xs text-gray-500">
                          <span>Confianza: {detection.confianza_ia}%</span>
                          <span>Color: {detection.parametros_detectados.color_mucosa}</span>
                          <span>Índice palidez: {detection.parametros_detectados.indice_palidez.toFixed(1)}</span>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getAlertColor(detection.nivel_alerta)}`}>
                          Alerta {detection.nivel_alerta}
                        </span>
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

        {currentDetections.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No hay detecciones disponibles
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
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Modal para mostrar detalles de la detección */}
      {isModalOpen && selectedDetection && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  👁️ Detalle de Detección IA
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
                    src={selectedDetection.url_foto}
                    alt="Detección ocular"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTEwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDAiIGZpbGw9IiM5QjlCOUIiIHRleHQtYW5jaG9yPSJtaWRkbGUiPvCfkYM8L3RleHQ+Cjwvc3ZnPgo=';
                    }}
                  />
                </div>
                
                {/* Información */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Niño:</label>
                    <p className="text-lg font-medium text-gray-900">{selectedDetection.nino.nombre}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha:</label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedDetection.fecha).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Resultado IA:</label>
                    <div className="flex items-center space-x-2">
                      <div className={`w-4 h-4 rounded-full ${getResultColor(selectedDetection.resultado_ia)}`}></div>
                      <span className="text-sm font-medium capitalize">
                        {selectedDetection.resultado_ia.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Confianza IA:</label>
                    <p className="text-sm text-gray-900">{selectedDetection.confianza_ia}%</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nivel de Alerta:</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getAlertColor(selectedDetection.nivel_alerta)}`}>
                      {selectedDetection.nivel_alerta.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Parámetros detectados */}
              <div className="mt-6">
                <h4 className="text-md font-medium text-gray-900 mb-3">Parámetros Detectados:</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Color mucosa:</span>
                    <p className="text-gray-600">{selectedDetection.parametros_detectados.color_mucosa}</p>
                  </div>
                  <div>
                    <span className="font-medium">Saturación color:</span>
                    <p className="text-gray-600">{selectedDetection.parametros_detectados.saturacion_color.toFixed(1)}%</p>
                  </div>
                  <div>
                    <span className="font-medium">Textura:</span>
                    <p className="text-gray-600">{selectedDetection.parametros_detectados.textura}</p>
                  </div>
                  <div>
                    <span className="font-medium">Vascularización:</span>
                    <p className="text-gray-600">{selectedDetection.parametros_detectados.vascularizacion}</p>
                  </div>
                  <div>
                    <span className="font-medium">Índice palidez:</span>
                    <p className="text-gray-600">{selectedDetection.parametros_detectados.indice_palidez.toFixed(1)}</p>
                  </div>
                </div>
              </div>
              
              {/* Observaciones */}
              <div className="mt-6">
                <h4 className="text-md font-medium text-gray-900 mb-2">Observaciones:</h4>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                  {selectedDetection.observaciones}
                </p>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-purple-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-300"
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
