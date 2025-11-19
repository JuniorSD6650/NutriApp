// lib/features/admin/screens/admin_ingredientes_screen.dart
import 'package:flutter/material.dart';
import 'package:fe_nutriapp/core/theme/app_colors.dart';
import 'package:provider/provider.dart';
import 'package:fe_nutriapp/core/services/nutriapp_api.dart';

class AdminIngredientesScreen extends StatefulWidget {
  const AdminIngredientesScreen({super.key});

  @override
  State<AdminIngredientesScreen> createState() => _AdminIngredientesScreenState();
}

class _AdminIngredientesScreenState extends State<AdminIngredientesScreen> {
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
        name: _searchName,
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

    return Scaffold(
      appBar: AppBar(
        title: const Text('Gestión de Ingredientes'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () {
              // TODO: Navegar a AdminIngredientesFormScreen para crear nuevo ingrediente
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
                    : _buildIngredientesTable(context, theme),
          ),
          _buildPaginationControls(),
        ],
      ),
    );
  }

  Widget _buildFilters(ThemeData theme) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: TextField(
        decoration: const InputDecoration(
          labelText: 'Buscar por nombre',
          border: OutlineInputBorder(),
        ),
        onChanged: (value) {
          _searchName = value.isEmpty ? null : value;
        },
      ),
    );
  }

  Widget _buildIngredientesTable(BuildContext context, ThemeData theme) {
    return SingleChildScrollView(
      child: DataTable(
        columnSpacing: 18,
        headingRowColor: MaterialStateProperty.resolveWith((states) => theme.cardColor),
        columns: const [
          DataColumn(label: Text('Nombre')),
          DataColumn(label: Text('Nutrientes')),
          DataColumn(label: Text('Acciones')),
        ],
        rows: _ingredientes.map((ingrediente) {
          final nutrientes = ingrediente['nutrientes']
              .map((n) => '${n['name']} (${n['value_per_100g']} ${n['unit']})')
              .join(', ');

          return DataRow(cells: [
            DataCell(Text(ingrediente['name'] ?? 'Sin nombre')),
            DataCell(Text(nutrientes.isNotEmpty ? nutrientes : 'Sin nutrientes')),
            DataCell(Row(
              children: [
                IconButton(
                  icon: const Icon(Icons.edit, size: 20),
                  onPressed: () {
                    // TODO: Navegar a AdminIngredientesFormScreen para editar ingrediente
                  },
                ),
                IconButton(
                  icon: const Icon(Icons.delete, size: 20, color: Colors.red),
                  onPressed: () {
                    // TODO: Eliminar ingrediente
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
