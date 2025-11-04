'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/api';

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
    limit: 100,
    totalPages: 0,
  });
  const [childrenPagination, setChildrenPagination] = useState({
    total: 0,
    page: 1,
    limit: 100,
    totalPages: 0,
  });
  const [activeTab, setActiveTab] = useState<'users' | 'children'>('users');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Usar los endpoints paginados con límite alto para obtener todos los datos
      const [usersResponse, childrenResponse] = await Promise.all([
        api.get('/dashboard/users?limit=1000'),
        api.get('/dashboard/children?limit=1000')
      ]);
      
      // Manejar respuestas paginadas
      const usersResult: PaginatedUsers = usersResponse.data;
      const childrenResult: PaginatedChildren = childrenResponse.data;
      
      setUsers(usersResult.data || []);
      setChildren(childrenResult.data || []);
      
      setUsersPagination({
        total: usersResult.total || 0,
        page: usersResult.page || 1,
        limit: usersResult.limit || 100,
        totalPages: usersResult.totalPages || 0,
      });
      
      setChildrenPagination({
        total: childrenResult.total || 0,
        page: childrenResult.page || 1,
        limit: childrenResult.limit || 100,
        totalPages: childrenResult.totalPages || 0,
      });
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar datos');
      // Asegurar que sean arrays vacíos en caso de error
      setUsers([]);
      setChildren([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
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
        <h1 className="text-2xl font-bold text-gray-900">📊 Gestión de Datos</h1>
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

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            👥 Usuarios ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('children')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'children'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            👶 Niños ({children.length})
          </button>
        </nav>
      </div>

      {/* Users Table */}
      {activeTab === 'users' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
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
              <p className="text-sm">Los usuarios aparecerán aquí cuando se registren</p>
            </div>
          )}
        </div>
      )}

      {/* Children Table */}
      {activeTab === 'children' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
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
              <p className="text-sm">Los niños aparecerán aquí cuando se registren</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
