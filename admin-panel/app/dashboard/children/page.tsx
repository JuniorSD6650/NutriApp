'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface Child {
  id: string;
  nombre: string;
  fecha_nacimiento: string;
  genero: string;
  peso_actual: number;
  altura_actual: number;
  madre: {
    id: string;
    nombre: string;
    email: string;
  };
}

interface ChildModalProps {
  child: Child | null;
  isOpen: boolean;
  onClose: () => void;
}

const ChildModal = ({ child, isOpen, onClose }: ChildModalProps) => {
  if (!isOpen || !child) return null;

  const age = Math.floor((Date.now() - new Date(child.fecha_nacimiento).getTime()) / (365.25 * 24 * 60 * 60 * 1000));

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <span className="text-2xl">👶</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mt-4">
            Información del Niño
          </h3>
          <div className="mt-4 text-left">
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700">Nombre:</label>
              <p className="text-sm text-gray-900">{child.nombre}</p>
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700">Edad:</label>
              <p className="text-sm text-gray-900">{age} años</p>
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700">Género:</label>
              <p className="text-sm text-gray-900 capitalize">{child.genero}</p>
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700">Peso:</label>
              <p className="text-sm text-gray-900">{child.peso_actual} kg</p>
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700">Altura:</label>
              <p className="text-sm text-gray-900">{child.altura_actual} cm</p>
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700">Madre:</label>
              <p className="text-sm text-gray-900">{child.madre.nombre}</p>
              <p className="text-xs text-gray-500">{child.madre.email}</p>
            </div>
          </div>
          <div className="items-center px-4 py-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-green-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface PaginatedChildren {
  data: Child[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function ChildrenPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [paginationInfo, setPaginationInfo] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async (page: number = 1, search?: string) => {
    try {
      setIsLoading(true);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });
      
      if (search && search.trim()) {
        params.append('search', search.trim());
      }
      
      const response = await api.get(`/dashboard/children?${params.toString()}`);
      const result: PaginatedChildren = response.data;
      
      setChildren(result.data || []);
      setPaginationInfo({
        total: result.total || 0,
        page: result.page || 1,
        limit: result.limit || 10,
        totalPages: result.totalPages || 0,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar niños');
      setChildren([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= paginationInfo.totalPages) {
      fetchChildren(newPage, searchTerm);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    fetchChildren(1, value);
  };

  const handleChildClick = (child: Child) => {
    setSelectedChild(child);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedChild(null);
  };

  if (isLoading && children.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-2">Cargando niños...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">👶 Niños Registrados</h1>
        <div className="text-sm text-gray-500">
          Total: {paginationInfo.total} niños
        </div>
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
            Buscar niños o madres:
          </label>
          <input
            type="text"
            placeholder="Nombre del niño o madre..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {searchTerm && (
            <p className="text-xs text-gray-500 mt-1">
              {paginationInfo.total > 0 
                ? `Se encontraron ${paginationInfo.total} resultado(s)`
                : 'No se encontraron resultados'
              }
            </p>
          )}
        </div>
      </div>

      {/* Lista de niños */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md mb-6">
        {children.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {children.map((child) => {
              const age = Math.floor((Date.now() - new Date(child.fecha_nacimiento).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
              return (
                <li 
                  key={child.id}
                  onClick={() => handleChildClick(child)}
                  className="cursor-pointer hover:bg-gray-50 transition-colors duration-150"
                >
                  <div className="px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-green-700">
                            {child.nombre.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {child.nombre}
                        </div>
                        <div className="text-sm text-gray-500">
                          {age} años • {child.genero} • Madre: {child.madre.nombre}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="text-sm text-gray-500">
                        {child.peso_actual}kg / {child.altura_actual}cm
                      </div>
                      <div className="ml-4 text-gray-400">
                        <ChevronRightIcon className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">👶</div>
            <p className="text-lg mb-2">No hay niños registrados</p>
            <p className="text-sm">
              {searchTerm ? 'Intenta con otro término de búsqueda' : 'Los niños aparecerán aquí cuando se registren'}
            </p>
          </div>
        )}
      </div>

      {/* Paginación */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-gray-500">
          Página {paginationInfo.page} de {paginationInfo.totalPages}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handlePageChange(paginationInfo.page - 1)}
            disabled={paginationInfo.page === 1}
            className="inline-flex items-center justify-center h-10 px-4 text-sm font-medium text-white bg-green-600 rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300 disabled:opacity-50"
          >
            <ChevronLeftIcon className="h-5 w-5 -ml-1" />
            Anterior
          </button>
          <button
            onClick={() => handlePageChange(paginationInfo.page + 1)}
            disabled={paginationInfo.page === paginationInfo.totalPages}
            className="inline-flex items-center justify-center h-10 px-4 text-sm font-medium text-white bg-green-600 rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300 disabled:opacity-50"
          >
            Siguiente
            <ChevronRightIcon className="h-5 w-5 ml-1" />
          </button>
        </div>
      </div>

      <ChildModal 
        child={selectedChild}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
}
