import 'package:flutter/material.dart';
import 'package:fe_nutriapp/core/theme/app_colors.dart';
import 'package:provider/provider.dart';
import 'package:fe_nutriapp/core/services/nutriapp_api.dart';

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
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal, // Permite desplazamiento horizontal
      child: DataTable(
        columnSpacing: 18,
        headingRowColor: MaterialStateProperty.resolveWith((states) => theme.cardColor),
        columns: const [
          DataColumn(label: Text('Nombre')),
          DataColumn(label: Text('Nutrientes')),
          DataColumn(label: Text('Acciones')),
        ],
        rows: _ingredientes.map((ingrediente) {
          return DataRow(cells: [
            DataCell(Text(ingrediente['name'] ?? 'Sin nombre')),
            DataCell(
              IconButton(
                icon: const Icon(Icons.visibility, color: AppColors.primary),
                onPressed: () {
                  _showNutrientesModal(context, ingrediente);
                },
              ),
            ),
            DataCell(Row(
              children: [
                IconButton(
                  icon: const Icon(Icons.edit, size: 20),
                  onPressed: () {
                    // TODO: Implementar edición
                  },
                ),
                IconButton(
                  icon: const Icon(Icons.delete, size: 20, color: Colors.red),
                  onPressed: () {
                    // TODO: Implementar eliminación
                  },
                ),
              ],
            )),
          ]);
        }).toList(),
      ),
    );
  }

  void _showNutrientesModal(BuildContext context, Map<String, dynamic> ingrediente) {
    final nutrientes = ingrediente['nutrientes'] ?? [];

    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text('Nutrientes de ${ingrediente['name'] ?? 'Sin nombre'}'),
          content: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: nutrientes.map<Widget>((nutriente) {
                final nutrienteData = nutriente['nutriente'] ?? {};
                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 4.0),
                  child: Text(
                    '${nutrienteData['name'] ?? 'Sin nombre'}: ${nutriente['value_per_100g'] ?? '0'} ${nutrienteData['unit'] ?? ''}',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                );
              }).toList(),
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
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal, // Permite desplazamiento horizontal
      child: DataTable(
        columnSpacing: 18,
        headingRowColor: MaterialStateProperty.resolveWith((states) => theme.cardColor),
        columns: const [
          DataColumn(label: Text('Nombre')),
          DataColumn(label: Text('Unidad')),
          DataColumn(label: Text('Acciones')),
        ],
        rows: _nutrientes.map((nutriente) {
          return DataRow(cells: [
            DataCell(Text(nutriente['name'] ?? 'Sin nombre')),
            DataCell(Text(nutriente['unit'] ?? 'Sin unidad')),
            DataCell(Row(
              children: [
                IconButton(
                  icon: const Icon(Icons.edit, size: 20),
                  onPressed: () {
                    // TODO: Implementar edición
                  },
                ),
                IconButton(
                  icon: const Icon(Icons.delete, size: 20, color: Colors.red),
                  onPressed: () {
                    // TODO: Implementar eliminación
                  },
                ),
              ],
            )),
          ]);
        }).toList(),
      ),
    );
  }

  Widget _buildPaginationControls() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
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
    );
  }
}
