'use client';

import { useAuth } from '@/context/AuthContext';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Panel de Administración
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">
            Bienvenido, {user?.nombre}
          </span>
          
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center text-sm rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
              <span className="sr-only">Abrir menú de usuario</span>
              <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user?.nombre.charAt(0)}
                </span>
              </div>
              <ChevronDownIcon className="ml-2 h-4 w-4 text-gray-400" />
            </Menu.Button>
            
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={logout}
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                    >
                      Cerrar Sesión
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </header>
  );
}
