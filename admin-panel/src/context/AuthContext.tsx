'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  id: string;
  nombre: string;
  email: string;
  rol: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Verificar si hay datos guardados al cargar la app
    const savedToken = localStorage.getItem('nutriMamaToken');
    const savedUser = localStorage.getItem('nutriMamaUser');

    if (savedToken && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        // Verificar que el usuario sea admin
        if (userData.rol === 'admin') {
          setToken(savedToken);
          setUser(userData);
        } else {
          // Si no es admin, limpiar datos
          localStorage.removeItem('nutriMamaToken');
          localStorage.removeItem('nutriMamaUser');
        }
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('nutriMamaToken');
        localStorage.removeItem('nutriMamaUser');
      }
    }
    
    setIsLoading(false);
  }, []);

  // Manejar redirecciones automáticas
  useEffect(() => {
    if (!isLoading) {
      const isAuthPage = pathname === '/login';
      const isDashboardPage = pathname.startsWith('/dashboard');
      const isHomePage = pathname === '/';

      if (isAuthenticated && isAuthPage) {
        // Si está autenticado y está en login, redirigir a dashboard
        router.push('/dashboard');
      } else if (!isAuthenticated && isDashboardPage) {
        // Si no está autenticado y está en dashboard, redirigir a login
        router.push('/login');
      }
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  const login = (token: string, userData: User) => {
    // Verificar que el usuario sea admin
    if (userData.rol !== 'admin') {
      throw new Error('Solo los administradores pueden acceder al panel');
    }

    localStorage.setItem('nutriMamaToken', token);
    localStorage.setItem('nutriMamaUser', JSON.stringify(userData));
    setToken(token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('nutriMamaToken');
    localStorage.removeItem('nutriMamaUser');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token && user.rol === 'admin',
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
