// lib/features/medico/screens/medico_dashboard_screen.dart
import 'package:flutter/material.dart';

class MedicoDashboardScreen extends StatelessWidget {
  const MedicoDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Dashboard Médico')),
      body: const Center(child: Text('Pantalla principal del Médico')),
    );
  }
}