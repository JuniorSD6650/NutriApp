import axios from 'axios';

// Crear instancia de axios configurada
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para incluir token JWT en las peticiones
api.interceptors.request.use(
  (config) => {
    // Obtener token del localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('nutriMamaToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Si el token es inválido, limpiar localStorage y redirigir
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('nutriMamaToken');
        localStorage.removeItem('nutriMamaUser');
        // Usar router.push en lugar de window.location para mejor UX
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Tipos para las respuestas del backend
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
}

export interface LoginResponse {
  user: {
    id: string;
    nombre: string;
    email: string;
    rol: string;
  };
  token: string;
}

export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  created_at: string;
}

export interface Child {
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
  created_at: string;
}
