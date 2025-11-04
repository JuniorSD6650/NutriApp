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

interface PaginatedDetections {
  data: Detection[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function DetectionsPage() {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [paginationInfo, setPaginationInfo] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchName, setSearchName] = useState<string>('');
  const [selectedAlert, setSelectedAlert] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    fetchDetections();
  }, []);

  const fetchDetections = async (page: number = 1, search?: string, nivelAlerta?: string) => {
    try {
      setIsLoading(true);
      
      // Crear parámetros para la consulta paginada
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });
      
      if (search && search.trim()) {
        params.append('search', search.trim());
      }
      
      if (nivelAlerta && nivelAlerta !== '') {
        params.append('nivel_alerta', nivelAlerta);
      }
      
      // Usar el endpoint paginado de detecciones
      const response = await api.get(`/dashboard/all-detections-paginated?${params.toString()}`);
      const result: PaginatedDetections = response.data;
      
      setDetections(result.data || []);
      setPaginationInfo({
        total: result.total || 0,
        page: result.page || 1,
        limit: result.limit || 10,
        totalPages: result.totalPages || 0,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar detecciones');
      setDetections([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= paginationInfo.totalPages) {
      fetchDetections(newPage, searchName, selectedAlert);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchName(value);
    fetchDetections(1, value, selectedAlert); // Buscar inmediatamente
  };

  const handleAlertChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedAlert(value);
    fetchDetections(1, searchName, value); // Aplicar filtro inmediatamente
  };

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

  if (isLoading && detections.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-2">Cargando detecciones...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">👁️ Detecciones con IA</h1>
          <p className="text-sm text-gray-600 mt-1">
            Análisis automático de mucosa ocular para detección temprana de anemia
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Total: {paginationInfo.total} detecciones
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Información sobre el sistema */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <div className="text-2xl mr-3">🤖</div>
          <div>
            <h3 className="text-lg font-medium text-purple-900">Sistema de Detección IA</h3>
            <p className="text-sm text-purple-700 mt-1">
              Estos registros provienen del análisis automático de fotos de mucosa ocular utilizando inteligencia artificial. 
              El sistema detecta signos tempranos de anemia mediante análisis de color y textura.
            </p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar por nombre del niño:
            </label>
            <input
              type="text"
              value={searchName}
              onChange={handleSearchChange}
              placeholder="Nombre del niño..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nivel de alerta:
            </label>
            <select
              value={selectedAlert}
              onChange={handleAlertChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
      <div className="bg-white shadow overflow-hidden sm:rounded-md mb-6">
        {detections.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {detections.map((detection) => (
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
                            <div className="text-sm font-medium text-gray-900 flex items-center">
                              {detection.nino.nombre}
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                IA
                              </span>
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
                            <span>Color: {detection.parametros_detectados?.color_mucosa || 'N/A'}</span>
                            <span>Índice palidez: {detection.parametros_detectados?.indice_palidez?.toFixed(1) || 'N/A'}</span>
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
        ) : (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">👁️</div>
            <p className="text-lg mb-2">No hay detecciones de IA disponibles</p>
            <p className="text-sm">Los registros aparecerán aquí cuando se analicen fotos de mucosa ocular con IA</p>
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
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
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
                          ? 'z-10 bg-purple-50 border-purple-500 text-purple-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
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
