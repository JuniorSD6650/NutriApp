// lib/features/admin/widgets/admin_navigation_shell.dart
import 'package:flutter/material.dart';
import 'package:fe_nutriapp/features/admin/screens/admin_usuarios_screen.dart';
import 'package:fe_nutriapp/features/admin/screens/admin_ingredientes_nutrientes_screen.dart'; // <-- Cambiado para incluir Nutrientes
import 'package:fe_nutriapp/features/admin/screens/admin_platillos_screen.dart';
import 'package:fe_nutriapp/features/profile/profile_screen.dart';

class AdminNavigationShell extends StatefulWidget {
  const AdminNavigationShell({super.key});

  @override
  State<AdminNavigationShell> createState() => _AdminNavigationShellState();
}

class _AdminNavigationShellState extends State<AdminNavigationShell> {
  int _selectedIndex = 0;

  static const List<Widget> _screens = <Widget>[
    AdminUsuariosScreen(),
    AdminIngredientesNutrientesScreen(), // <-- Cambiado para incluir Nutrientes
    AdminPlatillosScreen(),
    ProfileScreen(),
  ];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens.elementAt(_selectedIndex),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: _onItemTapped,
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.people_alt), label: 'Usuarios'),
          BottomNavigationBarItem(icon: Icon(Icons.spa), label: 'Ingredientes'), // <-- Cambiado para incluir Nutrientes
          BottomNavigationBarItem(icon: Icon(Icons.restaurant), label: 'Platillos'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Perfil'),
        ],
      ),
    );
  }
}