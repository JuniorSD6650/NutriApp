// lib/features/admin/screens/admin_usuarios_screen.dart
import 'package:flutter/material.dart';
import 'package:fe_nutriapp/core/theme/app_colors.dart';

class AdminUsuariosScreen extends StatelessWidget {
  const AdminUsuariosScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    // Lista de usuarios dummy para el cascarón
    final List<Map<String, dynamic>> dummyUsers = [
      {'name': 'Admin Principal', 'role': 'admin', 'email': 'admin@app.com', 'status': true, 'id': '1'},
      {'name': 'Doctora Ana', 'role': 'medico', 'email': 'ana@doc.com', 'status': true, 'id': '2'},
      {'name': 'Paciente Juana', 'role': 'paciente', 'email': 'juana@pac.com', 'status': false, 'id': '3'},
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Gestión de Usuarios'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () {
              // TODO: Navegar a AdminUsuariosFormScreen para crear nuevo usuario
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Text(
                'Total de Usuarios: ${dummyUsers.length}',
                style: theme.textTheme.titleMedium,
              ),
            ),
            
            // --- TABLA DE DATOS (SIMULACIÓN) ---
            DataTable(
              columnSpacing: 18,
              headingRowColor: MaterialStateProperty.resolveWith((states) => theme.cardColor),
              columns: const [
                DataColumn(label: Text('Nombre')),
                DataColumn(label: Text('Rol')),
                DataColumn(label: Text('Estado')),
                DataColumn(label: Text('Acciones')),
              ],
              rows: dummyUsers.map((user) {
                return DataRow(cells: [
                  DataCell(Text(user['name'])),
                  DataCell(Text(user['role'])),
                  DataCell(
                    Icon(
                      user['status'] ? Icons.check_circle : Icons.cancel,
                      color: user['status'] ? Colors.green : Colors.red,
                      size: 18,
                    ),
                  ),
                  DataCell(Row(
                    children: [
                      // Botón Editar
                      IconButton(
                        icon: const Icon(Icons.edit, size: 20),
                        onPressed: () {
                          // TODO: PATCH /users/:id (Para editar rol/estado)
                        },
                      ),
                      // Botón Eliminar (soft delete)
                      IconButton(
                        icon: const Icon(Icons.delete, size: 20, color: AppColors.primary),
                        onPressed: () {
                          // TODO: DELETE /users/:id (soft delete)
                        },
                      ),
                    ],
                  )),
                ]);
              }).toList(),
            ),
            
            // --- COMENTARIO DE LÓGICA FUTURA ---
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Text(
                '// Lógica: Esta pantalla usará el servicio API para llamar:\n'
                '// 1. GET /users?page=1&limit=20 (CRUD de Usuarios)\n'
                '// 2. PATCH /users/:id (cambiar rol, estado)\n'
                '// 3. POST /users/:id/force-delete (borrado permanente)',
                style: theme.textTheme.bodySmall,
              ),
            ),
          ],
        ),
      ),
    );
  }
}