// lib/features/paciente/screens/home_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:pie_chart/pie_chart.dart';
import 'package:intl/intl.dart';
import 'package:fe_nutriapp/core/services/nutriapp_api.dart'; // <-- CAMBIO
import 'package:fe_nutriapp/core/theme/app_colors.dart';
import 'package:table_calendar/table_calendar.dart';
import 'package:fe_nutriapp/core/services/widget_service.dart';

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
  
  // Estado para todas las metas del paciente
  List<dynamic> _todasLasMetas = [];
  bool _isLoadingMetas = true;
  DateTime _focusedDay = DateTime.now();
  DateTime? _selectedDay;

  // --- LEYENDA DE COLORES ---
  Widget _legendDot(Color? color, String label, {bool dark = false}) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 16,
          height: 16,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
            border: Border.all(color: dark ? Colors.white24 : Colors.black26),
          ),
        ),
        const SizedBox(width: 4),
        Text(label, style: TextStyle(fontSize: 12, color: dark ? Colors.white : Colors.black)),
      ],
    );
  }

  // --- CALENDARIO DE METAS DIARIAS ---
  Widget _buildMetasDiariasCalendar(BuildContext context, Map<String, dynamic> data) {
      final theme = Theme.of(context);
      final isDark = theme.brightness == Brightness.dark;
      final fechaMeta = data['fecha'] ?? DateTime.now().toString().substring(0, 10);
      final hierroObjetivo = (data['hierroObjetivo'] ?? 0.0).toDouble();
      final hierroConsumido = (data['hierroConsumido'] ?? 0.0).toDouble();
      final completada = data['completada'] == true;
      final metaDate = DateTime.tryParse(fechaMeta) ?? DateTime.now();

      Color? bgColor;
      Color? textColor;
      IconData icon;
      String estado;
      if (metaDate.isAfter(DateTime.now())) {
        bgColor = isDark ? Colors.blue[900] : Colors.blue[100];
        textColor = isDark ? Colors.white : Colors.black;
        icon = Icons.schedule;
        estado = 'Meta futura';
      } else if (completada) {
        bgColor = isDark ? Colors.green[700] : Colors.green[200];
        textColor = isDark ? Colors.white : Colors.black;
        icon = Icons.check_circle;
        estado = 'Completada';
      } else {
        bgColor = isDark ? Colors.red[700] : Colors.red[200];
        textColor = isDark ? Colors.white : Colors.black;
        icon = Icons.cancel;
        estado = 'No completada';
      }

      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Meta diaria', style: theme.textTheme.titleMedium),
          const SizedBox(height: 8),
          Container(
            decoration: BoxDecoration(
              color: bgColor,
              borderRadius: BorderRadius.circular(16),
            ),
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Icon(icon, color: textColor, size: 32),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Fecha: $fechaMeta', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: textColor)),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          Icon(Icons.bolt, color: Colors.orange, size: 18),
                          const SizedBox(width: 4),
                          Text('Objetivo: $hierroObjetivo mg', style: TextStyle(fontSize: 14, color: textColor)),
                        ],
                      ),
                      const SizedBox(height: 2),
                      Row(
                        children: [
                          Icon(Icons.restaurant, color: Colors.blue, size: 18),
                          const SizedBox(width: 4),
                          Text('Consumido: $hierroConsumido mg', style: TextStyle(fontSize: 14, color: textColor)),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(estado, style: TextStyle(color: textColor, fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }

  @override
  void initState() {
    super.initState();
    _fetchSummary();
    _fetchTodasLasMetas();
  }

  Future<void> _fetchTodasLasMetas() async {
    setState(() {
      _isLoadingMetas = true;
    });
    try {
      final api = context.read<NutriAppApi>();
      final metas = await api.metas.getTodasMisMetas();
      setState(() {
        _todasLasMetas = metas;
        _isLoadingMetas = false;
      });
      
      // Actualizar el widget con la racha actual
      _actualizarWidget(metas);
    } catch (e) {
      setState(() {
        _isLoadingMetas = false;
      });
    }
  }

  Future<void> _actualizarWidget(List<dynamic> metas) async {
    // Calcular racha actual
    final metasPasadas = metas.where((m) {
      final fecha = DateTime.tryParse(m['fecha'] ?? '');
      if (fecha == null) return false;
      final hoy = DateTime.now();
      return fecha.isBefore(hoy) || (fecha.year == hoy.year && fecha.month == hoy.month && fecha.day == hoy.day);
    }).toList();

    if (metasPasadas.isEmpty) return;

    // Ordenar de más reciente a más antiguo
    final metasOrdenadas = metasPasadas.toList()
      ..sort((a, b) {
        final fechaA = DateTime.parse(a['fecha']);
        final fechaB = DateTime.parse(b['fecha']);
        return fechaB.compareTo(fechaA);
      });

    // Contar racha
    int rachaActual = 0;
    for (var meta in metasOrdenadas) {
      if (meta['completada'] == true) {
        rachaActual++;
      } else {
        break;
      }
    }

    // Obtener nombre del usuario
    final userData = await context.read<NutriAppApi>().auth.getProfile();
    final nombre = userData['name'] ?? 'Usuario';
    final rol = userData['role'] ?? 'paciente';

    // Actualizar widget
    await WidgetService.updateWidget(
      rachaActual: rachaActual,
      nombrePaciente: nombre,
      rol: rol,
    );
  }  Future<void> _fetchSummary() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final api = context.read<NutriAppApi>(); // <-- CAMBIO
      final data = await api.metas.getMetaActiva(_selectedDate); // <-- CAMBIO
      
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
        title: Text('NutriApp', style: theme.appBarTheme.titleTextStyle),
        actions: [
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
          const SizedBox(height: 32),
          // --- Calendario mensual de metas diarias ---
          _buildMetasDiariasCalendarCompleto(context),
        ],
      ),
    );
  }

  // --- CALENDARIO MENSUAL DE METAS DIARIAS ---
  Widget _buildMetasDiariasCalendarCompleto(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    Widget legend = Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Wrap(
        spacing: 12,
        runSpacing: 6,
        alignment: WrapAlignment.center,
        children: [
          _legendDot(isDark ? Colors.grey[800] : Colors.grey[200], 'Sin meta', dark: isDark),
          _legendDot(isDark ? Colors.blue[900] : Colors.blue[100], 'Meta futura', dark: isDark),
          _legendDot(isDark ? Colors.green[700] : Colors.green[200], 'Completada', dark: isDark),
          _legendDot(isDark ? Colors.red[700] : Colors.red[200], 'No completada', dark: isDark),
        ],
      ),
    );
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Calendario de metas diarias', style: theme.textTheme.titleMedium),
        const SizedBox(height: 8),
        legend,
        if (_isLoadingMetas)
          const Center(child: CircularProgressIndicator())
        else
          TableCalendar(
            locale: 'es_ES',
            firstDay: DateTime.utc(2025, 1, 1),
            lastDay: DateTime.utc(2026, 12, 31),
            focusedDay: _focusedDay,
            selectedDayPredicate: (day) => isSameDay(_selectedDay, day),
            calendarFormat: CalendarFormat.month,
            availableGestures: AvailableGestures.horizontalSwipe,
            onDaySelected: (selectedDay, focusedDay) {
              setState(() {
                _selectedDay = selectedDay;
                _focusedDay = focusedDay;
              });
              final meta = _todasLasMetas.firstWhere(
                (m) => m['fecha'] == selectedDay.toIso8601String().substring(0, 10),
                orElse: () => <String, dynamic>{},
              );
              if (meta.isNotEmpty) {
                _showMetaDialog(meta, isDark);
              }
            },
            calendarBuilders: CalendarBuilders(
              defaultBuilder: (context, day, focusedDay) {
                final meta = _todasLasMetas.firstWhere(
                  (m) => m['fecha'] == day.toIso8601String().substring(0, 10),
                  orElse: () => <String, dynamic>{},
                );
                Color? bgColor;
                if (meta.isEmpty) {
                  bgColor = isDark ? Colors.grey[800] : Colors.grey[200];
                } else {
                  final completada = meta['completada'] == true;
                  final metaDate = DateTime.tryParse(meta['fecha'] ?? '') ?? DateTime.now();
                  if (metaDate.isAfter(DateTime.now())) {
                    bgColor = isDark ? Colors.blue[900] : Colors.blue[100];
                  } else if (completada) {
                    bgColor = isDark ? Colors.green[700] : Colors.green[200];
                  } else {
                    bgColor = isDark ? Colors.red[700] : Colors.red[200];
                  }
                }
                return Container(
                  margin: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: bgColor,
                    shape: BoxShape.circle,
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    '${day.day}',
                    style: TextStyle(
                      color: isDark ? Colors.white : Colors.black,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                );
              },
            ),
          ),
      ],
    );
  }

  void _showMetaDialog(Map<String, dynamic> meta, bool isDark) {
    final fecha = meta['fecha'] ?? '-';
    final hierroObjetivo = meta['hierroObjetivo']?.toString() ?? '-';
    final hierroConsumido = meta['hierroConsumido']?.toString() ?? '-';
    final completada = meta['completada'] == true;
    final metaDate = DateTime.tryParse(meta['fecha'] ?? '') ?? DateTime.now();
    Color? bgColor;
    Color? textColor;
    IconData icon;
    String estado;
    if (isDark) {
      if (metaDate.isAfter(DateTime.now())) {
        bgColor = Colors.blue[900];
        textColor = Colors.white;
      } else if (completada) {
        bgColor = Colors.green[700];
        textColor = Colors.white;
      } else {
        bgColor = Colors.red[700];
        textColor = Colors.white;
      }
    } else {
      if (metaDate.isAfter(DateTime.now())) {
        bgColor = Colors.blue[100];
        textColor = Colors.black;
      } else if (completada) {
        bgColor = Colors.green[200];
        textColor = Colors.black;
      } else {
        bgColor = Colors.red[200];
        textColor = Colors.black;
      }
    }
    if (metaDate.isAfter(DateTime.now())) {
      icon = Icons.schedule;
      estado = 'Meta futura';
    } else if (completada) {
      icon = Icons.check_circle;
      estado = 'Completada';
    } else {
      icon = Icons.cancel;
      estado = 'No completada';
    }
    showDialog(
      context: context,
      builder: (ctx) => Dialog(
        backgroundColor: bgColor,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(icon, color: textColor, size: 32),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Meta del $fecha',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: textColor),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Icon(Icons.bolt, color: Colors.orange, size: 20),
                  const SizedBox(width: 6),
                  Text('Objetivo: $hierroObjetivo mg', style: TextStyle(fontSize: 15, color: textColor)),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Icon(Icons.restaurant, color: Colors.blue, size: 20),
                  const SizedBox(width: 6),
                  Text('Consumido: $hierroConsumido mg', style: TextStyle(fontSize: 15, color: textColor)),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Icon(
                    completada ? Icons.check_circle : (metaDate.isAfter(DateTime.now()) ? Icons.schedule : Icons.cancel),
                    color: completada ? Colors.green : (metaDate.isAfter(DateTime.now()) ? Colors.blue : Colors.red),
                    size: 20,
                  ),
                  const SizedBox(width: 6),
                  Text(estado, style: TextStyle(fontWeight: FontWeight.w600, color: textColor)),
                ],
              ),
              const SizedBox(height: 18),
              Align(
                alignment: Alignment.centerRight,
                child: TextButton(
                  onPressed: () => Navigator.of(ctx).pop(),
                  child: Text('Cerrar', style: TextStyle(color: textColor)),
                ),
              ),
            ],
          ),
        ),
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