'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, logout, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

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

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-4">
          <h1 className="text-xl font-bold text-gray-800">NutriMama Admin</h1>
          <p className="text-sm text-gray-600 mt-1">
            {user?.nombre} ({user?.rol})
          </p>
        </div>
        <nav className="mt-8 flex-1">
          <a
            href="/dashboard"
            className="block px-4 py-2 text-gray-600 hover:bg-gray-50"
          >
            📊 Dashboard
          </a>
          <a
            href="/dashboard/products"
            className="block px-4 py-2 text-gray-600 hover:bg-gray-50"
          >
            👥 Usuarios y Niños
          </a>
        </nav>
        <div className="p-4">
          <button
            onClick={logout}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            🚪 Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
