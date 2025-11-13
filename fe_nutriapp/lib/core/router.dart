// lib/core/router.dart
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:fe_nutriapp/core/services/auth_service.dart';
import 'package:fe_nutriapp/features/auth/login_screen.dart';
import 'package:fe_nutriapp/features/dashboard/home_screen.dart';
import 'package:fe_nutriapp/features/daily_log/daily_log_screen.dart';
import 'package:fe_nutriapp/features/charts/charts_screen.dart';
import 'package:fe_nutriapp/features/profile/profile_screen.dart';
import 'package:fe_nutriapp/features/navigation/main_navigation_shell.dart';

class AppRouter {
  
  static final _rootNavigatorKey = GlobalKey<NavigatorState>();
  static final _shellNavigatorKey = GlobalKey<NavigatorState>();

  static GoRouter createRouter(BuildContext context) {
    final authService = context.read<AuthService>();

    return GoRouter(
      navigatorKey: _rootNavigatorKey,
      initialLocation: '/home',
      
      // Refresca la app si el estado de login cambia
      refreshListenable: authService, 
      
      // Lógica de redirección (el "Muro")
      redirect: (context, state) {
        final isLoggedIn = authService.isLoggedIn;
        
        // Si no está logueado y está intentando ir a cualquier
        // sitio que no sea /login, redirige a /login.
        if (!isLoggedIn && state.matchedLocation != '/login') {
          return '/login';
        }
        
        // Si SÍ está logueado y está en la pantalla de /login,
        // redirige a la pantalla principal.
        if (isLoggedIn && state.matchedLocation == '/login') {
          return '/home';
        }
        
        return null; // No redirigir
      },

      routes: [
        // --- Rutas Fuera de la Navegación (sin pestañas) ---
        GoRoute(
          path: '/login',
          builder: (context, state) => const LoginScreen(),
        ),
        
        // (Aquí irá la pantalla de 'Añadir Comida' (Ejemplo 1))
        // GoRoute(
        //   path: '/add-meal',
        //   builder: (context, state) => const AddMealScreen(),
        // ),

        // --- Rutas Dentro de la Navegación (con pestañas) ---
        StatefulShellRoute.indexedStack(
          builder: (context, state, navigationShell) {
            // Este es el widget "padre" con la barra de pestañas
            return MainNavigationShell(navigationShell: navigationShell);
          },
          branches: [
            // Pestaña 1: Home (Dashboard)
            StatefulShellBranch(
              routes: [
                GoRoute(
                  path: '/home', 
                  builder: (context, state) => const HomeScreen(),
                ),
              ],
            ),
            // Pestaña 2: Meals (Diario)
            StatefulShellBranch(
              routes: [
                GoRoute(
                  path: '/meals',
                  builder: (context, state) => const DailyLogScreen(),
                ),
              ],
            ),
            // Pestaña 3: El Botón "+" (Falso, lo manejamos en el Scaffold)
             StatefulShellBranch(
              routes: [
                GoRoute(
                  path: '/placeholder', // Ruta vacía
                  builder: (context, state) => const SizedBox.shrink(),
                ),
              ],
            ),
            // Pestaña 4: Charts
            StatefulShellBranch(
              routes: [
                GoRoute(
                  path: '/charts',
                  builder: (context, state) => const ChartsScreen(),
                ),
              ],
            ),
            // Pestaña 5: More (Perfil)
            StatefulShellBranch(
              routes: [
                GoRoute(
                  path: '/profile',
                  builder: (context, state) => const ProfileScreen(),
                ),
              ],
            ),
          ],
        ),
      ],
    );
  }
}