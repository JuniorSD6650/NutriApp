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

  @override
  void initState() {
    super.initState();
    _fetchPlatillos();
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
            onPressed: () {
              // TODO: Navegar a AdminPlatillosFormScreen para crear nuevo platillo
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
          const SizedBox(width: 8),
          ElevatedButton(
            onPressed: _applyFilters,
            child: const Text('Aplicar'),
          ),
        ],
      ),
    );
  }

  Widget _buildPlatillosTable(BuildContext context, ThemeData theme) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
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

          return DataRow(cells: [
            DataCell(Text(platillo['nombre'] ?? 'Sin nombre')),
            DataCell(
              IconButton(
                icon: Icon(
                  Icons.description,
                  color: tieneDescripcion ? Colors.blue : Colors.grey, // ✅ Color según disponibilidad
                ),
                onPressed: tieneDescripcion 
                  ? () {
                      _showDescriptionModal(context, platillo);
                    }
                  : null, // ✅ Deshabilitado si no hay descripción
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
                  onPressed: () {
                    // TODO: Navegar a AdminPlatillosFormScreen para editar platillo
                  },
                ),
                IconButton(
                  icon: const Icon(Icons.delete, size: 20, color: Colors.red),
                  onPressed: () {
                    // TODO: Eliminar platillo
                  },
                ),
              ],
            )),
          ]);
        }).toList(),
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