// lib/features/admin/screens/admin_ingredientes_screen.dart
import 'package:flutter/material.dart';
import 'package:fe_nutriapp/core/theme/app_colors.dart';

class AdminIngredientesScreen extends StatefulWidget {
  const AdminIngredientesScreen({super.key});

  @override
  State<AdminIngredientesScreen> createState() =>
      _AdminIngredientesScreenState();
}

class _AdminIngredientesScreenState extends State<AdminIngredientesScreen>
    with SingleTickerProviderStateMixin {
  // TabBarController para cambiar entre Ingredientes y Nutrientes
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  // Lógica dummy para Nutrientes
  final List<Map<String, String>> dummyNutrients = [
    {'name': 'Hierro', 'unit': 'mg', 'id': 'n1'},
    {'name': 'Calorías', 'unit': 'kcal', 'id': 'n2'},
    {'name': 'Proteínas', 'unit': 'g', 'id': 'n3'},
  ];

  // Lógica dummy para Ingredientes
  final List<Map<String, dynamic>> dummyIngredients = [
    {'name': 'Lenteja', 'status': true, 'id': 'i1'},
    {'name': 'Avena', 'status': true, 'id': 'i2'},
    {'name': 'Espinaca', 'status': false, 'id': 'i3'},
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Gestión de Datos Maestros'),
        elevation: 0,
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.primary,
          unselectedLabelColor: theme.textTheme.bodyLarge?.color,
          indicatorColor: AppColors.primary,
          tabs: const [Tab(text: 'Ingredientes'), Tab(text: 'Nutrientes')],
        ),
      ),

      // Botón flotante para añadir (la acción depende de la pestaña)
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // TODO: Abrir formulario para añadir Ingrediente o Nutriente
          if (_tabController.index == 0) {
            // Acción: Añadir Ingrediente
          } else {
            // Acción: Añadir Nutriente
          }
        },
        child: const Icon(Icons.add),
      ),

      body: TabBarView(
        controller: _tabController,
        children: [
          // PESTAÑA 1: INGREDIENTES
          _buildIngredientsList(context),

          // PESTAÑA 2: NUTRIENTES
          _buildNutrientsList(context),
        ],
      ),
    );
  }

  // --- WIDGETS DE PESTAÑA ---

  Widget _buildIngredientsList(BuildContext context) {
    // Datos dummy: Asumimos que esta lista es la fuente de datos (GET /ingredientes)
    final theme = Theme.of(context);

    final List<Map<String, dynamic>> dummyIngredients = [
      {'name': 'Lenteja', 'status': true, 'id': 'i1'},
      {'name': 'Avena', 'status': true, 'id': 'i2'},
      {'name': 'Espinaca', 'status': false, 'id': 'i3'},
    ];

    return ListView(
      children: [
        ...dummyIngredients.map((ing) {
          return ListTile(
            leading: const Icon(Icons.spa),
            // CORRECCIÓN 1: Asegurar que el valor sea String
            title: Text(
              ing['name'] as String? ?? 'Error: Name',
              style: theme.textTheme.titleMedium,
            ),
            subtitle: const Text('4 nutrientes asociados'),
            trailing: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  ing['status'] ? Icons.check : Icons.close,
                  color: ing['status'] ? Colors.green : Colors.red,
                  size: 18,
                ),
                IconButton(
                  icon: const Icon(Icons.edit, size: 20),
                  onPressed: () {
                    // TODO: PATCH /ingredientes/:id
                  },
                ),
                IconButton(
                  icon: const Icon(Icons.delete, size: 20, color: Colors.red),
                  onPressed: () {
                    // TODO: DELETE /ingredientes/:id (soft delete)
                  },
                ),
              ],
            ),
          );
        }).toList(),

        Padding(
          padding: const EdgeInsets.all(16.0),
          child: Text(
            '// Lógica: Carga la lista paginada de Ingredientes (GET /ingredientes?page=...).',
            style: theme.textTheme.bodySmall,
          ),
        ),
      ],
    );
  }

  Widget _buildNutrientsList(BuildContext context) {
    // Datos dummy: Asumimos que esta lista es la fuente de datos (GET /nutrientes)
    final theme = Theme.of(context);

    final List<Map<String, String>> dummyNutrients = [
      {'name': 'Hierro', 'unit': 'mg', 'id': 'n1'},
      {'name': 'Calorías', 'unit': 'kcal', 'id': 'n2'},
      {'name': 'Proteínas', 'unit': 'g', 'id': 'n3'},
    ];

    return ListView(
      children: [
        ...dummyNutrients.map((nut) {
          return ListTile(
            leading: const Icon(Icons.science),
            // CORRECCIÓN 2: Asegurar que el valor sea String y manejar nulos
            title: Text(
              nut['name'] as String? ?? 'Error: Name',
              style: theme.textTheme.titleMedium,
            ),
            subtitle: Text('Unidad: ${nut['unit']}'),
            trailing: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                IconButton(
                  icon: const Icon(Icons.edit, size: 20),
                  onPressed: () {
                    // TODO: PATCH /nutrientes/:id
                  },
                ),
                IconButton(
                  icon: const Icon(Icons.delete, size: 20, color: Colors.red),
                  onPressed: () {
                    // TODO: POST /nutrientes/:id/force-delete
                  },
                ),
              ],
            ),
          );
        }).toList(),

        Padding(
          padding: const EdgeInsets.all(16.0),
          child: Text(
            '// Lógica: Carga la lista de Nutrientes (GET /nutrientes).',
            style: Theme.of(context).textTheme.bodySmall,
          ),
        ),
      ],
    );
  }
}
