// lib/features/admin/screens/admin_platillos_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fe_nutriapp/core/services/nutriapp_api.dart';
import 'package:fe_nutriapp/core/theme/app_colors.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:fe_nutriapp/features/admin/screens/platillo_ingredientes_detail_screen.dart';

class AdminPlatillosScreen extends StatefulWidget {
  const AdminPlatillosScreen({super.key});

  @override
  State<AdminPlatillosScreen> createState() => _AdminPlatillosScreenState();
}

class _AdminPlatillosScreenState extends State<AdminPlatillosScreen> {
  bool _isLoading = true;
  String? _errorMessage;
  List<dynamic> _platillos = [];
  int _currentPage = 1;
  int _totalPages = 1;
  String? _searchName;
  String _filtroActivo = 'activos'; // 'todos', 'activos', 'inactivos'
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _fetchPlatillos();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _fetchPlatillos() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final api = context.read<NutriAppApi>();
      final response = await api.admin.getPlatillos(
        page: _currentPage,
        name: _searchName,
        estado: _filtroActivo == 'todos' ? 'todos' : (_filtroActivo == 'activos' ? 'activo' : 'inactivo'),
      );

      setState(() {
        _platillos = response['data'];
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
    _fetchPlatillos();
  }

  void _applyFilters() {
    setState(() {
      _currentPage = 1;
    });
    _fetchPlatillos();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Gestión de Platillos'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () async {
              // Modal para registrar nuevo platillo (solo nombre y descripción)
              final nuevoPlatillo = await showDialog<Map<String, String>>(
                context: context,
                builder: (context) {
                  final nombreController = TextEditingController();
                  final descripcionController = TextEditingController();
                  return AlertDialog(
                    title: const Text('Registrar nuevo platillo'),
                    content: SingleChildScrollView(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          TextField(
                            controller: nombreController,
                            decoration: const InputDecoration(labelText: 'Nombre'),
                          ),
                          const SizedBox(height: 12),
                          TextField(
                            controller: descripcionController,
                            decoration: const InputDecoration(labelText: 'Descripción'),
                          ),
                        ],
                      ),
                    ),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.of(context).pop(),
                        child: const Text('Cancelar'),
                      ),
                      ElevatedButton(
                        onPressed: () {
                          if (nombreController.text.trim().isNotEmpty) {
                            Navigator.of(context).pop({
                              'nombre': nombreController.text.trim(),
                              'descripcion': descripcionController.text.trim(),
                            });
                          }
                        },
                        child: const Text('Registrar'),
                      ),
                    ],
                  );
                },
              );
              if (nuevoPlatillo != null) {
                try {
                  final adminApi = context.read<NutriAppApi>().admin;
                  await adminApi.createPlatillo({
                    'nombre': nuevoPlatillo['nombre'],
                    'descripcion': nuevoPlatillo['descripcion'],
                  });
                  if (mounted) _fetchPlatillos();
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Platillo registrado correctamente')),
                  );
                } catch (e) {
                  String errorMsg = e.toString();
                  // Si la excepción contiene un body con message, extraerlo
                  if (e is Exception && e.toString().contains('message')) {
                    final match = RegExp(r'message[":\s]*([^"]+)').firstMatch(e.toString());
                    if (match != null) {
                      errorMsg = match.group(1) ?? errorMsg;
                    }
                  }
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Error al registrar: $errorMsg')),
                  );
                }
              }
            },
          ),
        ],
      ),
      body: Column(
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
                    : _buildPlatillosTable(context, theme),
          ),
          _buildPaginationControls(),
        ],
      ),
    );
  }

  Widget _buildFilters(ThemeData theme) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
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
              const SizedBox(width: 8),
              ElevatedButton(
                onPressed: _applyFilters,
                child: const Text('Aplicar'),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: Row(
                  children: [
                    const Text('Estado: '),
                    Expanded(
                      child: DropdownButton<String>(
                        isExpanded: true,
                        value: _filtroActivo,
                        items: const [
                          DropdownMenuItem(value: 'todos', child: Text('Todos')),
                          DropdownMenuItem(value: 'activos', child: Text('Activos')),
                          DropdownMenuItem(value: 'inactivos', child: Text('Inactivos')),
                        ],
                        onChanged: (value) {
                          setState(() {
                            _filtroActivo = value ?? 'activos';
                          });
                          // Ya no filtra automáticamente, solo cambia el valor
                        },
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPlatillosTable(BuildContext context, ThemeData theme) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: ConstrainedBox(
        constraints: BoxConstraints(minWidth: MediaQuery.of(context).size.width),
        child: DataTable(
          columnSpacing: 18,
          headingRowColor: MaterialStateProperty.resolveWith((states) => theme.cardColor),
          columns: const [
            DataColumn(label: Text('Nombre')),
            DataColumn(label: Text('Descripción')),
            DataColumn(label: Text('Acciones')),
          ],
          rows: _platillos.map((platillo) {
            final tieneDescripcion = platillo['descripcion'] != null && 
                                    (platillo['descripcion'] as String).trim().isNotEmpty;
            final isInactive = platillo['deletedAt'] != null;

            return DataRow(cells: [
              DataCell(Text(
                platillo['nombre'] ?? 'Sin nombre',
                style: isInactive
                    ? const TextStyle(color: Colors.grey, fontStyle: FontStyle.italic)
                    : null,
              )),
              DataCell(
                IconButton(
                  icon: Icon(
                    Icons.description,
                    color: tieneDescripcion ? Colors.blue : Colors.grey,
                  ),
                  onPressed: tieneDescripcion
                      ? () {
                          _showDescriptionModal(context, platillo);
                        }
                      : null,
                ),
              ),
              DataCell(Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.visibility, color: Colors.blue),
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => PlatilloIngredientesDetailScreen(
                            platilloId: platillo['id'],
                            platilloNombre: platillo['nombre'] ?? 'Sin nombre',
                          ),
                        ),
                      );
                    },
                  ),
                  IconButton(
                    icon: const Icon(Icons.edit, size: 20),
                    onPressed: isInactive
                        ? null
                        : () async {
                            final nombreController = TextEditingController(text: platillo['nombre'] ?? '');
                            final descripcionController = TextEditingController(text: platillo['descripcion'] ?? '');
                            final result = await showDialog<Map<String, String>>(
                              context: context,
                              builder: (context) => AlertDialog(
                                title: const Text('Editar platillo'),
                                content: Column(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    TextField(
                                      controller: nombreController,
                                      decoration: const InputDecoration(labelText: 'Nombre'),
                                    ),
                                    const SizedBox(height: 12),
                                    TextField(
                                      controller: descripcionController,
                                      decoration: const InputDecoration(labelText: 'Descripción'),
                                    ),
                                  ],
                                ),
                                actions: [
                                  TextButton(
                                    onPressed: () => Navigator.of(context).pop(),
                                    child: const Text('Cancelar'),
                                  ),
                                  ElevatedButton(
                                    onPressed: () {
                                      Navigator.of(context).pop({
                                        'nombre': nombreController.text.trim(),
                                        'descripcion': descripcionController.text.trim(),
                                      });
                                    },
                                    child: const Text('Guardar'),
                                  ),
                                ],
                              ),
                            );
                            if (result != null) {
                              try {
                                final adminApi = context.read<NutriAppApi>().admin;
                                await adminApi.updatePlatillo(
                                  platillo['id'].toString(),
                                  {
                                    'nombre': result['nombre'],
                                    'descripcion': result['descripcion'],
                                  },
                                );
                                if (mounted) _fetchPlatillos();
                              } catch (e) {
                                if (mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(content: Text('Error al editar: ${e.toString()}')),
                                  );
                                }
                              }
                            }
                          },
                  ),
                  if (!isInactive)
                    IconButton(
                      icon: const Icon(Icons.delete, size: 20, color: Colors.red),
                      onPressed: () async {
                        final confirm = await showDialog<bool>(
                          context: context,
                          builder: (ctx) => AlertDialog(
                            title: const Text('Desactivar platillo'),
                            content: Text('¿Seguro que deseas desactivar "${platillo['nombre']}"?'),
                            actions: [
                              TextButton(
                                onPressed: () => Navigator.of(ctx).pop(false),
                                child: const Text('Cancelar'),
                              ),
                              ElevatedButton(
                                onPressed: () => Navigator.of(ctx).pop(true),
                                child: const Text('Desactivar'),
                              ),
                            ],
                          ),
                        );
                        if (confirm == true) {
                          try {
                            final adminApi = context.read<NutriAppApi>().admin;
                            await adminApi.deactivatePlatillo(platillo['id'].toString());
                            if (mounted) _fetchPlatillos();
                          } catch (e) {
                            if (mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text('Error al desactivar: ${e.toString()}')),
                              );
                            }
                          }
                        }
                      },
                    ),
                  if (isInactive)
                      IconButton(
                        icon: const Icon(Icons.refresh, size: 20, color: Colors.green),
                        onPressed: () async {
                          final confirm = await showDialog<bool>(
                            context: context,
                            builder: (ctx) => AlertDialog(
                              title: const Text('Reactivar platillo'),
                              content: Text('¿Seguro que deseas reactivar "${platillo['nombre']}"?'),
                              actions: [
                                TextButton(
                                  onPressed: () => Navigator.of(ctx).pop(false),
                                  child: const Text('Cancelar'),
                                ),
                                ElevatedButton(
                                  onPressed: () => Navigator.of(ctx).pop(true),
                                  child: const Text('Reactivar'),
                                ),
                              ],
                            ),
                          );
                          if (confirm == true) {
                            try {
                              final adminApi = context.read<NutriAppApi>().admin;
                              await adminApi.restorePlatillo(platillo['id'].toString());
                              if (mounted) _fetchPlatillos();
                            } catch (e) {
                              if (mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(content: Text('Error al reactivar: ${e.toString()}')),
                                );
                              }
                            }
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

  // ✅ NUEVO: Modal para mostrar la descripción
  void _showDescriptionModal(BuildContext context, Map<String, dynamic> platillo) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text('Descripción de ${platillo['nombre'] ?? 'Sin nombre'}'),
          content: SingleChildScrollView(
            child: Text(
              platillo['descripcion'] ?? 'Sin descripción',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Cerrar'),
            ),
          ],
        );
      },
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
                _searchController.clear();
                _filtroActivo = 'activos';
              });
              _fetchPlatillos();
            },
            child: const Text('Restablecer filtros'),
          ),
        ],
      ),
    );
  }
}