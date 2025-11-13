// lib/core/theme/app_theme.dart
import 'package:flutter/material.dart';
import 'package:fe_nutriapp/core/theme/app_colors.dart'; // Importa tus colores

class AppTheme {
  
  static final ThemeData lightTheme = ThemeData(
    // 1. Esquema de Color General
    colorScheme: ColorScheme.fromSeed(
      seedColor: AppColors.primary,
      background: AppColors.background,
      surface: AppColors.surface,
    ),
    
    // 2. Color de Fondo
    scaffoldBackgroundColor: AppColors.background,

    // 3. Tema de la Barra Superior (AppBar)
    appBarTheme: const AppBarTheme(
      backgroundColor: AppColors.surface, // Fondo blanco
      elevation: 0, // Sin sombra
      centerTitle: false,
      titleTextStyle: TextStyle(
        color: AppColors.primary, // Título en naranja
        fontSize: 24,
        fontWeight: FontWeight.bold,
      ),
      iconTheme: IconThemeData(
        color: AppColors.textPrimary, // Iconos en gris oscuro
      ),
    ),

    // 4. Tema del Botón Flotante (El botón "+")
    floatingActionButtonTheme: const FloatingActionButtonThemeData(
      backgroundColor: AppColors.primary,
      foregroundColor: Colors.white, // Icono de "+" en blanco
      elevation: 4,
    ),

    // 5. Tema de la Barra de Navegación Inferior (Pestañas)
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: AppColors.surface,
      selectedItemColor: AppColors.primary, // Icono activo en naranja
      unselectedItemColor: AppColors.textSecondary, // Icono inactivo en gris
      showUnselectedLabels: true, // Muestra el texto de iconos inactivos
      elevation: 8,
    ),

    // 6. Tema de Texto por defecto
    textTheme: const TextTheme(
      // Para títulos grandes (ej. "Dashboard")
      headlineLarge: TextStyle(
        color: AppColors.textPrimary,
        fontSize: 28,
        fontWeight: FontWeight.bold,
      ),
      // Para sub-secciones (ej. "Calories")
      titleMedium: TextStyle(
        color: AppColors.textPrimary,
        fontSize: 18,
        fontWeight: FontWeight.w600,
      ),
      // Texto de cuerpo normal
      bodyMedium: TextStyle(
        color: AppColors.textSecondary,
        fontSize: 14,
      ),
    ),
  );
}