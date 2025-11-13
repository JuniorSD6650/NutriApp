// lib/features/admin/screens/admin_usuarios_screen.dart
import 'package:flutter/material.dart';

class AdminUsuariosScreen extends StatelessWidget {
  const AdminUsuariosScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Gestión de Usuarios')),
      body: const Center(child: Text('Aquí irá el CRUD de /users')),
    );
  }
}