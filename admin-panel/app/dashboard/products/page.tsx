'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';

interface User {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  created_at?: string;
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

// Modal para ver detalles del usuario
interface UserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

const UserModal = ({ user, isOpen, onClose }: UserModalProps) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-6 border w-full max-w-md shadow-lg rounded-lg bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            👤 Información del Usuario
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-700">
                {user.nombre.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre:</label>
            <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{user.nombre}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email:</label>
            <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{user.email}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rol:</label>
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
              user.rol === 'admin' 
                ? 'bg-purple-100 text-purple-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {user.rol === 'admin' ? 'Administrador' : 'Madre'}
            </span>
          </div>

          {user.created_at && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de registro:</label>
              <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                {new Date(user.created_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal para ver detalles del niño
interface ChildModalProps {
  child: Child | null;
  isOpen: boolean;
  onClose: () => void;
}

const ChildModal = ({ child, isOpen, onClose }: ChildModalProps) => {
  if (!isOpen || !child) return null;

  const age = Math.floor((Date.now() - new Date(child.fecha_nacimiento).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  const ageInMonths = Math.floor((Date.now() - new Date(child.fecha_nacimiento).getTime()) / (30.44 * 24 * 60 * 60 * 1000));

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-6 border w-full max-w-md shadow-lg rounded-lg bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            👶 Información del Niño
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-green-700">
                {child.nombre.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre:</label>
            <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{child.nombre}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Edad:</label>
              <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                {age} años ({ageInMonths} meses)
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Género:</label>
              <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded capitalize">{child.genero}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Peso:</label>
              <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{child.peso_actual} kg</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Altura:</label>
              <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{child.altura_actual} cm</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de nacimiento:</label>
            <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
              {new Date(child.fecha_nacimiento).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Madre:</label>
            <div className="bg-gray-50 p-2 rounded">
              <p className="text-sm font-medium text-gray-900">{child.madre.nombre}</p>
              <p className="text-xs text-gray-500">{child.madre.email}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

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
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isChildModalOpen, setIsChildModalOpen] = useState(false);

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

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };

  const handleViewChild = (child: Child) => {
    setSelectedChild(child);
    setIsChildModalOpen(true);
  };

  const handleDeleteUser = async (user: User) => {
    try {
      const result = await Swal.fire({
        title: '¿Eliminar usuario?',
        html: `
          <div class="text-center">
            <div class="text-6xl mb-4">👤</div>
            <p class="mb-2">¿Está seguro de que desea eliminar el usuario:</p>
            <p class="font-semibold text-lg text-gray-800">"${user.nombre}"</p>
            <p class="text-sm text-gray-600 mt-2">Email: ${user.email}</p>
            <p class="text-sm text-red-600 mt-3">
              <strong>⚠️ Advertencia:</strong> Esta acción no se puede deshacer.
              ${user.rol === 'madre' ? 'También se eliminarán todos los niños y registros asociados.' : ''}
            </p>
          </div>
        `,
        icon: 'warning',
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
          title: 'Eliminando usuario...',
          text: 'Por favor espere',
          icon: 'info',
          allowOutsideClick: false,
          showConfirmButton: false,
          willOpen: () => {
            Swal.showLoading();
          },
        });

        // Realizar la eliminación
        await api.delete(`/auth/users/${user.id}`);
        
        await Swal.fire({
          title: '¡Eliminado!',
          text: `El usuario "${user.nombre}" ha sido eliminado exitosamente.`,
          icon: 'success',
          confirmButtonText: 'Continuar',
          confirmButtonColor: '#10B981',
          timer: 3000,
          timerProgressBar: true,
        });
        
        // Recargar los datos
        if (activeTab === 'users') {
          await fetchUsersData(usersPagination.page, searchTerm);
        }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al eliminar usuario';
      await Swal.fire({
        title: 'Error al eliminar',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#EF4444',
      });
    }
  };

  const handleDeleteChild = async (child: Child) => {
    try {
      const result = await Swal.fire({
        title: '¿Eliminar niño?',
        html: `
          <div class="text-center">
            <div class="text-6xl mb-4">👶</div>
            <p class="mb-2">¿Está seguro de que desea eliminar el registro del niño:</p>
            <p class="font-semibold text-lg text-gray-800">"${child.nombre}"</p>
            <p class="text-sm text-gray-600 mt-2">Madre: ${child.madre.nombre}</p>
            <p class="text-sm text-red-600 mt-3">
              <strong>⚠️ Advertencia:</strong> Esta acción no se puede deshacer.
              Se eliminarán todos los registros nutricionales y detecciones asociadas.
            </p>
          </div>
        `,
        icon: 'warning',
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
          title: 'Eliminando niño...',
          text: 'Por favor espere',
          icon: 'info',
          allowOutsideClick: false,
          showConfirmButton: false,
          willOpen: () => {
            Swal.showLoading();
          },
        });

        // Realizar la eliminación
        await api.delete(`/ninos/${child.id}`);
        
        await Swal.fire({
          title: '¡Eliminado!',
          text: `El registro de "${child.nombre}" ha sido eliminado exitosamente.`,
          icon: 'success',
          confirmButtonText: 'Continuar',
          confirmButtonColor: '#10B981',
          timer: 3000,
          timerProgressBar: true,
        });
        
        // Recargar los datos
        if (activeTab === 'children') {
          await fetchChildrenData(childrenPagination.page, searchTerm);
        }
      }
    } catch (err: any) {
      // Manejar diferentes tipos de errores de forma más específica
      let errorTitle = 'Error al eliminar';
      let errorMessage = 'Error desconocido al eliminar niño';
      let errorDetails = '';
      let showDependencies = false;
      
      if (err.response?.status === 403) {
        const errorData = err.response.data;
        
        // Si es un error estructurado con dependencias
        if (errorData.dependencias) {
          errorTitle = 'No se puede eliminar';
          errorMessage = errorData.message;
          errorDetails = errorData.details;
          showDependencies = true;
          
          await Swal.fire({
            title: errorTitle,
            html: `
              <div class="text-left">
                <div class="mb-4">
                  <p class="mb-2 text-gray-800">${errorMessage}</p>
                  <p class="text-sm text-gray-600">${errorDetails}</p>
                </div>
                
                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <h4 class="font-semibold text-yellow-800 mb-2">📊 Registros encontrados:</h4>
                  <ul class="text-sm text-yellow-700 space-y-1">
                    ${errorData.dependencias.detecciones > 0 ? `<li>• ${errorData.dependencias.detecciones} detecciones de IA</li>` : ''}
                    ${errorData.dependencias.registrosNutricionales > 0 ? `<li>• ${errorData.dependencias.registrosNutricionales} registros nutricionales</li>` : ''}
                    <li class="font-medium pt-1">Total: ${errorData.dependencias.total} registros</li>
                  </ul>
                </div>
                
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 class="font-semibold text-blue-800 mb-2">💡 Opciones disponibles:</h4>
                  <ul class="text-sm text-blue-700 space-y-2">
                    <li>• <strong>Eliminar registros primero:</strong> Vaya a las secciones correspondientes y elimine los registros asociados</li>
                    <li>• <strong>Contactar soporte:</strong> Si necesita eliminar todos los datos por motivos administrativos</li>
                    <li>• <strong>Archivar en lugar de eliminar:</strong> Considere mantener los datos para análisis históricos</li>
                  </ul>
                </div>
                
                <div class="mt-4 text-xs text-gray-500">
                  <p><strong>Sugerencia:</strong> ${errorData.suggestion}</p>
                </div>
              </div>
            `,
            icon: 'warning',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#F59E0B',
            width: '600px',
          });
          return;
        } else {
          // Error de permisos simple
          errorTitle = 'Sin permisos';
          errorMessage = errorData.message || 'No tienes permisos para eliminar este niño';
        }
      } else if (err.response?.status === 404) {
        errorTitle = 'Niño no encontrado';
        errorMessage = 'El niño que intentas eliminar no existe en el sistema';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      // Mostrar error simple para otros casos
      await Swal.fire({
        title: errorTitle,
        html: `
          <div class="text-left">
            <p class="mb-3">${errorMessage}</p>
            ${err.response?.status === 403 && !showDependencies ? `
              <div class="bg-blue-50 border border-blue-200 rounded p-3 mt-3">
                <p class="text-sm text-blue-800">
                  <strong>💡 Sugerencia:</strong> Si necesitas eliminar este registro por motivos administrativos, 
                  contacta con el equipo de soporte del sistema.
                </p>
              </div>
            ` : ''}
          </div>
        `,
        icon: err.response?.status === 403 ? 'warning' : 'error',
        confirmButtonText: 'Entendido',
        confirmButtonColor: err.response?.status === 403 ? '#F59E0B' : '#EF4444',
        width: '500px',
      });
    }
  };

  const currentPagination = activeTab === 'users' ? usersPagination : childrenPagination;

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
                        {user.rol === 'admin' ? 'Administrador' : 'Madre'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => handleViewUser(user)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                        title="Ver detalles"
                      >
                        Ver
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user)}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar usuario"
                      >
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
                        <button 
                          onClick={() => handleViewChild(child)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                          title="Ver detalles"
                        >
                          Ver
                        </button>
                        <button 
                          onClick={() => handleDeleteChild(child)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar niño"
                        >
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
              <p className="text-lg mb-2">No hay niños disponibles</p>
              <p className="text-sm">
                {searchTerm ? 'Intenta con otro término de búsqueda' : 'Los niños aparecerán aquí cuando se registren'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Paginación debajo de ambas tablas */}
      {(activeTab === 'users' && users.length > 0) || (activeTab === 'children' && children.length > 0) ? (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 rounded-b-lg">
          <div>
            <p className="text-sm text-gray-700">
              Página <span className="font-medium">{currentPagination.page}</span> de <span className="font-medium">{currentPagination.totalPages}</span>
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                onClick={() => handlePageChange(currentPagination.page - 1)}
                disabled={currentPagination.page === 1}
                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                  currentPagination.page === 1 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
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
              <button
                onClick={() => handlePageChange(currentPagination.page + 1)}
                disabled={currentPagination.page === currentPagination.totalPages}
                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                  currentPagination.page === currentPagination.totalPages ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </nav>
          </div>
        </div>
      ) : null}

      {/* Modales */}
      <UserModal 
        user={selectedUser}
        isOpen={isUserModalOpen}
        onClose={() => {
          setIsUserModalOpen(false);
          setSelectedUser(null);
        }}
      />

      <ChildModal 
        child={selectedChild}
        isOpen={isChildModalOpen}
        onClose={() => {
          setIsChildModalOpen(false);
          setSelectedChild(null);
        }}
      />
    </div>
  );
}
