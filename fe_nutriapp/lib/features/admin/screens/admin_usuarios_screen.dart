// lib/features/admin/screens/admin_usuarios_screen.dart
import 'package:flutter/material.dart';
import 'package:fe_nutriapp/core/theme/app_colors.dart';
import 'package:provider/provider.dart';
import 'package:fe_nutriapp/core/services/nutriapp_api.dart';

class AdminUsuariosScreen extends StatefulWidget {
  const AdminUsuariosScreen({super.key});

  @override
  State<AdminUsuariosScreen> createState() => _AdminUsuariosScreenState();
}

class _AdminUsuariosScreenState extends State<AdminUsuariosScreen> {
  bool _isLoading = true;
  String? _errorMessage;
  List<dynamic> _usuarios = [];
  int _currentPage = 1;
  int _totalPages = 1;
  String? _selectedRole;
  String? _searchName;

  @override
  void initState() {
    super.initState();
    _fetchUsuarios();
  }

  Future<void> _fetchUsuarios() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final api = context.read<NutriAppApi>();
      final response = await api.admin.getUsuarios(
        page: _currentPage,
        role: _selectedRole,
        name: _searchName,
      );

      setState(() {
        _usuarios = response['data'];
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
    _fetchUsuarios();
  }

  void _applyFilters() {
    setState(() {
      _currentPage = 1;
    });
    _fetchUsuarios();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

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
                    : _buildUsuariosTable(context, theme),
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
        children: [
          TextField(
            decoration: const InputDecoration(
              labelText: 'Buscar por nombre',
              border: OutlineInputBorder(),
            ),
            onChanged: (value) {
              _searchName = value.isEmpty ? null : value;
            },
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: DropdownButton<String>(
                  value: _selectedRole,
                  hint: const Text('Filtrar por rol'),
                  items: const [
                    DropdownMenuItem(value: null, child: Text('Ninguno')), // Opción para traer todos los roles
                    DropdownMenuItem(value: 'admin', child: Text('Admin')),
                    DropdownMenuItem(value: 'medico', child: Text('Médico')),
                    DropdownMenuItem(value: 'paciente', child: Text('Paciente')),
                  ],
                  onChanged: (value) {
                    setState(() {
                      _selectedRole = value;
                    });
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
        ],
      ),
    );
  }

  Widget _buildUsuariosTable(BuildContext context, ThemeData theme) {
    return SingleChildScrollView(
      child: DataTable(
        columnSpacing: 18,
        headingRowColor: MaterialStateProperty.resolveWith((states) => theme.cardColor),
        columns: const [
          DataColumn(label: Text('Nombre')),
          DataColumn(label: Text('Rol')),
          DataColumn(label: Text('Estado')),
          DataColumn(label: Text('Acciones')),
        ],
        rows: _usuarios.map((user) {
          final isActive = user['isActive'] == true;

          return DataRow(cells: [
            DataCell(Text(user['name'] ?? 'Sin nombre')),
            DataCell(Text(user['role'] ?? 'Desconocido')),
            DataCell(
              Icon(
                isActive ? Icons.check_circle : Icons.cancel,
                color: isActive ? Colors.green : Colors.red,
                size: 18,
              ),
            ),
            DataCell(Row(
              children: [
                IconButton(
                  icon: const Icon(Icons.edit, size: 20),
                  onPressed: () {
                    // TODO: Navegar a AdminUsuariosFormScreen para editar usuario
                  },
                ),
                IconButton(
                  icon: const Icon(Icons.delete, size: 20, color: AppColors.primary),
                  onPressed: () {
                    // TODO: Eliminar usuario
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