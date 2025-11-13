// lib/features/medico/widgets/medico_navigation_shell.dart
import 'package:flutter/material.dart';
import 'package:fe_nutriapp/features/medico/screens/medico_dashboard_screen.dart';
import 'package:fe_nutriapp/features/medico/screens/medico_pacientes_screen.dart';
import 'package:fe_nutriapp/features/profile/profile_screen.dart'; // <-- Reutilizable

class MedicoNavigationShell extends StatefulWidget {
  const MedicoNavigationShell({super.key});

  @override
  State<MedicoNavigationShell> createState() => _MedicoNavigationShellState();
}

class _MedicoNavigationShellState extends State<MedicoNavigationShell> {
  int _selectedIndex = 0;

  static const List<Widget> _screens = <Widget>[
    MedicoDashboardScreen(),
    MedicoPacientesScreen(),
    ProfileScreen(), // <-- Vista reutilizable
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
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.dashboard), label: 'Dashboard'),
          BottomNavigationBarItem(icon: Icon(Icons.people), label: 'Pacientes'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Perfil'),
        ],
      ),
    );
  }
}