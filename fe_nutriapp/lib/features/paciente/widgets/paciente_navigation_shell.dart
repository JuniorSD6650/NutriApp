// lib/features/paciente/widgets/paciente_navigation_shell.dart
import 'package:flutter/material.dart';
import 'package:fe_nutriapp/features/paciente/screens/home_screen.dart';
import 'package:fe_nutriapp/features/paciente/screens/daily_log_screen.dart';
import 'package:fe_nutriapp/features/paciente/screens/charts_screen.dart';
import 'package:fe_nutriapp/features/profile/profile_screen.dart';
// 1. IMPORTAR LA PANTALLA DE AÑADIR COMIDA
import 'package:fe_nutriapp/features/paciente/screens/add_meal_screen.dart';

class PacienteNavigationShell extends StatefulWidget {
  const PacienteNavigationShell({super.key});

  @override
  State<PacienteNavigationShell> createState() => _PacienteNavigationShellState();
}

class _PacienteNavigationShellState extends State<PacienteNavigationShell> {
  int _selectedIndex = 0;

  static const List<Widget> _screens = <Widget>[
    HomeScreen(),
    DailyLogScreen(),
    SizedBox.shrink(), // Placeholder para el botón '+' (índice 2)
    ChartsScreen(),
    ProfileScreen(),
  ];

  void _onItemTapped(int index) {
    if (index == 2) return; // Evita que se seleccione el hueco del medio
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens.elementAt(_selectedIndex),
      
      // 2. BOTÓN FLOTANTE CONECTADO
      floatingActionButton: FloatingActionButton(
        onPressed: () async {
          // Navegar a la pantalla de cámara (como diálogo de pantalla completa)
          final result = await Navigator.of(context).push(
            MaterialPageRoute(
              builder: (context) => const AddMealScreen(),
              fullscreenDialog: true, // Animación de abajo hacia arriba
            ),
          );

          // Opcional: Si el usuario guardó una comida (retornó true),
          // volvemos a la pestaña Home para ver el progreso actualizado.
          if (result == true) {
            setState(() {
              _selectedIndex = 0; 
            });
          }
        },
        child: const Icon(Icons.add),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: _onItemTapped,
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.restaurant_menu), label: 'Meals'),
          BottomNavigationBarItem(label: '', icon: SizedBox.shrink()), // Espacio invisible
          BottomNavigationBarItem(icon: Icon(Icons.bar_chart), label: 'Charts'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'More'),
        ],
      ),
    );
  }
}