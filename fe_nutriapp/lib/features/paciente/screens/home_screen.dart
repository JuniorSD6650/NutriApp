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

  // --- MÉTODO CORREGIDO ---
  Future<void> _fetchSummary() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final apiService = context.read<ApiService>();

      // 1. Pasa la fecha seleccionada al ApiService
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

  // Esta función ahora sí funciona
  void _onDateSelected(DateTime newDate) {
    setState(() {
      _selectedDate = newDate;
    });
    _fetchSummary(); // <-- Recarga los datos con la nueva fecha
  }

  @override
  Widget build(BuildContext context) {
    // ... (el widget build() sigue igual)
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: Text('SnapCalorie', style: theme.appBarTheme.titleTextStyle),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_none),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.chat_bubble_outline),
            onPressed: () {},
          ),
        ],
      ),
      body: _buildBody(context),
    );
  }

  Widget _buildBody(BuildContext context) {
    // ... (el widget _buildBody() sigue igual)
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
          _buildCalendar(), // Muestra el calendario
          const Expanded(
            child: Center(
              child: Text(
                'Sin metas registradas para este día.',
                textAlign: TextAlign.center,
                style: TextStyle(color: AppColors.textSecondary, fontSize: 16),
              ),
            ),
          ),
        ],
      );
    }
    return _buildDashboard(context, _summaryData!);
  }

  Widget _buildDashboard(BuildContext context, Map<String, dynamic> data) {
    // ... (el widget _buildDashboard() sigue igual)
    final theme = Theme.of(context);
    final double totalHierro = (data['hierroConsumido'] ?? 0.0).toDouble();
    final double metaHierro = (data['hierroObjetivo'] ?? 27.0).toDouble();
    final double hierroRestante =
        (metaHierro - totalHierro) > 0 ? (metaHierro - totalHierro) : 0.0;

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
          Text('Dashboard', style: theme.textTheme.headlineLarge),
          const SizedBox(height: 24),
          _buildProgressCard(
            context,
            title: 'Progreso de Hierro (mg)',
            dataMap: hierroDataMap,
            goal: metaHierro,
            consumed: totalHierro,
            remaining: hierroRestante,
            centerText: "${hierroRestante.toStringAsFixed(1)}\nRestante",
            colorList: [AppColors.primary, Colors.grey[200]!],
          ),
        ],
      ),
    );
  }

  Widget _buildCalendar() {
    // ... (el widget _buildCalendar() sigue igual)
    final List<DateTime> days = List.generate(
      7,
      (index) => DateTime.now().subtract(Duration(days: 3 - index)),
    );
    final today = DateTime.now();

    return SizedBox(
      height: 65,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: days.length,
        itemBuilder: (context, index) {
          final day = days[index];
          // Compara el día, mes y año
          final isSelected =
              day.day == _selectedDate.day &&
              day.month == _selectedDate.month &&
              day.year == _selectedDate.year;
          // Compara solo el día, mes y año
          final bool isToday =
              day.day == today.day &&
              day.month == today.month &&
              day.year == today.year;

          final dayName = DateFormat(
            'E',
            'es_ES',
          ).format(day).substring(0, 2); // 'Lu', 'Ma'

          return GestureDetector(
            onTap: () => _onDateSelected(day), // <-- Esto ahora funciona
            child: Container(
              width: 50,
              margin: const EdgeInsets.symmetric(horizontal: 4),
              decoration: BoxDecoration(
                color: isSelected ? AppColors.primary : AppColors.surface,
                borderRadius: BorderRadius.circular(12),
                border:
                    isToday
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
                      color:
                          isSelected ? Colors.white : AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    day.day.toString(),
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: isSelected ? Colors.white : AppColors.textPrimary,
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

  Widget _buildProgressCard(
    // ... (el widget _buildProgressCard() sigue igual)
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
      color: AppColors.surface,
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: theme.textTheme.titleMedium),
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
                      baseChartColor: Colors.grey[200]!,
                    ),
                    Text(
                      centerText,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        color: Colors.black,
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
                      style: theme.textTheme.bodyMedium,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Consumido: ${consumed.toStringAsFixed(1)}',
                      style: theme.textTheme.bodyMedium,
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
