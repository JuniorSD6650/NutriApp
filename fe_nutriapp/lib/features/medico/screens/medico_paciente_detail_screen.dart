// lib/features/medico/screens/medico_paciente_detail_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fe_nutriapp/core/theme/app_colors.dart';
import 'package:fe_nutriapp/core/services/nutriapp_api.dart';
import 'package:table_calendar/table_calendar.dart';

class MedicoPacienteDetailScreen extends StatefulWidget {
  final Map<String, dynamic> paciente;
  const MedicoPacienteDetailScreen({super.key, required this.paciente});

  @override
  State<MedicoPacienteDetailScreen> createState() => _MedicoPacienteDetailScreenState();
}

class _MedicoPacienteDetailScreenState extends State<MedicoPacienteDetailScreen> {
        List<dynamic> comidasRecientes = [];
        bool isLoadingComidas = true;
        String? comidasError;
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
    DateTime _focusedDay = DateTime.now();
    DateTime? _selectedDay;
  List<dynamic> metas = [];
  // Mostrar todas las metas, pero con scroll
  bool isLoadingMetas = true;
  String? metasError;

  @override
  void initState() {
    super.initState();
    _fetchMetas();
    _fetchComidasRecientes();
  }

  Future<void> _fetchComidasRecientes() async {
    setState(() {
      isLoadingComidas = true;
      comidasError = null;
    });
    try {
      final nutriApi = context.read<NutriAppApi>();
      final pacienteId = widget.paciente['id'].toString();
      final comidas = await nutriApi.registros.getRegistrosConsumoPaciente(pacienteId, limit: 5);
      setState(() {
        comidasRecientes = comidas;
        isLoadingComidas = false;
      });
    } catch (e) {
      setState(() {
        comidasError = e.toString().replaceFirst('Exception: ', '');
        isLoadingComidas = false;
      });
    }
  }

  Future<void> _fetchMetas() async {
    setState(() {
      isLoadingMetas = true;
      metasError = null;
    });
    try {
      final nutriApi = context.read<NutriAppApi>();
      final pacienteId = widget.paciente['id'].toString();
      final metasData = await nutriApi.medico.getMetasPaciente(pacienteId);
      setState(() {
        metas = metasData;
        isLoadingMetas = false;
      });
    } catch (e) {
      setState(() {
        metasError = e.toString().replaceFirst('Exception: ', '');
        isLoadingMetas = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    // Leyenda de colores
    final isDark = Theme.of(context).brightness == Brightness.dark;
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
    // ...existing code...
    final theme = Theme.of(context);
    final nombre = (widget.paciente['name'] as String? ?? 'Sin nombre').trim();
    final email = widget.paciente['email'] ?? 'Sin email';
    final peso = widget.paciente['pesoInicial']?.toString() ?? '-';
    final altura = widget.paciente['alturaCm']?.toString() ?? '-';
    final tomaSuplementos = widget.paciente['tomaSuplementos'] == true;
    final fechaNacimiento = widget.paciente['fechaNacimiento'] ?? '-';

    return Scaffold(
      appBar: AppBar(
        title: Text('Detalle de Paciente', style: theme.appBarTheme.titleTextStyle),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 32,
                  backgroundColor: AppColors.primary,
                  child: Text(
                    nombre.isNotEmpty ? nombre[0].toUpperCase() : '?',
                    style: const TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold),
                  ),
                ),
                const SizedBox(width: 18),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(nombre, style: theme.textTheme.headlineSmall),
                    Text(email, style: theme.textTheme.bodyMedium),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 24),
            Divider(),
            const SizedBox(height: 12),
            Text('Datos generales', style: theme.textTheme.titleMedium),
            const SizedBox(height: 8),
            _buildInfoRow('Fecha de nacimiento', fechaNacimiento),
            _buildInfoRow('Peso inicial (kg)', peso),
            _buildInfoRow('Altura (cm)', altura),
            if (tomaSuplementos)
              _buildInfoRow('Toma suplementos de hierro', 'Sí', color: Colors.green),
            const SizedBox(height: 24),
            Divider(),
            const SizedBox(height: 12),
            Text('Comidas recientes', style: theme.textTheme.titleMedium),
            const SizedBox(height: 8),
            if (isLoadingComidas)
              const Center(child: CircularProgressIndicator())
            else if (comidasError != null)
              _buildPlaceholder('Error: $comidasError')
            else if (comidasRecientes.isEmpty)
              _buildPlaceholder('No hay registros de comidas recientes.')
            else
              Column(
                children: comidasRecientes.map((comida) {
                  final nombre = comida['platillo']?['nombre'] ?? comida['descripcion'] ?? 'Sin nombre';
                  final tipo = comida['tipo_comida'] ?? '-';
                  final fecha = comida['fecha'] ?? '';
                  final porciones = comida['porciones']?.toString() ?? '1';
                  final foto = comida['foto'];
                  return Card(
                    margin: const EdgeInsets.symmetric(vertical: 6),
                    child: ListTile(
                      leading: foto != null
                          ? ClipRRect(
                              borderRadius: BorderRadius.circular(8),
                              child: Image.network(
                                foto.startsWith('http') ? foto : 'https://23288268fa31.ngrok-free.app$foto',
                                width: 48,
                                height: 48,
                                fit: BoxFit.cover,
                                errorBuilder: (ctx, err, stack) => const Icon(Icons.fastfood),
                              ),
                            )
                          : const Icon(Icons.fastfood, size: 32),
                      title: Text(nombre, style: theme.textTheme.titleMedium),
                      subtitle: Text('Tipo: $tipo | Porciones: $porciones'),
                      trailing: Text(fecha.toString().substring(0, 10)),
                    ),
                  );
                }).toList(),
              ),
            const SizedBox(height: 24),
            Divider(),
            const SizedBox(height: 12),
            Text('Calendario de metas diarias', style: theme.textTheme.titleMedium),
            const SizedBox(height: 8),
            legend,
            if (isLoadingMetas)
              const Center(child: CircularProgressIndicator())
            else if (metasError != null)
              _buildPlaceholder('Error: $metasError')
            else
              TableCalendar(
                locale: 'es_ES',
                firstDay: DateTime.utc(2025, 1, 1),
                lastDay: DateTime.utc(2026, 12, 31),
                focusedDay: _focusedDay,
                selectedDayPredicate: (day) => isSameDay(_selectedDay, day),
                calendarFormat: CalendarFormat.month,
                onDaySelected: (selectedDay, focusedDay) {
                  setState(() {
                    _selectedDay = selectedDay;
                    _focusedDay = focusedDay;
                  });
                  final meta = metas.firstWhere(
                    (m) => m['fecha'] == selectedDay.toIso8601String().substring(0, 10),
                    orElse: () => null,
                  );
                  if (meta != null) {
                    final fecha = meta['fecha'] ?? '-';
                    final hierroObjetivo = meta['hierroObjetivo']?.toString() ?? '-';
                    final hierroConsumido = meta['hierroConsumido']?.toString() ?? '-';
                    final completada = meta['completada'] == true;
                    final metaDate = DateTime.parse(meta['fecha']);
                    Color? bgColor;
                    Color? textColor;
                    IconData icon;
                    String estado;
                    if (isDark) {
                      if (meta == null) {
                        bgColor = Colors.grey[800];
                        textColor = Colors.white;
                      } else if (metaDate.isAfter(DateTime.now())) {
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
                      if (meta == null) {
                        bgColor = Colors.grey[200];
                        textColor = Colors.black;
                      } else if (metaDate.isAfter(DateTime.now())) {
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
                },
                calendarBuilders: CalendarBuilders(
                  defaultBuilder: (context, day, focusedDay) {
                    final meta = metas.firstWhere(
                      (m) => m['fecha'] == day.toIso8601String().substring(0, 10),
                      orElse: () => null,
                    );
                    Color? bgColor;
                    if (meta == null) {
                      bgColor = Colors.grey[200]; // Sin meta
                    } else {
                      final completada = meta['completada'] == true;
                      final metaDate = DateTime.parse(meta['fecha']);
                      if (metaDate.isAfter(DateTime.now())) {
                        bgColor = Colors.blue[100]; // Meta futura
                      } else if (completada) {
                        bgColor = Colors.green[200]; // Meta completada
                      } else {
                        bgColor = Colors.red[200]; // Meta no completada y ya pasó
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
                          color: Colors.black,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    );
                  },
                ),
              ),
            const SizedBox(height: 24),
            Divider(),
            const SizedBox(height: 12),
            Text('Consumo de hierro', style: theme.textTheme.titleMedium),
            const SizedBox(height: 8),
            _buildPlaceholder('Aquí se mostrarán estadísticas de hierro.'),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, {Color? color}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Expanded(child: Text(label)),
          Text(value, style: TextStyle(color: color)),
        ],
      ),
    );
  }

  Widget _buildPlaceholder(String text) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(text, style: const TextStyle(color: Colors.grey)),
    );
  }
}
