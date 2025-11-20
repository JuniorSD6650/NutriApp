import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fe_nutriapp/core/services/nutriapp_api.dart';
import 'package:fl_chart/fl_chart.dart';

class PlatilloIngredientesDetailScreen extends StatefulWidget {
  final String platilloId;
  final String platilloNombre;

  const PlatilloIngredientesDetailScreen({
    super.key,
    required this.platilloId,
    required this.platilloNombre,
  });

  @override
  State<PlatilloIngredientesDetailScreen> createState() =>
      _PlatilloIngredientesDetailScreenState();
}

class _PlatilloIngredientesDetailScreenState
    extends State<PlatilloIngredientesDetailScreen> {
  bool _isLoading = true;
  Map<String, dynamic>? _platillo;
  List<dynamic> _todosIngredientes = [];

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final api = context.read<NutriAppApi>();
      
      // ✅ Cargar TODOS los ingredientes (sin paginación)
      final platillo = await api.admin.getPlatilloById(widget.platilloId);
      final ingredientesResponse = await api.admin.getAllIngredientes(); // ✅ NUEVO MÉTODO
      
      setState(() {
        _platillo = platillo;
        _todosIngredientes = ingredientesResponse;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error al cargar datos: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _eliminarIngrediente(String ingredienteId) async {
    try {
      final api = context.read<NutriAppApi>();
      
      // ✅ CORRECCIÓN: No esperar Map, solo ejecutar la acción
      await api.admin.removeIngredienteFromPlatillo(
        widget.platilloId,
        ingredienteId,
      );

      // ✅ RECARGAR DATOS INMEDIATAMENTE
      await _loadData();

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Ingrediente eliminado correctamente'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error al eliminar: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _mostrarDialogoAgregarIngrediente() async {
    await showDialog(
      context: context,
      builder: (context) => _AgregarIngredienteDialog(
        todosIngredientes: _todosIngredientes,
        onAgregar: (ingredienteId, cantidad, unidad) async {
          try {
            final api = context.read<NutriAppApi>();
            await api.admin.addIngredienteToPlatillo(
              widget.platilloId,
              ingredienteId,
              cantidad,
              unidad,
            );

            // ✅ RECARGAR DATOS INMEDIATAMENTE
            await _loadData();

            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Ingrediente agregado correctamente'),
                  backgroundColor: Colors.green,
                ),
              );
            }
          } catch (e) {
            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Error al agregar: $e'),
                  backgroundColor: Colors.red,
                ),
              );
            }
          }
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Ingredientes'),
        ),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    final ingredientes = _platillo?['ingredientesDetalle'] ?? [];
    
    if (ingredientes.isEmpty) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Ingredientes'),
        ),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text('Este platillo no tiene ingredientes.'),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: _mostrarDialogoAgregarIngrediente,
                icon: const Icon(Icons.add),
                label: const Text('Agregar ingrediente'),
              ),
            ],
          ),
        ),
      );
    }

    final totalCantidad = ingredientes.fold<double>(
      0.0,
      (double sum, item) => sum + (double.tryParse(item['cantidad'].toString()) ?? 0.0),
    );

    // ✅ Detectar si está en modo oscuro
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    // ✅ Definir paletas de colores según el tema
    final coloresModoClaro = [
      Colors.blue[900]!,
      Colors.green[900]!,
      Colors.red[900]!,
      Colors.purple[900]!,
      Colors.orange[900]!,
      Colors.teal[900]!,
      Colors.pink[900]!,
      Colors.indigo[900]!,
    ];

    final coloresModoOscuro = [
      Colors.blue[200]!,
      Colors.green[200]!,
      Colors.red[200]!,
      Colors.purple[200]!,
      Colors.orange[200]!,
      Colors.teal[200]!,
      Colors.pink[200]!,
      Colors.indigo[200]!,
    ];

    final colores = isDarkMode ? coloresModoOscuro : coloresModoClaro;

    final sections = ingredientes.map<PieChartSectionData>((ingrediente) {
      final cantidad = double.tryParse(ingrediente['cantidad'].toString()) ?? 0.0;
      final porcentaje = (cantidad / totalCantidad) * 100;

      return PieChartSectionData(
        value: porcentaje,
        title: '${porcentaje.toStringAsFixed(1)}%',
        color: colores[ingredientes.indexOf(ingrediente) % colores.length],
        radius: 50,
        titleStyle: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.bold,
          color: isDarkMode ? Colors.black : Colors.white, // ✅ Texto según tema
        ),
      );
    }).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Ingredientes'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: _mostrarDialogoAgregarIngrediente,
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Text(
              widget.platilloNombre,
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 16),
            SizedBox(
              height: 200,
              child: PieChart(
                PieChartData(
                  sections: sections,
                  centerSpaceRadius: 40,
                  sectionsSpace: 2,
                ),
              ),
            ),
            const SizedBox(height: 24),
            ...ingredientes.map<Widget>((ingrediente) {
              final nombre = ingrediente['nombre'] ?? 'Sin nombre';
              final cantidad = double.tryParse(ingrediente['cantidad'].toString()) ?? 0.0;
              final ingredienteId = ingrediente['ingredienteId'] ?? '';

              return Card(
                margin: const EdgeInsets.only(bottom: 8),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: colores[ingredientes.indexOf(ingrediente) % colores.length],
                  ),
                  title: Text(nombre),
                  subtitle: Text('${cantidad.toStringAsFixed(1)} g'),
                  trailing: IconButton(
                    icon: const Icon(Icons.delete, color: Colors.red),
                    onPressed: () {
                      showDialog(
                        context: context,
                        builder: (context) => AlertDialog(
                          title: const Text('Confirmar eliminación'),
                          content: Text('¿Deseas eliminar "$nombre" del platillo?'),
                          actions: [
                            TextButton(
                              onPressed: () => Navigator.of(context).pop(),
                              child: const Text('Cancelar'),
                            ),
                            TextButton(
                              onPressed: () {
                                Navigator.of(context).pop();
                                _eliminarIngrediente(ingredienteId);
                              },
                              child: const Text('Eliminar', style: TextStyle(color: Colors.red)),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
              );
            }).toList(),
          ],
        ),
      ),
    );
  }
}

class _AgregarIngredienteDialog extends StatefulWidget {
  final List<dynamic> todosIngredientes;
  final Function(String, double, String) onAgregar;

  const _AgregarIngredienteDialog({
    required this.todosIngredientes,
    required this.onAgregar,
  });

  @override
  State<_AgregarIngredienteDialog> createState() => _AgregarIngredienteDialogState();
}

class _AgregarIngredienteDialogState extends State<_AgregarIngredienteDialog> {
  String? _selectedIngredienteId;
  final _cantidadController = TextEditingController(text: '100');
  String _searchQuery = '';

  @override
  Widget build(BuildContext context) {
    final ingredientesFiltrados = widget.todosIngredientes.where((ing) {
      final nombre = (ing['name'] ?? '').toString().toLowerCase();
      return nombre.contains(_searchQuery.toLowerCase());
    }).toList();

    return AlertDialog(
      title: const Text('Agregar ingrediente'),
      content: SizedBox(
        width: double.maxFinite,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              decoration: const InputDecoration(
                labelText: 'Buscar ingrediente',
                prefixIcon: Icon(Icons.search),
                border: OutlineInputBorder(),
              ),
              onChanged: (value) {
                setState(() {
                  _searchQuery = value;
                });
              },
            ),
            const SizedBox(height: 16),
            SizedBox(
              height: 200,
              child: ListView.builder(
                shrinkWrap: true,
                itemCount: ingredientesFiltrados.length,
                itemBuilder: (context, index) {
                  final ing = ingredientesFiltrados[index];
                  return RadioListTile<String>(
                    title: Text(ing['name'] ?? 'Sin nombre'),
                    value: ing['id'],
                    groupValue: _selectedIngredienteId,
                    onChanged: (value) {
                      setState(() {
                        _selectedIngredienteId = value;
                      });
                    },
                  );
                },
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _cantidadController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Cantidad (g)',
                border: OutlineInputBorder(),
              ),
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
          onPressed: _selectedIngredienteId == null
              ? null
              : () {
                  final cantidad = double.tryParse(_cantidadController.text) ?? 0.0;
                  if (cantidad > 0) {
                    widget.onAgregar(_selectedIngredienteId!, cantidad, 'g');
                    Navigator.of(context).pop();
                  }
                },
          child: const Text('Agregar'),
        ),
      ],
    );
  }
}
