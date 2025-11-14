// lib/features/paciente/screens/home_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:pie_chart/pie_chart.dart';
import 'package:intl/intl.dart';
import 'package:fe_nutriapp/core/services/api_service.dart';
import 'package:fe_nutriapp/core/theme/app_colors.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  bool _isLoading = true;
  String? _errorMessage;
  Map<String, dynamic>? _summaryData;
  DateTime _selectedDate = DateTime.now();

  @override
  void initState() {
    super.initState();
    _fetchSummary();
  }

  Future<void> _fetchSummary() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final apiService = context.read<ApiService>();
      final data = await apiService.getMetaActiva(_selectedDate);
      
      setState(() {
        _summaryData = data;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceFirst('Exception: ', '');
        _isLoading = false;
      });
    }
  }

  void _onDateSelected(DateTime newDate) {
    setState(() {
      _selectedDate = newDate;
    });
    _fetchSummary();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: Text('SnapCalorie', style: theme.appBarTheme.titleTextStyle),
        actions: [
          IconButton(icon: const Icon(Icons.notifications_none), onPressed: () {}),
          IconButton(icon: const Icon(Icons.chat_bubble_outline), onPressed: () {}),
        ],
      ),
      body: _buildBody(context),
    );
  }

  Widget _buildBody(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_errorMessage != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Text(
            'Error: $_errorMessage\n\n(Asegúrate de tener un perfil de paciente creado y una meta asignada por tu médico)',
            textAlign: TextAlign.center,
            style: const TextStyle(color: Colors.red),
          ),
        ),
      );
    }

    if (_summaryData == null) {
      return Column(
        children: [
          _buildCalendar(),
          Expanded(
            child: Center(
              child: Text(
                'Sin metas registradas para este día.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Theme.of(context).textTheme.bodySmall?.color, fontSize: 16),
              ),
            ),
          ),
        ],
      );
    }
    return _buildDashboard(context, _summaryData!);
  }

  Widget _buildDashboard(BuildContext context, Map<String, dynamic> data) {
    final theme = Theme.of(context);
    final double totalHierro = (data['hierroConsumido'] ?? 0.0).toDouble();
    final double metaHierro = (data['hierroObjetivo'] ?? 27.0).toDouble();
    final double hierroRestante = (metaHierro - totalHierro) > 0 ? (metaHierro - totalHierro) : 0.0;
    
    final Map<String, double> hierroDataMap = {
      "Consumido": totalHierro,
      "Restante": hierroRestante,
    };

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildCalendar(),
          const SizedBox(height: 24),
          Text(
            'Dashboard', 
            style: theme.textTheme.headlineLarge?.copyWith(
              color: theme.textTheme.bodyLarge?.color // Asegura que el color sea visible en ambos modos
            )
          ),
          const SizedBox(height: 24),
          _buildProgressCard(
            context,
            title: 'Progreso de Hierro (mg)',
            dataMap: hierroDataMap,
            goal: metaHierro,
            consumed: totalHierro,
            remaining: hierroRestante,
            centerText: "${hierroRestante.toStringAsFixed(1)}\nRestante",
            colorList: [AppColors.primary, theme.colorScheme.surfaceVariant],
          ),
        ],
      ),
    );
  }

  // --- WIDGET DE CALENDARIO CORREGIDO ---
  Widget _buildCalendar() {
    final List<DateTime> days = List.generate(
      7,
      (index) => DateTime.now().subtract(Duration(days: 3 - index)),
    );
    final today = DateTime.now();
    
    final theme = Theme.of(context);

    return SizedBox(
      height: 65,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: days.length,
        itemBuilder: (context, index) {
          final day = days[index];
          final isSelected = day.day == _selectedDate.day &&
                             day.month == _selectedDate.month &&
                             day.year == _selectedDate.year;
          final bool isToday = day.day == today.day &&
                               day.month == today.month &&
                               day.year == today.year;

          final dayName = DateFormat('E', 'es_ES').format(day).substring(0, 2); 
          
          return GestureDetector(
            onTap: () => _onDateSelected(day),
            child: Container(
              width: 50,
              margin: const EdgeInsets.symmetric(horizontal: 4),
              decoration: BoxDecoration(
                // ¡AJUSTE! Usa el color primary para seleccionado, 
                // y el cardColor para no seleccionado (contraste sutil en oscuro)
                color: isSelected ? AppColors.primary : theme.cardColor, 
                borderRadius: BorderRadius.circular(12),
                border: isToday && !isSelected
                    ? Border.all(color: AppColors.primary, width: 2)
                    : null,
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    dayName,
                    style: TextStyle(
                      fontSize: 12,
                      // ¡AJUSTE! Blanco para seleccionado, secundario para no seleccionado
                      color: isSelected ? Colors.white : theme.textTheme.bodySmall?.color, 
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    day.day.toString(),
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      // ¡AJUSTE! Blanco para seleccionado, primario (bodyLarge) para no seleccionado
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
  
  // --- WIDGET DE TARJETA DE PROGRESO CORREGIDO ---
  Widget _buildProgressCard(
    BuildContext context, {
    required String title,
    required Map<String, double> dataMap,
    required double goal,
    required double consumed,
    required double remaining,
    required String centerText,
    required List<Color> colorList,
  }) {
    final theme = Theme.of(context);
    return Card(
      // ¡AJUSTE! Usa el color de la tarjeta del tema para el fondo
      color: theme.cardColor, 
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title, 
              style: theme.textTheme.titleMedium?.copyWith(
                color: theme.textTheme.bodyLarge?.color // Asegura que el color sea visible
              ),
            ),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                Stack(
                  alignment: Alignment.center,
                  children: [
                    PieChart(
                      dataMap: dataMap.isEmpty ? {"Restante": 1} : dataMap,
                      chartType: ChartType.ring,
                      ringStrokeWidth: 12,
                      chartRadius: MediaQuery.of(context).size.width / 4,
                      legendOptions: const LegendOptions(showLegends: false),
                      chartValuesOptions: const ChartValuesOptions(
                        showChartValues: false,
                      ),
                      colorList: colorList,
                      // ¡AJUSTE! Usa el color del fondo del scaffold para el color base del gráfico
                      baseChartColor: theme.scaffoldBackgroundColor, 
                    ),
                    Text(
                      centerText,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        // ¡AJUSTE! Usa el color de texto primario del tema
                        color: theme.textTheme.bodyLarge?.color, 
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Meta: ${goal.toStringAsFixed(1)}',
                      // ¡AJUSTE! Usa el color de texto secundario del tema
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: theme.textTheme.bodyMedium?.color
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Consumido: ${consumed.toStringAsFixed(1)}',
                      // ¡AJUSTE! Usa el color de texto secundario del tema
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: theme.textTheme.bodyMedium?.color
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}