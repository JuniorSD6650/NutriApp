// lib/features/admin/screens/admin_ingredientes_section.dart
// Componente para la sección de ingredientes
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fe_nutriapp/core/services/nutriapp_api.dart';
import 'package:fe_nutriapp/features/admin/screens/ingrediente_nutrientes_detail_screen.dart';

class AdminIngredientesSection extends StatefulWidget {
  final List<dynamic> ingredientes;
  final void Function(dynamic ingrediente)? onEdit;
  final void Function(dynamic ingrediente)? onDelete;
  final void Function()? onAdd;

  const AdminIngredientesSection({
    super.key,
    required this.ingredientes,
    this.onEdit,
    this.onDelete,
    this.onAdd,
  });

  @override
  State<AdminIngredientesSection> createState() => _AdminIngredientesSectionState();
}

class _AdminIngredientesSectionState extends State<AdminIngredientesSection> {
  int _currentPage = 1;
  int _totalPages = 1;
  String? _searchName;
  String _estado = 'activo';
  bool _isLoading = false;
  String? _errorMessage;
  final TextEditingController _searchController = TextEditingController();
  List<dynamic> _ingredientes = [];

  @override
  void initState() {
    super.initState();
    _fetchIngredientes();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _fetchIngredientes() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });
    try {
      final api = context.read<NutriAppApi>().admin;
      final response = await api.getIngredientes(
        page: _currentPage,
        name: _searchName,
        estado: _estado == 'todos' ? 'todos' : _estado,
      );
      setState(() {
        _ingredientes = response['data'];
        _currentPage = int.tryParse(response['page'].toString()) ?? 1;
        _totalPages = int.tryParse(response['totalPages'].toString()) ?? 1;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceFirst('Exception: ', '');
        _isLoading = false;
      });
    }
  }

  void _changePage(int direction) {
    setState(() {
      _currentPage += direction;
    });
    _fetchIngredientes();
  }

  void _applyFilters() {
    setState(() {
      _currentPage = 1;
    });
    _fetchIngredientes();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Column(
      children: [
        _buildFilters(theme),
        Expanded(
          child: _isLoading
              ? const Center(child: CircularProgressIndicator())
              : _errorMessage != null
                  ? Center(
                      child: Text(
                        'Error: $_errorMessage',
                        style: const TextStyle(color: Colors.red),
                      ),
                    )
                  : _buildIngredientesTable(context, theme),
        ),
        _buildPaginationControls(),
      ],
    );
  }

  Widget _buildFilters(ThemeData theme) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _searchController,
                  decoration: const InputDecoration(
                    labelText: 'Buscar por nombre',
                    border: OutlineInputBorder(),
                  ),
                  onChanged: (value) {
                    _searchName = value.isEmpty ? null : value;
                  },
                ),
              ),
              const SizedBox(width: 12),
              ElevatedButton(
                onPressed: _applyFilters,
                child: const Text('Aplicar'),
              ),
            ],
          ),
          const SizedBox(height: 12),
          DropdownButton<String>(
            value: _estado,
            isExpanded: true,
            items: const [
              DropdownMenuItem(value: 'activo', child: Text('Activos')),
              DropdownMenuItem(value: 'inactivo', child: Text('Inactivos')),
              DropdownMenuItem(value: 'todos', child: Text('Todos')),
            ],
            onChanged: (value) {
              if (value != null) setState(() => _estado = value);
            },
          ),
        ],
      ),
    );
  }

  Widget _buildIngredientesTable(BuildContext context, ThemeData theme) {
    final screenWidth = MediaQuery.of(context).size.width;
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: SizedBox(
        width: screenWidth,
        child: DataTable(
          columnSpacing: 18,
          headingRowColor: MaterialStateProperty.resolveWith((states) => theme.cardColor),
          columns: const [
            DataColumn(label: Expanded(child: Text('Nombre'))),
            DataColumn(label: Expanded(child: Text('Nutrientes'))),
            DataColumn(label: Expanded(child: Text('Acciones'))),
          ],
          rows: _ingredientes.map((ingrediente) {
            final isInactive = ingrediente['deletedAt'] != null;
            return DataRow(cells: [
              DataCell(Text(
                ingrediente['name'] ?? 'Sin nombre',
                style: isInactive
                    ? const TextStyle(color: Colors.grey, fontStyle: FontStyle.italic)
                    : null,
              )),
              DataCell(
                IconButton(
                  icon: const Icon(Icons.remove_red_eye, color: Colors.blue),
                  tooltip: 'Ver nutrientes',
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => IngredienteNutrientesDetailScreen(
                          ingredienteId: ingrediente['id'].toString(),
                          ingredienteNombre: ingrediente['name'] ?? 'Sin nombre',
                        ),
                      ),
                    );
                  },
                ),
              ),
              DataCell(Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.edit, size: 20),
                    onPressed: isInactive
                        ? null
                        : () async {
                            final newName = await showDialog<String>(
                              context: context,
                              builder: (context) {
                                final controller = TextEditingController(text: ingrediente['name'] ?? '');
                                return AlertDialog(
                                  title: const Text('Editar ingrediente'),
                                  content: TextField(
                                    controller: controller,
                                    decoration: const InputDecoration(labelText: 'Nombre'),
                                  ),
                                  actions: [
                                    TextButton(
                                      onPressed: () => Navigator.pop(context),
                                      child: const Text('Cancelar'),
                                    ),
                                    ElevatedButton(
                                      onPressed: () => Navigator.pop(context, controller.text),
                                      child: const Text('Guardar'),
                                    ),
                                  ],
                                );
                              },
                            );
                            if (newName != null && newName.trim().isNotEmpty) {
                              final api = context.read<NutriAppApi>().admin;
                              try {
                                await api.updateIngrediente(
                                  ingrediente['id'].toString(),
                                  {'name': newName.trim()},
                                );
                                _fetchIngredientes();
                                if (widget.onEdit != null) widget.onEdit!(ingrediente);
                              } catch (e) {
                                final errorMsg = e.toString();
                                if (errorMsg.contains('ya existe')) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(content: Text('Ya existe un ingrediente con ese nombre')),
                                  );
                                } else {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(content: Text('Error: $errorMsg')),
                                  );
                                }
                              }
                            }
                          },
                  ),
                  IconButton(
                    icon: Icon(isInactive ? Icons.refresh : Icons.delete, color: isInactive ? Colors.green : Colors.red),
                    tooltip: isInactive ? 'Recuperar' : 'Eliminar',
                    onPressed: () async {
                      final api = context.read<NutriAppApi>().admin;
                      if (isInactive) {
                        await api.restoreIngrediente(ingrediente['id'].toString());
                        _fetchIngredientes();
                        if (widget.onDelete != null) widget.onDelete!(ingrediente);
                      } else {
                        await api.deactivateIngrediente(ingrediente['id'].toString());
                        _fetchIngredientes();
                        if (widget.onDelete != null) widget.onDelete!(ingrediente);
                      }
                    },
                  ),
                ],
              )),
            ]);
          }).toList(),
        ),
      ),
    );
  }

  Widget _buildPaginationControls() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              IconButton(
                icon: const Icon(Icons.chevron_left),
                onPressed: _currentPage > 1 ? () => _changePage(-1) : null,
              ),
              Text('Página $_currentPage de $_totalPages'),
              IconButton(
                icon: const Icon(Icons.chevron_right),
                onPressed: _currentPage < _totalPages ? () => _changePage(1) : null,
              ),
            ],
          ),
          TextButton(
            onPressed: () {
              setState(() {
                _currentPage = 1;
                _searchName = null;
                _estado = 'activo';
                _searchController.clear();
              });
              _fetchIngredientes();
            },
            child: const Text('Restablecer filtros'),
          ),
        ],
      ),
    );
  }
}
