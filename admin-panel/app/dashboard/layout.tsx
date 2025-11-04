'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
  ChartBarIcon,
  UserGroupIcon,
  BeakerIcon,
  EyeIcon,
  UsersIcon,
  ArchiveBoxIcon,
  ClipboardDocumentListIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

interface MenuItem {
  name: string;
  href?: string;
  icon: React.ComponentType<any>;
  children?: MenuItem[];
}

const navigation: MenuItem[] = [
  {
    name: 'Dashboard Principal',
    href: '/dashboard',
    icon: ChartBarIcon,
  },
  {
    name: 'Gestión de Usuarios',
    href: '/dashboard/products',
    icon: UserGroupIcon,
  },
  {
    name: 'Sistema Nutricional',
    href: '/dashboard/nutrition', // Agregar href para el modo colapsado
    icon: BeakerIcon,
    children: [
      {
        name: 'Ingredientes',
        href: '/dashboard/ingredients',
        icon: BeakerIcon,
      },
      {
        name: 'Platillos & Recetas',
        href: '/dashboard/dishes',
        icon: ArchiveBoxIcon,
      },
      {
        name: 'Registros Nutricionales',
        href: '/dashboard/meal-logs',
        icon: ClipboardDocumentListIcon,
      },
    ],
  },
  {
    name: 'Detecciones IA',
    href: '/dashboard/detections',
    icon: EyeIcon,
  },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, logout, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Auto-abrir menús que contienen la ruta actual
  useEffect(() => {
    const currentOpenMenus: string[] = [];
    navigation.forEach((item) => {
      if (item.children) {
        const hasActiveChild = item.children.some(child => pathname === child.href);
        if (hasActiveChild) {
          currentOpenMenus.push(item.name);
        }
      }
    });
    setOpenMenus(currentOpenMenus);
  }, [pathname]);

  const toggleMenu = (menuName: string) => {
    setOpenMenus(prev => 
      prev.includes(menuName) 
        ? prev.filter(name => name !== menuName)
        : [...prev, menuName]
    );
  };

  const isMenuOpen = (menuName: string) => openMenus.includes(menuName);

  const isActive = (href: string) => pathname === href;

  const handleNavigation = (href: string) => {
    router.push(href);
    setSidebarOpen(false); // Cerrar en móvil después de navegar
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isMenuItemOpen = isMenuOpen(item.name);
    const itemIsActive = item.href ? isActive(item.href) : false;

    if (hasChildren) {
      return (
        <div key={item.name}>
          <button
            onClick={() => {
              if (sidebarCollapsed && item.href) {
                // En modo colapsado, navegar directamente a la página principal del módulo
                handleNavigation(item.href);
              } else {
                // En modo expandido, alternar el menú
                toggleMenu(item.name);
              }
            }}
            className={classNames(
              itemIsActive
                ? 'bg-indigo-50 border-r-2 border-indigo-500 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              'group w-full flex items-center pr-2 py-2 text-sm font-medium rounded-md transition-colors duration-150',
              sidebarCollapsed ? 'justify-center px-2' : 'pl-3'
            )}
          >
            <item.icon
              className={classNames(
                itemIsActive ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500',
                'flex-shrink-0 h-5 w-5 transition-colors duration-150',
                sidebarCollapsed ? '' : 'mr-3'
              )}
            />
            {!sidebarCollapsed && (
              <>
                <span className="flex-1 text-left">{item.name}</span>
                <ChevronDownIcon
                  className={classNames(
                    'h-4 w-4 transition-transform duration-150',
                    isMenuItemOpen ? 'rotate-180' : ''
                  )}
                />
              </>
            )}
          </button>
          
          {!sidebarCollapsed && isMenuItemOpen && (
            <div className="mt-1 space-y-1">
              {item.children?.map((child) => (
                <button
                  key={child.name}
                  onClick={() => child.href && handleNavigation(child.href)}
                  className={classNames(
                    child.href && isActive(child.href)
                      ? 'bg-indigo-50 border-r-2 border-indigo-500 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                    'group w-full flex items-center pl-8 pr-2 py-2 text-sm font-medium rounded-md transition-colors duration-150'
                  )}
                >
                  <child.icon
                    className={classNames(
                      child.href && isActive(child.href) ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500',
                      'mr-3 flex-shrink-0 h-4 w-4 transition-colors duration-150'
                    )}
                  />
                  {child.name}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <button
        key={item.name}
        onClick={() => item.href && handleNavigation(item.href)}
        className={classNames(
          itemIsActive
            ? 'bg-indigo-50 border-r-2 border-indigo-500 text-indigo-700'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
          'group w-full flex items-center py-2 text-sm font-medium rounded-md transition-colors duration-150',
          sidebarCollapsed ? 'justify-center px-2' : 'pl-3 pr-2'
        )}
      >
        <item.icon
          className={classNames(
            itemIsActive ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500',
            'flex-shrink-0 h-5 w-5 transition-colors duration-150',
            sidebarCollapsed ? '' : 'mr-3'
          )}
        />
        {!sidebarCollapsed && item.name}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar móvil */}
      <div className={classNames(
        'fixed inset-0 z-40 lg:hidden',
        sidebarOpen ? 'block' : 'hidden'
      )}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <h1 className="text-xl font-bold text-gray-800">NutriMama</h1>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => renderMenuItem(item))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.nombre?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user?.nombre}</p>
              <p className="text-xs text-gray-500">{user?.rol}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar desktop */}
      <div className={classNames(
        'hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 transition-all duration-300 ease-in-out bg-white shadow-md',
        sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'
      )}>
        {/* Header con toggle */}
        <div className={classNames(
          'flex items-center justify-between border-b border-gray-200 transition-all duration-300',
          sidebarCollapsed ? 'p-2' : 'p-4'
        )}>
          {!sidebarCollapsed && (
            <h1 className="text-xl font-bold text-gray-800">NutriMama</h1>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={classNames(
              'p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-150',
              sidebarCollapsed ? 'mx-auto' : ''
            )}
          >
            {sidebarCollapsed ? (
              <ChevronRightIcon className="h-5 w-5" />
            ) : (
              <Bars3Icon className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Navegación */}
        <nav className={classNames(
          'flex-1 overflow-y-auto space-y-1 transition-all duration-300',
          sidebarCollapsed ? 'p-2' : 'p-3'
        )}>
          {navigation.map((item) => renderMenuItem(item))}
        </nav>

        {/* Footer con usuario */}
        <div className={classNames(
          'flex-shrink-0 border-t border-gray-200 transition-all duration-300',
          sidebarCollapsed ? 'p-2' : 'p-4'
        )}>
          {sidebarCollapsed ? (
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.nombre?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center">
              <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.nombre?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-700">{user?.nombre}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.rol}</p>
              </div>
              <button
                onClick={logout}
                className="text-gray-400 hover:text-red-600 transition-colors duration-150"
                title="Cerrar sesión"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Contenido principal */}
      <div className={classNames(
        'flex flex-col w-0 flex-1 transition-all duration-300',
        sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      )}>
        {/* Header móvil */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between bg-white px-4 py-2 border-b border-gray-200">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">NutriMama</h1>
            <div className="w-8" /> {/* Espaciador */}
          </div>
        </div>

        {/* Contenido */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
