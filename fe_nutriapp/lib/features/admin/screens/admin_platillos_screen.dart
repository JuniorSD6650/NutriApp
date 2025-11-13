// lib/features/admin/screens/admin_platillos_screen.dart
import 'package:flutter/material.dart';

class AdminPlatillosScreen extends StatelessWidget {
  const AdminPlatillosScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Gestión de Platillos')),
      body: const Center(child: Text('Aquí irá el CRUD de /platillos')),
    );
  }
}