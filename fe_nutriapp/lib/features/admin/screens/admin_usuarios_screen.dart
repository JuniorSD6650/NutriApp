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
    Future<void> _showCreateUsuarioModal(BuildContext context) async {
      final _formKey = GlobalKey<FormState>();
      String name = '';
      String email = '';
      String password = '';
      String role = '';
      bool isLoading = false;
      // Medico profile
      Map<String, dynamic> medicoProfile = {};
      // Paciente profile
      Map<String, dynamic> pacienteProfile = {};
      String especialidad = '';
      String numeroColegiado = '';
      String biografia = '';
      DateTime? fechaNacimiento;
      double? pesoInicial;
      double? alturaCm;
      bool tomaSuplementosHierro = false;

      await showDialog(
        context: context,
        builder: (context) {
          return StatefulBuilder(
            builder: (context, setModalState) {
              return AlertDialog(
                title: const Text('Agregar Usuario'),
                content: Form(
                  key: _formKey,
                  child: SingleChildScrollView(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        TextFormField(
                          decoration: const InputDecoration(labelText: 'Nombre'),
                          validator: (value) => value == null || value.isEmpty ? 'Campo requerido' : null,
                          onChanged: (value) => name = value,
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          decoration: const InputDecoration(labelText: 'Email'),
                          validator: (value) => value == null || value.isEmpty ? 'Campo requerido' : null,
                          onChanged: (value) => email = value,
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          decoration: const InputDecoration(labelText: 'Contraseña'),
                          obscureText: true,
                          validator: (value) => value == null || value.isEmpty ? 'Campo requerido' : null,
                          onChanged: (value) => password = value,
                        ),
                        const SizedBox(height: 12),
                        DropdownButtonFormField<String>(
                          value: role.isNotEmpty ? role : null,
                          decoration: const InputDecoration(labelText: 'Rol'),
                          items: const [
                            DropdownMenuItem(value: 'admin', child: Text('Admin')),
                            DropdownMenuItem(value: 'medico', child: Text('Médico')),
                            DropdownMenuItem(value: 'paciente', child: Text('Paciente')),
                          ],
                          validator: (value) => value == null || value.isEmpty ? 'Campo requerido' : null,
                          onChanged: (value) {
                            setModalState(() => role = value ?? '');
                          },
                        ),
                        if (role == 'medico') ...[
                          const SizedBox(height: 16),
                          TextFormField(
                            decoration: const InputDecoration(labelText: 'Especialidad'),
                            validator: (value) => value == null || value.isEmpty ? 'Campo requerido' : null,
                            onChanged: (value) => especialidad = value,
                          ),
                          const SizedBox(height: 12),
                          TextFormField(
                            decoration: const InputDecoration(labelText: 'Número colegiado'),
                            validator: (value) => value == null || value.isEmpty ? 'Campo requerido' : null,
                            onChanged: (value) => numeroColegiado = value,
                          ),
                          const SizedBox(height: 12),
                          TextFormField(
                            decoration: const InputDecoration(labelText: 'Biografía'),
                            maxLines: 2,
                            onChanged: (value) => biografia = value,
                          ),
                        ],
                        if (role == 'paciente') ...[
                          const SizedBox(height: 16),
                          TextFormField(
                            decoration: const InputDecoration(labelText: 'Fecha de nacimiento (YYYY-MM-DD)'),
                            validator: (value) {
                              if (value == null || value.isEmpty) return 'Campo requerido';
                              try {
                                DateTime.parse(value);
                                return null;
                              } catch (_) {
                                return 'Formato inválido';
                              }
                            },
                            onChanged: (value) {
                              try {
                                fechaNacimiento = DateTime.parse(value);
                              } catch (_) {}
                            },
                          ),
                          const SizedBox(height: 12),
                          TextFormField(
                            decoration: const InputDecoration(labelText: 'Peso inicial (kg)'),
                            keyboardType: TextInputType.number,
                            validator: (value) {
                              if (value == null || value.isEmpty) return 'Campo requerido';
                              final v = double.tryParse(value);
                              if (v == null) return 'Número inválido';
                              return null;
                            },
                            onChanged: (value) => pesoInicial = double.tryParse(value),
                          ),
                          const SizedBox(height: 12),
                          TextFormField(
                            decoration: const InputDecoration(labelText: 'Altura (cm)'),
                            keyboardType: TextInputType.number,
                            validator: (value) {
                              if (value == null || value.isEmpty) return 'Campo requerido';
                              final v = double.tryParse(value);
                              if (v == null) return 'Número inválido';
                              return null;
                            },
                            onChanged: (value) => alturaCm = double.tryParse(value),
                          ),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              Checkbox(
                                value: tomaSuplementosHierro,
                                onChanged: (value) {
                                  setModalState(() => tomaSuplementosHierro = value ?? false);
                                },
                              ),
                              const Text('Toma suplementos de hierro'),
                            ],
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.of(context).pop(),
                    child: const Text('Cancelar'),
                  ),
                  ElevatedButton(
                    onPressed: isLoading
                        ? null
                        : () async {
                            if (_formKey.currentState?.validate() ?? false) {
                              setModalState(() => isLoading = true);
                              try {
                                final api = context.read<NutriAppApi>();
                                final payload = <String, dynamic>{
                                  'name': name,
                                  'email': email,
                                  'password': password,
                                  'role': role,
                                };
                                if (role == 'medico') {
                                  medicoProfile = {
                                    'especialidad': especialidad,
                                    'numero_colegiado': numeroColegiado,
                                    'biografia': biografia,
                                  };
                                  payload['medicoProfile'] = medicoProfile;
                                }
                                if (role == 'paciente') {
                                  pacienteProfile = {
                                    'fecha_nacimiento': fechaNacimiento?.toIso8601String().substring(0, 10),
                                    'peso_inicial_kg': pesoInicial,
                                    'altura_cm': alturaCm,
                                    'toma_suplementos_hierro': tomaSuplementosHierro,
                                  };
                                  payload['pacienteProfile'] = pacienteProfile;
                                }
                                await api.admin.createUsuario(payload);
                                Navigator.of(context).pop();
                                await _fetchUsuarios();
                              } catch (e) {
                                setModalState(() => isLoading = false);
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(content: Text('Error: ${e.toString().replaceFirst('Exception: ', '')}')),
                                );
                              }
                            }
                          },
                    child: isLoading ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2)) : const Text('Crear'),
                  ),
                ],
              );
            },
          );
        },
      );
    }
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

  Future<void> _deactivateUsuario(String userId) async {
    setState(() => _isLoading = true);
    try {
      final api = context.read<NutriAppApi>();
      await api.admin.deleteUsuario(userId);
      await _fetchUsuarios();
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceFirst('Exception: ', '');
        _isLoading = false;
      });
    }
  }

  Future<void> _restoreUsuario(String userId) async {
    setState(() => _isLoading = true);
    try {
      final api = context.read<NutriAppApi>();
      await api.admin.restoreUsuario(userId);
      await _fetchUsuarios();
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceFirst('Exception: ', '');
        _isLoading = false;
      });
    }
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
            tooltip: 'Agregar usuario',
            onPressed: () {
              _showCreateUsuarioModal(context);
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
                    _showEditUsuarioModal(context, user);
                  },
                ),
                isActive
                    ? IconButton(
                        icon: const Icon(Icons.delete, size: 20, color: AppColors.primary),
                        tooltip: 'Desactivar usuario',
                        onPressed: () async {
                          await _deactivateUsuario(user['id'] ?? '');
                        },
                      )
                    : IconButton(
                        icon: const Icon(Icons.restore, size: 20, color: Colors.green),
                        tooltip: 'Restaurar usuario',
                        onPressed: () async {
                          await _restoreUsuario(user['id'] ?? '');
                        },
                      ),
              ],
            )),
          ]);
        }).toList(),
      ),
    );
  }

  void _showEditUsuarioModal(BuildContext context, Map<String, dynamic> user) {
    final _formKey = GlobalKey<FormState>();
    String name = user['name'] ?? '';
    String role = user['role'] ?? '';
    bool isLoading = false;

    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return AlertDialog(
              title: const Text('Editar Usuario'),
              content: Form(
                key: _formKey,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TextFormField(
                      initialValue: name,
                      decoration: const InputDecoration(labelText: 'Nombre'),
                      validator: (value) => value == null || value.isEmpty ? 'Campo requerido' : null,
                      onChanged: (value) => name = value,
                    ),
                    const SizedBox(height: 16),
                    DropdownButtonFormField<String>(
                      value: role.isNotEmpty ? role : null,
                      decoration: const InputDecoration(labelText: 'Rol'),
                      items: const [
                        DropdownMenuItem(value: 'admin', child: Text('Admin')),
                        DropdownMenuItem(value: 'medico', child: Text('Médico')),
                        DropdownMenuItem(value: 'paciente', child: Text('Paciente')),
                      ],
                      validator: (value) => value == null || value.isEmpty ? 'Campo requerido' : null,
                      onChanged: (value) => role = value ?? '',
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
                  onPressed: isLoading
                      ? null
                      : () async {
                          if (_formKey.currentState?.validate() ?? false) {
                            setModalState(() => isLoading = true);
                            try {
                              final api = context.read<NutriAppApi>();
                              await api.admin.updateUsuario(user['id'], {
                                'name': name,
                                'role': role,
                              });
                              Navigator.of(context).pop();
                              await _fetchUsuarios();
                            } catch (e) {
                              setModalState(() => isLoading = false);
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text('Error: ${e.toString().replaceFirst('Exception: ', '')}')),
                              );
                            }
                          }
                        },
                  child: isLoading ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2)) : const Text('Guardar'),
                ),
              ],
            );
          },
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