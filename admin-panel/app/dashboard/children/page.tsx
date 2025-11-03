'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/api';

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

export default function ChildrenPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/dashboard/children');
      setChildren(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar niños');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChildClick = (child: Child) => {
    setSelectedChild(child);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedChild(null);
  };

  if (isLoading) {
    return <div className="text-center">Cargando niños...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">👶 Niños Registrados</h1>
        <div className="text-sm text-gray-500">
          Total: {children.length} niños
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
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
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {children.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No hay niños registrados
          </div>
        )}
      </div>

      <ChildModal 
        child={selectedChild}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
}
