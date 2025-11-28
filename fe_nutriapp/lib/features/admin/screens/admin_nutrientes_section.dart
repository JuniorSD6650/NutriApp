// lib/features/admin/screens/admin_nutrientes_section.dart
// Componente para la sección de nutrientes
import 'package:flutter/material.dart';

import 'package:provider/provider.dart';
import 'package:fe_nutriapp/core/services/nutriapp_api.dart';

class AdminNutrientesSection extends StatefulWidget {
  final List<dynamic> nutrientes;
  final void Function(dynamic nutriente)? onEdit;
  final void Function(dynamic nutriente)? onDelete;
  final void Function()? onAdd;

  const AdminNutrientesSection({
    super.key,
    required this.nutrientes,
    this.onEdit,
    this.onDelete,
    this.onAdd,
  });

  @override
  State<AdminNutrientesSection> createState() => _AdminNutrientesSectionState();
}

class _AdminNutrientesSectionState extends State<AdminNutrientesSection> {
  int _currentPage = 1;
  int _totalPages = 1;

  String _estado = 'activo';
  bool _isLoading = false;
  String? _errorMessage;
  final TextEditingController _searchController = TextEditingController();
  String? _searchName;

  List<dynamic> _nutrientes = [];

  @override
  void initState() {
    super.initState();
    _fetchNutrientes();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _fetchNutrientes() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });
    try {
      final api = context.read<NutriAppApi>().admin;
      final response = await api.getNutrientes(
        page: _currentPage,
        name: _searchName,
        estado: _estado == 'todos' ? 'todos' : _estado,
      );
      setState(() {
        _nutrientes = response['data'];
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
    _fetchNutrientes();
  }

  void _applyFilters() {
    setState(() {
      _currentPage = 1;
    });
    _fetchNutrientes();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final nutrientes = _nutrientes;

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
                  : _buildNutrientesTable(context, theme, nutrientes),
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
                    setState(() {
                      _searchName = value.isEmpty ? null : value;
                    });
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

  Widget _buildNutrientesTable(BuildContext context, ThemeData theme, List<dynamic> nutrientes) {
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
            DataColumn(label: Expanded(child: Text('Unidad'))),
            DataColumn(label: Expanded(child: Text('Acciones'))),
          ],
          rows: nutrientes.map((nutriente) {
            return DataRow(cells: [
              DataCell(Text(nutriente['name'] ?? 'Sin nombre')),
              DataCell(Text(nutriente['unit'] ?? 'Sin unidad')),
              DataCell(Row(
                children: [
                  Opacity(
                    opacity: nutriente['estado'] == 'inactivo' ? 0.4 : 1.0,
                    child: IconButton(
                      icon: const Icon(Icons.edit, size: 20),
                      onPressed: nutriente['estado'] == 'inactivo' ? null : () async {
                        final newName = await showDialog<String>(
                          context: context,
                          builder: (context) {
                            final controller = TextEditingController(text: nutriente['name'] ?? '');
                            return AlertDialog(
                              title: const Text('Editar nutriente'),
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
                            await api.updateNutriente(
                              nutriente['id'].toString(),
                              {'name': newName.trim()},
                            );
                            _fetchNutrientes();
                            if (widget.onEdit != null) widget.onEdit!(nutriente);
                          } catch (e) {
                            final errorMsg = e.toString();
                            if (errorMsg.contains('ya existe')) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Ya existe un nutriente con ese nombre')),
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
                  ),
                  Builder(
                    builder: (context) {
                      final isInactive = nutriente['deletedAt'] != null;
                      return IconButton(
                        icon: Icon(isInactive ? Icons.replay : Icons.delete, color: isInactive ? Colors.green : Colors.red),
                        tooltip: isInactive ? 'Recuperar' : 'Eliminar',
                        onPressed: () async {
                          final api = context.read<NutriAppApi>().admin;
                          if (isInactive) {
                            final confirm = await showDialog<bool>(
                              context: context,
                              builder: (ctx) => AlertDialog(
                                title: const Text('Recuperar nutriente'),
                                content: Text('¿Seguro que deseas recuperar "${nutriente['name']}"?'),
                                actions: [
                                  TextButton(
                                    onPressed: () => Navigator.of(ctx).pop(false),
                                    child: const Text('Cancelar'),
                                  ),
                                  ElevatedButton(
                                    onPressed: () => Navigator.of(ctx).pop(true),
                                    child: const Text('Recuperar'),
                                  ),
                                ],
                              ),
                            );
                            if (confirm == true) {
                              await api.restoreNutriente(nutriente['id']);
                              _fetchNutrientes();
                              if (widget.onDelete != null) widget.onDelete!(nutriente);
                            }
                          } else {
                            final confirm = await showDialog<bool>(
                              context: context,
                              builder: (ctx) => AlertDialog(
                                title: const Text('Eliminar nutriente'),
                                content: Text('¿Seguro que deseas eliminar "${nutriente['name']}"?'),
                                actions: [
                                  TextButton(
                                    onPressed: () => Navigator.of(ctx).pop(false),
                                    child: const Text('Cancelar'),
                                  ),
                                  ElevatedButton(
                                    onPressed: () => Navigator.of(ctx).pop(true),
                                    child: const Text('Eliminar'),
                                  ),
                                ],
                              ),
                            );
                            if (confirm == true) {
                              await api.deactivateNutriente(nutriente['id']);
                              _fetchNutrientes();
                              if (widget.onDelete != null) widget.onDelete!(nutriente);
                            }
                          }
                        },
                      );
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
              // Recargar nutrientes desde el padre
            },
            child: const Text('Restablecer filtros'),
          ),
        ],
      ),
    );
  }
}
