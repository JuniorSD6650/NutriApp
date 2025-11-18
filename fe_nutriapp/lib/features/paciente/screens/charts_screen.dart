// lib/features/paciente/screens/charts_screen.dart
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:fe_nutriapp/core/theme/app_colors.dart';
import 'package:provider/provider.dart';
import 'package:fe_nutriapp/core/services/api_service.dart';
import 'package:fl_chart/fl_chart.dart'; // <-- AÑADIR IMPORT

class ChartsScreen extends StatefulWidget {
  const ChartsScreen({super.key});

  @override
  State<ChartsScreen> createState() => _ChartsScreenState();
}

class _ChartsScreenState extends State<ChartsScreen> {
  bool _isLoading = true;
  String? _errorMessage;
  Map<String, dynamic>? _estadisticas;
  String _selectedNutrient = 'Hierro';
  int _rangeOffset = 0; // 0 = última semana, -1 = semana anterior, etc.

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final now = DateTime.now();
      // CORRECCIÓN: Calcular la fecha de inicio de la semana actual
      final fechaFinBase = now.subtract(Duration(days: now.weekday - 1)); // Lunes de esta semana
      final fechaFin = fechaFinBase.add(Duration(days: (_rangeOffset * 7) + 6)); // Domingo
      final fechaInicio = fechaFin.subtract(const Duration(days: 6)); // Lunes

      final apiService = context.read<ApiService>();
      final data = await apiService.getEstadisticasNutrientes(
        fechaInicio: DateFormat('yyyy-MM-dd').format(fechaInicio),
        fechaFin: DateFormat('yyyy-MM-dd').format(fechaFin),
      );

      setState(() {
        _estadisticas = data;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceFirst('Exception: ', '');
        _isLoading = false;
      });
    }
  }

  void _changeWeek(int direction) {
    setState(() {
      _rangeOffset += direction;
    });
    _fetchData();
  }

  String _getRangeTitle() {
    if (_estadisticas == null) return '';
    final inicio = DateFormat('MMM d', 'es_ES').format(DateTime.parse(_estadisticas!['fechaInicio']));
    final fin = DateFormat('MMM d, yyyy', 'es_ES').format(DateTime.parse(_estadisticas!['fechaFin']));
    return '$inicio - $fin';
  }

  List<String> _getAvailableNutrients() {
    if (_estadisticas == null || _estadisticas!['resumen'] == null) return ['Hierro'];
    final resumen = _estadisticas!['resumen'] as Map<String, dynamic>;
    if (resumen.isEmpty) return ['Hierro']; // <-- AÑADIR VALIDACIÓN
    return resumen.keys.toList();
  }

  // --- NUEVO: Construir el gráfico de barras ---
  Widget _buildNutrientChart(BuildContext context) {
    final nutrientesPorDia = _estadisticas!['nutrientesPorDia'] as Map<String, dynamic>;
    final metasPorDia = _estadisticas!['metasPorDia'] as Map<String, dynamic>?;
    final resumen = _estadisticas!['resumen'] as Map<String, dynamic>;
    
    if (nutrientesPorDia.isEmpty || resumen.isEmpty) {
      return Card(
        margin: const EdgeInsets.all(16),
        child: Container(
          height: 250,
          alignment: Alignment.center,
          child: Text(
            'No hay datos para esta semana',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
        ),
      );
    }

    final fechasOrdenadas = nutrientesPorDia.keys.toList()..sort();
    final List<BarChartGroupData> barGroups = [];
    double maxY = 0;

    // NUEVO: Colores dinámicos según el nutriente
    final nutrientColors = {
      'Hierro': AppColors.primary,
      'Proteínas': Colors.blue,
      'Carbohidratos': Colors.green,
      'Calorías': Colors.orange,
      'Vitamina C': Colors.purple,
    };
    final barColor = nutrientColors[_selectedNutrient] ?? Colors.grey;

    // NUEVO: Solo mostrar metas para Hierro
    final esHierro = _selectedNutrient == 'Hierro';

    for (int i = 0; i < fechasOrdenadas.length; i++) {
      final fecha = fechasOrdenadas[i];
      final nutrientesDelDia = nutrientesPorDia[fecha] as Map<String, dynamic>;
      final consumido = (nutrientesDelDia[_selectedNutrient] ?? 0.0) as num;

      if (esHierro && metasPorDia != null) {
        // Barras apiladas para Hierro
        final meta = (metasPorDia[fecha] ?? 27.0) as num;
        final faltante = meta > consumido ? meta - consumido : 0.0;

        if (meta > maxY) maxY = meta.toDouble() * 1.2;

        barGroups.add(
          BarChartGroupData(
            x: i,
            barRods: [
              BarChartRodData(
                toY: meta.toDouble(),
                rodStackItems: [
                  BarChartRodStackItem(
                    0,
                    consumido.toDouble(),
                    consumido >= meta ? Colors.green : barColor,
                  ),
                  BarChartRodStackItem(
                    consumido.toDouble(),
                    meta.toDouble(),
                    Colors.grey.withOpacity(0.3),
                  ),
                ],
                width: 16,
                borderRadius: BorderRadius.circular(4),
              ),
            ],
          ),
        );
      } else {
        // Barras simples para otros nutrientes
        if (consumido > maxY) maxY = consumido.toDouble() * 1.2;

        barGroups.add(
          BarChartGroupData(
            x: i,
            barRods: [
              BarChartRodData(
                toY: consumido.toDouble(),
                color: barColor,
                width: 16,
                borderRadius: BorderRadius.circular(4),
              ),
            ],
          ),
        );
      }
    }

    return Card(
      margin: const EdgeInsets.all(16),
      color: Theme.of(context).brightness == Brightness.dark 
        ? AppColors.surfaceDark 
        : Colors.white, // <-- CAMBIO: Dinámico según el tema
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Consumo de $_selectedNutrient',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            // Leyenda solo para Hierro
            if (esHierro)
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _buildLegendItem('Consumido', Colors.green),
                  const SizedBox(width: 16),
                  _buildLegendItem('Faltante', Colors.grey.withOpacity(0.3)),
                ],
              ),
            const SizedBox(height: 16),
            SizedBox(
              height: 250,
              child: BarChart(
                BarChartData(
                  maxY: maxY,
                  barGroups: barGroups,
                  titlesData: FlTitlesData(
                    leftTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        reservedSize: 40,
                        getTitlesWidget: (value, meta) {
                          return Text(
                            value.toInt().toString(),
                            style: Theme.of(context).textTheme.bodySmall,
                          );
                        },
                      ),
                    ),
                    bottomTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        getTitlesWidget: (value, meta) {
                          if (value.toInt() >= 0 && value.toInt() < fechasOrdenadas.length) {
                            final fecha = DateTime.parse(fechasOrdenadas[value.toInt()]);
                            final dias = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
                            return Padding(
                              padding: const EdgeInsets.only(top: 8.0),
                              child: Text(
                                dias[fecha.weekday - 1],
                                style: Theme.of(context).textTheme.bodySmall,
                              ),
                            );
                          }
                          return const Text('');
                        },
                      ),
                    ),
                    rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  ),
                  borderData: FlBorderData(show: false),
                  gridData: FlGridData(
                    show: true,
                    drawVerticalLine: false,
                    getDrawingHorizontalLine: (value) {
                      return FlLine(
                        color: Colors.grey.withOpacity(0.2),
                        strokeWidth: 1,
                      );
                    },
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLegendItem(String label, Color color) {
    return Row(
      children: [
        Container(
          width: 12,
          height: 12,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(2),
          ),
        ),
        const SizedBox(width: 4),
        Text(label, style: Theme.of(context).textTheme.bodySmall),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Estadísticas'),
        elevation: 0,
      ),
      body: _isLoading
        ? const Center(child: CircularProgressIndicator())
        : _errorMessage != null
          ? Center(child: Text(_errorMessage!, style: const TextStyle(color: Colors.red)))
          : SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Navegación de semanas
                  Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        IconButton(
                          icon: const Icon(Icons.chevron_left),
                          onPressed: () => _changeWeek(-1),
                        ),
                        Text(
                          _getRangeTitle(),
                          style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
                        ),
                        IconButton(
                          icon: Icon(
                            Icons.chevron_right,
                            color: _rangeOffset >= 0 ? Colors.grey : null, // CORRECCIÓN: Deshabilitar si está en la semana actual
                          ),
                          onPressed: _rangeOffset >= 0 ? null : () => _changeWeek(1),
                        ),
                      ],
                    ),
                  ),

                  // Selector de nutriente
                  _buildNutrientSelector(context),

                  // Gráfico de barras CON LÍNEA DE META
                  _buildNutrientChart(context), // <-- CAMBIO AQUÍ

                  // Resumen del nutriente seleccionado
                  _buildNutrientSummary(context),

                  // Tarjetas de resumen de todos los nutrientes
                  Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Text('Resumen Semanal', style: theme.textTheme.titleLarge),
                  ),
                  _buildNutrientCards(context),
                ],
              ),
            ),
    );
  }

  Widget _buildNutrientSelector(BuildContext context) {
    final availableNutrients = _getAvailableNutrients();
    
    // VALIDACIÓN: Si la lista está vacía, usar ['Hierro'] por defecto
    if (availableNutrients.isEmpty) {
      return const SizedBox.shrink();
    }
    
    if (!availableNutrients.contains(_selectedNutrient)) {
      _selectedNutrient = availableNutrients.first;
    }

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.border),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: _selectedNutrient,
          icon: const Icon(Icons.keyboard_arrow_down, color: AppColors.primary),
          style: Theme.of(context).textTheme.titleMedium,
          onChanged: (String? newValue) {
            setState(() {
              _selectedNutrient = newValue!;
            });
          },
          items: availableNutrients.map<DropdownMenuItem<String>>((String value) {
            return DropdownMenuItem<String>(
              value: value,
              child: Text(value),
            );
          }).toList(),
        ),
      ),
    );
  }

  Widget _buildNutrientSummary(BuildContext context) {
    final theme = Theme.of(context);
    final resumen = _estadisticas!['resumen'] as Map<String, dynamic>;
    
    // VALIDACIÓN: Si no hay resumen, no mostrar nada
    if (resumen.isEmpty) {
      return const SizedBox.shrink();
    }
    
    final nutrientData = resumen[_selectedNutrient];

    if (nutrientData == null) {
      return const SizedBox.shrink();
    }

    final total = (nutrientData['total'] ?? 0.0).toStringAsFixed(1);
    final promedio = (nutrientData['promedio'] ?? 0.0).toStringAsFixed(1);

    return Card(
      margin: const EdgeInsets.all(16),
      color: Theme.of(context).brightness == Brightness.dark 
        ? AppColors.surfaceDark 
        : Colors.white, // <-- CAMBIO: Dinámico
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Resumen de $_selectedNutrient', style: theme.textTheme.titleMedium),
            const Divider(),
            _buildMetricRow(context, 'Total consumido:', '$total mg'),
            _buildMetricRow(context, 'Promedio diario:', '$promedio mg'),
          ],
        ),
      ),
    );
  }

  Widget _buildMetricRow(BuildContext context, String title, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(title, style: Theme.of(context).textTheme.bodyMedium),
          Text(value, style: Theme.of(context).textTheme.titleSmall?.copyWith(
            color: AppColors.textPrimary
          )),
        ],
      ),
    );
  }

  Widget _buildNutrientCards(BuildContext context) {
    final resumen = _estadisticas!['resumen'] as Map<String, dynamic>;
    
    // VALIDACIÓN: Si no hay datos, mostrar mensaje
    if (resumen.isEmpty) {
      return const Padding(
        padding: EdgeInsets.all(16.0),
        child: Text('No hay datos de nutrientes para esta semana'),
      );
    }
    
    final List<Widget> cards = [];

    final colors = [
      Colors.orange,
      Colors.green,
      Colors.purple,
      Colors.blue,
      Colors.red,
    ];

    int colorIndex = 0;
    for (final entry in resumen.entries) {
      final nutriente = entry.key;
      final data = entry.value as Map<String, dynamic>;
      final promedio = (data['promedio'] ?? 0.0).toStringAsFixed(1);

      cards.add(
        Expanded(
          child: _MacroCard(
            title: nutriente,
            value: '$promedio mg',
            color: colors[colorIndex % colors.length],
          ),
        ),
      );

      colorIndex++;
    }

    // Agrupar en filas de 2
    final List<Widget> rows = [];
    for (int i = 0; i < cards.length; i += 2) {
      rows.add(
        Row(
          children: [
            cards[i],
            if (i + 1 < cards.length) cards[i + 1] else const Expanded(child: SizedBox.shrink()),
          ],
        ),
      );
    }

    return Column(children: rows);
  }
}

class _MacroCard extends StatelessWidget {
  final String title;
  final String value;
  final Color color;

  const _MacroCard({required this.title, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      margin: const EdgeInsets.all(8),
      elevation: 2,
      color: theme.brightness == Brightness.dark 
        ? AppColors.surfaceDark 
        : Colors.white, 
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 10,
                  height: 10,
                  decoration: BoxDecoration(shape: BoxShape.circle, color: color),
                ),
                const SizedBox(width: 8),
                Flexible(child: Text(title, style: theme.textTheme.bodyMedium)),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              value,
              style: theme.textTheme.headlineSmall?.copyWith(
                color: theme.textTheme.bodyLarge?.color
              ),
            ),
          ],
        ),
      ),
    );
  }
}