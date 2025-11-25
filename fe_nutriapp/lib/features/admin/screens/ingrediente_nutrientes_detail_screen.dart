import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fe_nutriapp/core/services/nutriapp_api.dart';

class IngredienteNutrientesDetailScreen extends StatefulWidget {
  final String ingredienteId;
  final String ingredienteNombre;

  const IngredienteNutrientesDetailScreen({
    Key? key,
    required this.ingredienteId,
    required this.ingredienteNombre,
  }) : super(key: key);

  @override
  State<IngredienteNutrientesDetailScreen> createState() => _IngredienteNutrientesDetailScreenState();
}

class _IngredienteNutrientesDetailScreenState extends State<IngredienteNutrientesDetailScreen> {
  bool _isLoading = true;
  String? _errorMessage;
  List<dynamic> _nutrientes = [];

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
      final ingrediente = await api.admin.getIngredienteById(widget.ingredienteId.toString());
      _nutrientes = ingrediente['nutrientes'] ?? [];
      setState(() {
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
        _isLoading = false;
      });
    }
  }

  void _addNutriente() async {
    final api = context.read<NutriAppApi>();
    String? selectedNutrienteId;
    double? valuePer100g;
    String? error;
    List<dynamic> allNutrientes = [];
    try {
      final response = await api.admin.getNutrientes(page: 1, estado: 'activo');
      allNutrientes = response['data'] as List<dynamic>;
      // Filtrar para mostrar solo los activos y no añadidos
      final existentes = _nutrientes.map((n) => n['nutriente'] != null ? n['nutriente']['id'].toString() : '').toSet();
      allNutrientes = allNutrientes
        .where((n) => !existentes.contains(n['id'].toString()))
        .toList();
    } catch (e) {
      error = 'Error al cargar nutrientes';
    }
    await showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return AlertDialog(
              title: const Text('Agregar nutriente'),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (error != null) Text(error!, style: const TextStyle(color: Colors.red)),
                  DropdownButtonFormField<String>(
                    decoration: const InputDecoration(labelText: 'Nutriente'),
                    items: allNutrientes.isEmpty
                        ? [DropdownMenuItem(value: '', child: Text('No hay nutrientes disponibles'))]
                        : allNutrientes.map((n) {
                            return DropdownMenuItem(
                              value: n['id'].toString(),
                              child: Text(n['name'] ?? ''),
                            );
                          }).toList(),
                    onChanged: (value) {
                      setModalState(() => selectedNutrienteId = value);
                    },
                  ),
                  TextFormField(
                    decoration: const InputDecoration(labelText: 'Valor por 100g'),
                    keyboardType: TextInputType.number,
                    onChanged: (value) {
                      setModalState(() => valuePer100g = double.tryParse(value));
                    },
                  ),
                ],
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: const Text('Cancelar'),
                ),
                ElevatedButton(
                  onPressed: selectedNutrienteId != null && selectedNutrienteId != '' && valuePer100g != null
                      ? () async {
                          try {
                            await api.admin.addNutrienteToIngrediente(
                              ingredienteId: widget.ingredienteId.toString(),
                              nutrienteId: selectedNutrienteId!,
                              valuePer100g: valuePer100g!,
                            );
                            Navigator.of(context).pop();
                            _fetchNutrientes();
                          } catch (e) {
                            setModalState(() => error = 'Error al agregar nutriente');
                          }
                        }
                      : null,
                  child: const Text('Agregar'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  void _removeNutriente(dynamic nutriente) async {
    final api = context.read<NutriAppApi>();
    setState(() {
      _errorMessage = null;
    });
    try {
      await api.admin.removeNutrienteFromIngrediente(
        ingredienteId: widget.ingredienteId.toString(),
        nutrienteId: nutriente['nutriente'] != null ? nutriente['nutriente']['id'].toString() : nutriente['id'].toString(),
      );
      await _fetchNutrientes();
      setState(() {}); // Fuerza el rebuild para ver los cambios inmediatamente
    } catch (e) {
      await _fetchNutrientes();
      final stillExists = _nutrientes.any((n) => n['nutriente'] != null && n['nutriente']['id'].toString() == (nutriente['nutriente'] != null ? nutriente['nutriente']['id'].toString() : nutriente['id'].toString()));
      if (stillExists) {
        setState(() {
          _errorMessage = 'Error al eliminar nutriente';
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Nutrientes de ${widget.ingredienteNombre}'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: _addNutriente,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _errorMessage != null
              ? Center(child: Text('Error: $_errorMessage', style: const TextStyle(color: Colors.red)))
              : ListView.builder(
                  itemCount: _nutrientes.length,
                  itemBuilder: (context, index) {
                    final nutriente = _nutrientes[index];
                    final nutrienteData = nutriente['nutriente'] ?? {};
                    final isInactive = nutrienteData['deletedAt'] != null;
                    return ListTile(
                      title: Text(
                        nutrienteData['name'] ?? '',
                        style: isInactive
                            ? const TextStyle(color: Colors.grey, fontStyle: FontStyle.italic)
                            : null,
                      ),
                      subtitle: Text('${nutriente['value_per_100g']} ${nutrienteData['unit'] ?? ''}'),
                      trailing: IconButton(
                        icon: const Icon(Icons.delete, color: Colors.red),
                        onPressed: () => _removeNutriente(nutriente),
                      ),
                    );
                  },
                ),
    );
  }
}
