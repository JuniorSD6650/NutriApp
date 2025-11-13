// lib/features/navigation/main_navigation_shell.dart
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:fe_nutriapp/core/theme/app_colors.dart'; // Importa tus colores

class MainNavigationShell extends StatelessWidget {
  const MainNavigationShell({
    super.key,
    required this.navigationShell,
  });
  
  // Este widget es requerido por GoRouter para manejar el estado de la navegación
  final StatefulNavigationShell navigationShell;

  void _goBranch(int index) {
    navigationShell.goBranch(
      index,
      initialLocation: index == navigationShell.currentIndex,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // El body cambiará según la pestaña seleccionada
      body: navigationShell, 
      
      // El botón flotante "+" (Ejemplo 1)
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // TODO: Navegar a la pantalla de 'Añadir Comida' (Ejemplo 1)
          // context.push('/add-meal'); 
        },
        child: const Icon(Icons.add),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,

      // La barra de pestañas inferior
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: navigationShell.currentIndex,
        onTap: _goBranch,
        type: BottomNavigationBarType.fixed, // Para que funcionen más de 3 pestañas
        // Los colores se toman automáticamente de tu AppTheme
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home_outlined),
            activeIcon: Icon(Icons.home),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.restaurant_menu_outlined),
            activeIcon: Icon(Icons.restaurant_menu),
            label: 'Meals',
          ),
          // Dejamos un espacio "vacío" para el botón flotante
          BottomNavigationBarItem(label: '', icon: SizedBox.shrink()),
          BottomNavigationBarItem(
            icon: Icon(Icons.bar_chart_outlined),
            activeIcon: Icon(Icons.bar_chart),
            label: 'Charts',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person_outline),
            activeIcon: Icon(Icons.person),
            label: 'More',
          ),
        ],
      ),
    );
  }
}