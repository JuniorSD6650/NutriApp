// lib/features/paciente/screens/daily_log_screen.dart
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:fe_nutriapp/core/theme/app_colors.dart';
import 'package:fe_nutriapp/features/paciente/screens/add_meal_screen.dart';
import 'package:provider/provider.dart';
import 'package:fe_nutriapp/core/services/api_service.dart';
import 'package:fe_nutriapp/core/services/auth_service.dart'; // <-- AÑADIR IMPORT
import 'package:fe_nutriapp/core/services/nutriapp_api.dart'; // <-- CAMBIO

class DailyLogScreen extends StatefulWidget {
  const DailyLogScreen({super.key});

  @override
  State<DailyLogScreen> createState() => _DailyLogScreenState();
}

class _DailyLogScreenState extends State<DailyLogScreen> {
  DateTime _selectedDate = DateTime.now();
  bool _isLoading = true;
  String? _errorMessage;
  Map<String, dynamic>? _dailyData;
  Map<String, dynamic>? _metaData; // <-- NUEVO

  @override
  void initState() {
    super.initState();
    _fetchDailyLog();
  }

  Future<void> _fetchDailyLog() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final api = context.read<NutriAppApi>(); // <-- CAMBIO
      
      final results = await Future.wait([
        api.registros.getResumenDiario(_selectedDate), // <-- CAMBIO
        api.metas.getMetaActiva(_selectedDate), // <-- CAMBIO
      ]);
      
      setState(() {
        _dailyData = results[0] as Map<String, dynamic>?;
        _metaData = results[1] as Map<String, dynamic>?;
        _isLoading = false;
      });
    } catch (e) {
      print('Error en _fetchDailyLog: $e');
      setState(() {
        _errorMessage = e.toString().replaceFirst('Exception: ', '');
        _isLoading = false;
      });
    }
  }

  void _onDateSelected(DateTime date) {
    setState(() {
      _selectedDate = date;
    });
    _fetchDailyLog();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: Text('Diario de Comidas', style: theme.appBarTheme.titleTextStyle),
        actions: [
          IconButton(
            icon: const Icon(Icons.calendar_today),
            onPressed: () async {
              final picked = await showDatePicker(
                context: context,
                initialDate: _selectedDate,
                firstDate: DateTime(2020),
                lastDate: DateTime.now(),
              );
              if (picked != null) _onDateSelected(picked);
            },
          )
        ],
      ),
      body: _isLoading
        ? const Center(child: CircularProgressIndicator())
        : _errorMessage != null
          ? Center(child: Text(_errorMessage!, style: const TextStyle(color: Colors.red)))
          : Column(
              children: [
                _buildCalendarStrip(context),
                const SizedBox(height: 10),
                Expanded(
                  child: ListView(
                    padding: const EdgeInsets.only(bottom: 80),
                    children: [
                      _buildDailySummary(context),
                      _buildMealSection(context, 'Desayuno', 'desayuno'),
                      _buildMealSection(context, 'Almuerzo', 'almuerzo'),
                      _buildMealSection(context, 'Cena', 'cena'),
                      _buildMealSection(context, 'Snack', 'snack'),
                    ],
                  ),
                ),
              ],
            ),
    );
  }

  // --- WIDGETS DE UI (Sin lógica de backend) ---

  Widget _buildCalendarStrip(BuildContext context) {
    final theme = Theme.of(context);
    final List<DateTime> days = List.generate(
      7, (index) => DateTime.now().subtract(Duration(days: 3 - index))
    );

    return Container(
      height: 70,
      color: theme.scaffoldBackgroundColor,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: days.length,
        itemBuilder: (context, index) {
          final day = days[index];
          final isSelected = day.day == _selectedDate.day && 
                             day.month == _selectedDate.month;
          
          final dayName = DateFormat('E', 'es_ES').format(day).substring(0, 2).toUpperCase();

          return GestureDetector(
            onTap: () => _onDateSelected(day),
            child: Container(
              width: 50,
              margin: const EdgeInsets.symmetric(horizontal: 4, vertical: 8),
              decoration: BoxDecoration(
                color: isSelected ? AppColors.primary : theme.cardColor,
                borderRadius: BorderRadius.circular(12),
                // Borde para "hoy"
                border: (day.day == DateTime.now().day) && !isSelected 
                  ? Border.all(color: AppColors.primary, width: 2) : null,
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    dayName,
                    style: TextStyle(
                      fontSize: 10,
                      color: isSelected ? Colors.white : AppColors.textSecondary,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    day.day.toString(),
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: isSelected ? Colors.white : theme.textTheme.bodyLarge?.color,
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildDailySummary(BuildContext context) {
    final theme = Theme.of(context);
    final consumed = (_dailyData?['totalHierro'] ?? 0.0) as num;
    final goal = (_metaData?['hierroObjetivo'] ?? 27.0) as num;
    
    // --- LÓGICA DE ESTADO DEL PROGRESO ---
    final double excessThreshold = goal * 1.2; // 120% de la meta
    
    String statusText;
    String displayValue;
    Color displayColor;
    Color? borderColor;

    if (consumed >= excessThreshold) {
      // Estado 1: Riesgo de Exceso
      statusText = 'Riesgo (Exceso)';
      displayValue = '${(consumed - goal).toStringAsFixed(1)} mg extra';
      displayColor = Colors.red.shade700;
      borderColor = Colors.red.shade700;
    } else if (consumed >= goal) {
      // Estado 2: Meta Cumplida
      statusText = 'Meta Cumplida';
      displayValue = '${consumed.toStringAsFixed(1)} mg';
      displayColor = Colors.green.shade700;
      borderColor = Colors.green.shade700;
    } else {
      // Estado 3: Pendiente
      statusText = 'Restante';
      displayValue = '${(goal - consumed).toStringAsFixed(1)} mg';
      displayColor = AppColors.primary;
      borderColor = null; // Sin borde en estado pendiente
    }

    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: theme.cardColor,
        borderRadius: BorderRadius.circular(16),
        border: borderColor != null 
          ? Border.all(color: borderColor, width: 2) 
          : null,
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildSummaryItem(context, 'Meta', '${goal.toStringAsFixed(0)} mg'),
          _buildSummaryItem(context, 'Consumido', '${consumed.toStringAsFixed(1)} mg', color: AppColors.primary),
          _buildSummaryItem(context, statusText, displayValue, color: displayColor),
        ],
      ),
    );
  }

  Widget _buildSummaryItem(BuildContext context, String label, String value, {Color? color}) {
    final theme = Theme.of(context);
    return Column(
      children: [
        Text(value, style: TextStyle(
          fontSize: 18, 
          fontWeight: FontWeight.bold, 
          color: color ?? theme.textTheme.bodyLarge?.color
        )),
        Text(label, style: theme.textTheme.bodySmall),
      ],
    );
  }

  Widget _buildMealSection(BuildContext context, String title, String typeKey) {
    final theme = Theme.of(context);
    final registrosPorTipo = _dailyData?['registrosPorTipo'];
    
    // VALIDACIÓN ADICIONAL
    if (registrosPorTipo == null || registrosPorTipo is! Map) {
      return const SizedBox.shrink();
    }
    
    final meals = (registrosPorTipo[typeKey] as List<dynamic>?) ?? [];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 24, 16, 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title, style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
              InkWell(
                onTap: () async {
                  await Navigator.push(
                    context, 
                    MaterialPageRoute(builder: (context) => const AddMealScreen())
                  );
                  _fetchDailyLog();
                },
                child: const Text('+ Añadir', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ),

        if (meals.isEmpty)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Text('Nada registrado aún.', style: TextStyle(color: AppColors.textSecondary, fontStyle: FontStyle.italic)),
          )
        else
          ...meals.map((meal) => _buildMealItem(context, meal)),
          
        const Divider(indent: 16, endIndent: 16),
      ],
    );
  }

  Widget _buildMealItem(BuildContext context, dynamic meal) {
    final theme = Theme.of(context);
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      leading: Container(
        width: 50,
        height: 50,
        decoration: BoxDecoration(
          color: Colors.blue.shade50,
          borderRadius: BorderRadius.circular(8),
        ),
        child: const Icon(Icons.fastfood, color: AppColors.primary),
      ),
      title: Text(meal['nombre'], style: theme.textTheme.titleMedium),
      subtitle: Text('${meal['porciones']} porción • ${meal['hierro']} mg Hierro'), // <-- Sin calorías
      trailing: IconButton(
        icon: const Icon(Icons.more_vert, size: 20),
        onPressed: () {
          // TODO: Menú para editar/eliminar
        },
      ),
    );
  }
}