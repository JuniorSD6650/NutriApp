// lib/features/admin/screens/admin_platillos_screen.dart
import 'package:flutter/material.dart';
import 'package:fe_nutriapp/core/theme/app_colors.dart';

class AdminPlatillosScreen extends StatelessWidget {
  const AdminPlatillosScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    // Datos dummy
    final List<Map<String, dynamic>> dummyPlatillos = [
      {'name': 'Guiso de Lentejas', 'ingredients': 3, 'status': true, 'id': 'p1'},
      {'name': 'Avena con Fruta', 'ingredients': 4, 'status': true, 'id': 'p2'},
      {'name': 'Tacos de Pollo', 'ingredients': 6, 'status': false, 'id': 'p3'},
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Gestión de Platillos'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () {
              // TODO: Navegar a PlatillosFormScreen para crear nueva receta
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // --- LISTA DE PLATILLOS (SIMULACIÓN) ---
            ...dummyPlatillos.map((platillo) {
              return ListTile(
                leading: CircleAvatar(
                  backgroundColor: AppColors.primary.withOpacity(0.1),
                  child: Icon(Icons.restaurant, color: AppColors.primary),
                ),
                title: Text(platillo['name'], style: theme.textTheme.titleMedium),
                subtitle: Text('${platillo['ingredients']} ingredientes'),
                trailing: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      platillo['status'] ? Icons.visibility : Icons.visibility_off,
                      color: platillo['status'] ? Colors.green : Colors.grey,
                      size: 20,
                    ),
                    IconButton(
                      icon: const Icon(Icons.edit, size: 20),
                      onPressed: () {
                        // TODO: PATCH /platillos/:id (Editar composición)
                      },
                    ),
                    IconButton(
                      icon: const Icon(Icons.delete, size: 20, color: Colors.red),
                      onPressed: () {
                        // TODO: DELETE /platillos/:id (soft delete)
                      },
                    ),
                  ],
                ),
              );
            }).toList(),

            // --- COMENTARIO DE LÓGICA FUTURA ---
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Text(
                '// Lógica: Esta pantalla debe usar:\n'
                '// 1. GET /platillos?page=... (para la lista paginada)\n'
                '// 2. POST /platillos (crear nueva receta con composición anidada)\n'
                '// 3. El botón Delete usará DELETE /platillos/:id (soft delete)',
                style: theme.textTheme.bodySmall,
              ),
            ),
          ],
        ),
      ),
    );
  }
}