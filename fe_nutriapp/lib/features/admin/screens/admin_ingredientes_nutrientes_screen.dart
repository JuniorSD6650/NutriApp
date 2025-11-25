import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fe_nutriapp/core/services/nutriapp_api.dart';
import 'admin_ingredientes_section.dart';
import 'admin_nutrientes_section.dart';

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

// Vista de Ingredientes
class _IngredientesView extends StatefulWidget {
  @override
  State<_IngredientesView> createState() => _IngredientesViewState();
}

class _IngredientesViewState extends State<_IngredientesView> {
  List<dynamic> _ingredientes = [];
  int _currentPage = 1;
  String? _searchName;
  String _estado = 'activo';
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
    try {
      final api = context.read<NutriAppApi>();
      final response = await api.admin.getIngredientes(
        page: _currentPage,
        name: _searchName?.trim(),
        estado: _estado == 'todos' ? '' : _estado,
      );
      setState(() {
        _ingredientes = response['data'] ?? [];
        _currentPage = int.tryParse(response['page'].toString()) ?? 1;
      });
    } catch (e) {
      // Manejo de error si se requiere
    }
  }

  @override
  Widget build(BuildContext context) {
    // Delegar la vista a AdminIngredientesSection
    return AdminIngredientesSection(
      ingredientes: _ingredientes,
      onEdit: (ingrediente) {/* lógica de edición */},
      onDelete: (ingrediente) {/* lógica de eliminación */},
      onAdd: () {/* lógica de agregar */},
    );
  }
}

// Vista de Nutrientes
class _NutrientesView extends StatefulWidget {
  @override
  State<_NutrientesView> createState() => _NutrientesViewState();
}

class _NutrientesViewState extends State<_NutrientesView> {
  List<dynamic> _nutrientes = [];
  int _currentPage = 1;
  String? _searchName;
  String _estado = 'activo';

  @override
  void initState() {
    super.initState();
    _fetchNutrientes();
  }

  Future<void> _fetchNutrientes() async {
    try {
      final api = context.read<NutriAppApi>();
      final response = await api.admin.getNutrientes(
        page: _currentPage,
        name: _searchName,
        estado: _estado == 'todos' ? '' : _estado,
      );
      setState(() {
        _nutrientes = response['data'] ?? [];
        _currentPage = int.tryParse(response['page'].toString()) ?? 1;
      });
    } catch (e) {
      // Manejo de error si se requiere
    }
  }

  @override
  Widget build(BuildContext context) {
    // Delegar la vista a AdminNutrientesSection
    return AdminNutrientesSection(
      nutrientes: _nutrientes,
      onEdit: (nutriente) {/* lógica de edición */},
      onDelete: (nutriente) {/* lógica de eliminación */},
      onAdd: () {/* lógica de agregar */},
    );
  }
}
