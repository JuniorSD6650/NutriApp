'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface User {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  created_at: string;
}

interface PaginatedUsers {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

const UserModal = ({ user, isOpen, onClose }: UserModalProps) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
            <span className="text-2xl">👤</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mt-4">
            Información del Usuario
          </h3>
          <div className="mt-4 text-left">
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700">Nombre:</label>
              <p className="text-sm text-gray-900">{user.nombre}</p>
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700">Email:</label>
              <p className="text-sm text-gray-900">{user.email}</p>
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700">Rol:</label>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                user.rol === 'admin' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {user.rol}
              </span>
            </div>
          </div>
          <div className="items-center px-4 py-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [paginationInfo, setPaginationInfo] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (page: number = 1, search?: string) => {
    try {
      setIsLoading(true);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });
      
      if (search && search.trim()) {
        params.append('search', search.trim());
      }
      
      const response = await api.get(`/dashboard/users?${params.toString()}`);
      const result: PaginatedUsers = response.data;
      
      setUsers(result.data || []);
      setPaginationInfo({
        total: result.total || 0,
        page: result.page || 1,
        limit: result.limit || 10,
        totalPages: result.totalPages || 0,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar usuarios');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= paginationInfo.totalPages) {
      fetchUsers(newPage, searchTerm);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    fetchUsers(1, value);
  };

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  if (isLoading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Cargando usuarios...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">👥 Usuarios del Sistema</h1>
        <div className="text-sm text-gray-500">
          Total: {paginationInfo.total} usuarios
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
            Buscar usuarios:
          </label>
          <input
            type="text"
            placeholder="Nombre o email..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

      {/* Lista de usuarios */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md mb-6">
        {users.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {users.map((user) => (
              <li 
                key={user.id}
                onClick={() => handleUserClick(user)}
                className="cursor-pointer hover:bg-gray-50 transition-colors duration-150"
              >
                <div className="px-4 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-700">
                          {user.nombre.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.nombre}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.rol === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user.rol}
                    </span>
                    <div className="ml-4 text-gray-400">
                      <ChevronRightIcon className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">👥</div>
            <p className="text-lg mb-2">No hay usuarios disponibles</p>
            <p className="text-sm">
              {searchTerm ? 'Intenta con otro término de búsqueda' : 'Los usuarios aparecerán aquí'}
            </p>
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
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
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

      <UserModal 
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
}
