// lib/features/admin/screens/admin_ingredientes_screen.dart
import 'package:flutter/material.dart';

class AdminIngredientesScreen extends StatelessWidget {
  const AdminIngredientesScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Gestión de Ingredientes')),
      body: const Center(child: Text('Aquí irá el CRUD de /ingredientes y /nutrientes')),
    );
  }
}