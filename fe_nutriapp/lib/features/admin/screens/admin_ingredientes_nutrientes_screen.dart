import 'package:flutter/material.dart';
import 'package:fe_nutriapp/core/theme/app_colors.dart';
import 'package:provider/provider.dart';
import 'package:fe_nutriapp/core/services/nutriapp_api.dart';
import 'ingrediente_nutrientes_detail_screen.dart';

class AdminIngredientesNutrientesScreen extends StatefulWidget {
  const AdminIngredientesNutrientesScreen({super.key});

  @override
  State<AdminIngredientesNutrientesScreen> createState() =>
      _AdminIngredientesNutrientesScreenState();
}

class _AdminIngredientesNutrientesScreenState
    extends State<AdminIngredientesNutrientesScreen>
    with SingleTickerProviderStateMixin {
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Gestión de Ingredientes y Nutrientes'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Ingredientes'),
            Tab(text: 'Nutrientes'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _IngredientesView(),
          _NutrientesView(),
        ],
      ),
    );
  }
}

class _IngredientesView extends StatefulWidget {
  @override
  State<_IngredientesView> createState() => _IngredientesViewState();
}

class _IngredientesViewState extends State<_IngredientesView> {
  bool _isLoading = true;
  String? _errorMessage;
  List<dynamic> _ingredientes = [];
  int _currentPage = 1;
  int _totalPages = 1;
  String? _searchName;
  final TextEditingController _searchController = TextEditingController();
  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    _fetchIngredientes();
  }

  Future<void> _fetchIngredientes() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final api = context.read<NutriAppApi>();
      final response = await api.admin.getIngredientes(
        page: _currentPage,
        name: _searchName?.trim(), // Asegúrate de enviar el nombre correctamente
      );

      setState(() {
        _ingredientes = response['data'] ?? [];
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
      child: Row(
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
          const SizedBox(width: 16),
          ElevatedButton(
            onPressed: _applyFilters,
            child: const Text('Aplicar'),
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
        width: screenWidth, // Asegura que la tabla ocupe todo el ancho de la pantalla
        child: DataTable(
          columnSpacing: 18,
          headingRowColor: MaterialStateProperty.resolveWith((states) => theme.cardColor),
          columns: const [
            DataColumn(label: Expanded(child: Text('Nombre'))),
            DataColumn(label: Expanded(child: Text('Nutrientes'))),
            DataColumn(label: Expanded(child: Text('Acciones'))),
          ],
          rows: _ingredientes.map((ingrediente) {
            return DataRow(cells: [
              DataCell(Text(ingrediente['name'] ?? 'Sin nombre')),
              DataCell(
                IconButton(
                  icon: const Icon(Icons.visibility, color: AppColors.primary),
                  onPressed: () {
                    Navigator.of(context, rootNavigator: true).push(
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
                    onPressed: () async {
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
                        final api = context.read<NutriAppApi>();
                        await api.admin.updateIngrediente(
                          ingrediente['id'].toString(),
                          {'name': newName.trim()},
                        );
                        _fetchIngredientes();
                      }
                    },
                  ),
                  IconButton(
                    icon: Icon(
                      ingrediente['estado'] == 'inactivo' ? Icons.restore : Icons.delete,
                      size: 20,
                      color: ingrediente['estado'] == 'inactivo' ? Colors.green : Colors.red,
                    ),
                    onPressed: () async {
                      final api = context.read<NutriAppApi>();
                      if (ingrediente['estado'] == 'inactivo') {
                        await api.admin.restoreIngrediente(ingrediente['id'].toString());
                      } else {
                        await api.admin.deactivateIngrediente(ingrediente['id'].toString());
                      }
                      _fetchIngredientes();
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

class _NutrientesView extends StatefulWidget {
  @override
  State<_NutrientesView> createState() => _NutrientesViewState();
}

class _NutrientesViewState extends State<_NutrientesView> {
  bool _isLoading = true;
  String? _errorMessage;
  List<dynamic> _nutrientes = [];
  int _currentPage = 1;
  int _totalPages = 1;
  String? _searchName;

  @override
  void initState() {
    super.initState();
    _fetchNutrientes();
  }

  Future<void> _fetchNutrientes() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final api = context.read<NutriAppApi>();
      final response = await api.getNutrientes(
        page: _currentPage,
        name: _searchName, // Asegúrate de enviar el filtro correctamente
      );

      setState(() {
        _nutrientes = response['data'] ?? [];
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
                  : _buildNutrientesTable(context, theme),
        ),
        _buildPaginationControls(),
      ],
    );
  }

  Widget _buildFilters(ThemeData theme) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              decoration: const InputDecoration(
                labelText: 'Buscar por nombre',
                border: OutlineInputBorder(),
              ),
              onChanged: (value) {
                _searchName = value.isEmpty ? null : value;
              },
            ),
          ),
          const SizedBox(width: 16),
          ElevatedButton(
            onPressed: _applyFilters,
            child: const Text('Aplicar'),
          ),
        ],
      ),
    );
  }

  Widget _buildNutrientesTable(BuildContext context, ThemeData theme) {
    final screenWidth = MediaQuery.of(context).size.width;

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: SizedBox(
        width: screenWidth, // Asegura que la tabla ocupe todo el ancho de la pantalla
        child: DataTable(
          columnSpacing: 18,
          headingRowColor: MaterialStateProperty.resolveWith((states) => theme.cardColor),
          columns: const [
            DataColumn(label: Expanded(child: Text('Nombre'))),
            DataColumn(label: Expanded(child: Text('Unidad'))),
            DataColumn(label: Expanded(child: Text('Acciones'))),
          ],
          rows: _nutrientes.map((nutriente) {
            return DataRow(cells: [
              DataCell(Text(nutriente['name'] ?? 'Sin nombre')),
              DataCell(Text(nutriente['unit'] ?? 'Sin unidad')),
              DataCell(Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.edit, size: 20),
                    onPressed: () async {
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
                        final api = context.read<NutriAppApi>();
                        await api.admin.updateNutriente(
                          nutriente['id'].toString(),
                          {'name': newName.trim()},
                        );
                        _fetchNutrientes();
                      }
                    },
                  ),
                  IconButton(
                    icon: Icon(
                      nutriente['estado'] == 'inactivo' ? Icons.restore : Icons.delete,
                      size: 20,
                      color: nutriente['estado'] == 'inactivo' ? Colors.green : Colors.red,
                    ),
                    onPressed: () async {
                      final api = context.read<NutriAppApi>();
                      if (nutriente['estado'] == 'inactivo') {
                        await api.admin.restoreNutriente(nutriente['id'].toString());
                      } else {
                        await api.admin.deactivateNutriente(nutriente['id'].toString());
                      }
                      _fetchNutrientes();
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
              });
              // Limpiar campo de búsqueda si existe
              final filterField = (context as Element).findAncestorWidgetOfExactType<TextField>();
              if (filterField != null && filterField.controller != null) {
                filterField.controller!.clear();
              }
              _fetchNutrientes();
            },
            child: const Text('Restablecer filtros'),
          ),
        ],
      ),
    );
  }
}
