// lib/features/paciente/screens/daily_log_screen.dart
import 'package:flutter/material.dart';

class DailyLogScreen extends StatelessWidget {
  const DailyLogScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Diario de Comidas')),
      body: const Center(child: Text('Pantalla de "Meals" (Diario) del Paciente')),
    );
  }
}