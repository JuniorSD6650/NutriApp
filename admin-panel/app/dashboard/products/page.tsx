'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface User {
  id: string;
  nombre: string;
  email: string;
  rol: string;
}

interface Child {
  id: string;
  nombre: string;
  fecha_nacimiento: string;
  genero: string;
  peso_actual: number;
  altura_actual: number;
  madre: User;
}

interface PaginatedUsers {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface PaginatedChildren {
  data: Child[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function ProductsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [usersPagination, setUsersPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [childrenPagination, setChildrenPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [activeTab, setActiveTab] = useState<'users' | 'children'>('users');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar datos iniciales para ambos tabs
  useEffect(() => {
    loadInitialData();
  }, []);

  // Recargar datos cuando cambie el tab activo
  useEffect(() => {
    if (activeTab === 'users' && users.length === 0) {
      fetchUsersData(1, '');
    } else if (activeTab === 'children' && children.length === 0) {
      fetchChildrenData(1, '');
    }
  }, [activeTab]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      // Cargar datos de usuarios primero (tab activo por defecto)
      await fetchUsersData(1, '');
      // Cargar datos de niños en segundo plano
      await fetchChildrenData(1, '');
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsersData = async (page: number = 1, search?: string) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });
      
      if (search && search.trim()) {
        params.append('search', search.trim());
      }
      
      const usersResponse = await api.get(`/dashboard/users?${params.toString()}`);
      const usersResult: PaginatedUsers = usersResponse.data;
      
      setUsers(usersResult.data || []);
      setUsersPagination({
        total: usersResult.total || 0,
        page: usersResult.page || 1,
        limit: usersResult.limit || 10,
        totalPages: usersResult.totalPages || 0,
      });
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || 'Error al cargar usuarios');
      setUsers([]);
    }
  };

  const fetchChildrenData = async (page: number = 1, search?: string) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });
      
      if (search && search.trim()) {
        params.append('search', search.trim());
      }
      
      const childrenResponse = await api.get(`/dashboard/children?${params.toString()}`);
      const childrenResult: PaginatedChildren = childrenResponse.data;
      
      setChildren(childrenResult.data || []);
      setChildrenPagination({
        total: childrenResult.total || 0,
        page: childrenResult.page || 1,
        limit: childrenResult.limit || 10,
        totalPages: childrenResult.totalPages || 0,
      });
    } catch (err: any) {
      console.error('Error fetching children:', err);
      setError(err.response?.data?.message || 'Error al cargar niños');
      setChildren([]);
    }
  };

  const fetchData = async (page: number = 1, search?: string) => {
    try {
      setIsLoading(true);
      
      if (activeTab === 'users') {
        await fetchUsersData(page, search);
      } else {
        await fetchChildrenData(page, search);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar datos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (tab: 'users' | 'children') => {
    setActiveTab(tab);
    setSearchTerm('');
    setError('');
    
    // Si el tab seleccionado no tiene datos, cargarlos
    if (tab === 'users' && users.length === 0) {
      fetchUsersData(1, '');
    } else if (tab === 'children' && children.length === 0) {
      fetchChildrenData(1, '');
    }
  };

  const handlePageChange = (newPage: number) => {
    const currentPagination = activeTab === 'users' ? usersPagination : childrenPagination;
    if (newPage >= 1 && newPage <= currentPagination.totalPages) {
      fetchData(newPage, searchTerm);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    fetchData(1, value);
  };

  const currentPagination = activeTab === 'users' ? usersPagination : childrenPagination;
  const currentData = activeTab === 'users' ? users : children;

  if (isLoading && users.length === 0 && children.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-2">Cargando datos...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">👥 Gestión de Usuarios</h1>
        <div className="text-sm text-gray-500">
          {activeTab === 'users' 
            ? `${usersPagination.total} usuarios total`
            : `${childrenPagination.total} niños total`
          }
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
            Buscar {activeTab === 'users' ? 'usuarios' : 'niños o madres'}:
          </label>
          <input
            type="text"
            placeholder={activeTab === 'users' ? 'Nombre o email...' : 'Nombre del niño o madre...'}
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {searchTerm && (
            <p className="text-xs text-gray-500 mt-1">
              {currentPagination.total > 0 
                ? `Se encontraron ${currentPagination.total} resultado(s)`
                : 'No se encontraron resultados'
              }
            </p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => handleTabChange('users')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            👥 Usuarios ({usersPagination.total})
          </button>
          <button
            onClick={() => handleTabChange('children')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'children'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            👶 Niños ({childrenPagination.total})
          </button>
        </nav>
      </div>

      {/* Users Table */}
      {activeTab === 'users' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md mb-6">
          {users.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.rol === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.rol}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-4">
                        Ver
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">👥</div>
              <p className="text-lg mb-2">No hay usuarios disponibles</p>
              <p className="text-sm">
                {searchTerm ? 'Intenta con otro término de búsqueda' : 'Los usuarios aparecerán aquí cuando se registren'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Children Table */}
      {activeTab === 'children' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md mb-6">
          {children.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Edad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Género
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Peso/Altura
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Madre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {children.map((child) => {
                  const age = Math.floor((Date.now() - new Date(child.fecha_nacimiento).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
                  return (
                    <tr key={child.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {child.nombre}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {age} años
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                        {child.genero}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {child.peso_actual}kg / {child.altura_actual}cm
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {child.madre.nombre}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-indigo-600 hover:text-indigo-900 mr-4">
                          Ver
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
      )}

      {/* Paginación */}
      {currentPagination.totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPagination.page - 1)}
              disabled={currentPagination.page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => handlePageChange(currentPagination.page + 1)}
              disabled={currentPagination.page === currentPagination.totalPages}
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
                  {(currentPagination.page - 1) * currentPagination.limit + 1}
                </span>{' '}
                a{' '}
                <span className="font-medium">
                  {Math.min(currentPagination.page * currentPagination.limit, currentPagination.total)}
                </span>{' '}
                de{' '}
                <span className="font-medium">{currentPagination.total}</span> registros
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                {Array.from({ length: Math.min(5, currentPagination.totalPages) }, (_, i) => {
                  let pageNumber;
                  if (currentPagination.totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPagination.page <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPagination.page >= currentPagination.totalPages - 2) {
                    pageNumber = currentPagination.totalPages - 4 + i;
                  } else {
                    pageNumber = currentPagination.page - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pageNumber === currentPagination.page
                          ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
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
    </div>
  );
}
