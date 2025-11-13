// lib/features/medico/screens/medico_pacientes_screen.dart
import 'package:flutter/material.dart';

class MedicoPacientesScreen extends StatelessWidget {
  const MedicoPacientesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Mis Pacientes')),
      body: const Center(child: Text('Aquí irá la lista de pacientes del médico')),
      // Aquí se llamaría a GET /profiles/medicos/:id/pacientes
    );
  }
}