// lib/features/medico/screens/medico_dashboard_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fe_nutriapp/core/services/nutriapp_api.dart';
import 'package:fe_nutriapp/core/services/auth_service.dart';
import 'package:fe_nutriapp/core/theme/app_colors.dart';
import 'package:jwt_decode/jwt_decode.dart';
import 'package:fe_nutriapp/core/services/widget_service.dart';

class MedicoDashboardScreen extends StatefulWidget {
  const MedicoDashboardScreen({super.key});

  @override
  State<MedicoDashboardScreen> createState() => _MedicoDashboardScreenState();
}

class _MedicoDashboardScreenState extends State<MedicoDashboardScreen> {
  bool _isLoading = true;
  String? _errorMessage;
  Map<String, dynamic>? _estadisticas;

  @override
  void initState() {
    super.initState();
    _fetchEstadisticas();
    _updateWidget();
  }

  Future<void> _updateWidget() async {
    try {
      final api = context.read<NutriAppApi>();
      final userData = await api.auth.getProfile();
      final nombre = userData['name'] ?? 'Médico';
      final rol = userData['role'] ?? 'medico';

      await WidgetService.updateWidget(
        rachaActual: 0,
        nombrePaciente: nombre,
        rol: rol,
      );
    } catch (e) {
      // Silenciar error del widget
    }
  }

  Future<void> _fetchEstadisticas() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final authService = context.read<AuthService>();
      final token = authService.token;
      
      if (token == null) throw Exception('No hay token');
      
      final payload = Jwt.parseJwt(token);
      final medicoId = payload['sub'] as String;

      final api = context.read<NutriAppApi>();
      final data = await api.medico.getEstadisticas(medicoId);

      setState(() {
        _estadisticas = data;
        _isLoading = false;
      });
    } catch (e) {
      final errorMsg = e.toString().replaceFirst('Exception: ', '');
      
      // ✅ AÑADIR: Si es error de médico no encontrado, forzar logout
      if (errorMsg.contains('Médico no encontrado') || 
          errorMsg.contains('no encontrado') ||
          errorMsg.contains('not found')) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Tu cuenta ya no existe. Por favor, contacta al administrador.'),
              backgroundColor: Colors.red,
            ),
          );
          // Esperar 2 segundos y hacer logout
          await Future.delayed(const Duration(seconds: 2));
          if (mounted) {
            context.read<AuthService>().logout();
          }
        }
        return;
      }
      
      setState(() {
        _errorMessage = errorMsg;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Scaffold(
      appBar: AppBar(
        title: Text('Dashboard Médico', style: theme.appBarTheme.titleTextStyle),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _errorMessage != null
              ? Center(
                  child: Text(
                    'Error: $_errorMessage',
                    style: const TextStyle(color: Colors.red),
                  ),
                )
              : _buildDashboard(context),
    );
  }

  Widget _buildDashboard(BuildContext context) {
    final theme = Theme.of(context);
    final stats = _estadisticas!;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Resumen de Hoy',
            style: theme.textTheme.headlineLarge,
          ),
          const SizedBox(height: 24),
          
          // Tarjetas de estadísticas
          Row(
            children: [
              Expanded(
                child: _buildStatCard(
                  context,
                  title: 'Total Pacientes',
                  value: stats['totalPacientes'].toString(),
                  icon: Icons.people,
                  color: Colors.blue,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: _buildStatCard(
                  context,
                  title: 'Meta Cumplida',
                  value: stats['pacientesConMetaCumplida'].toString(),
                  icon: Icons.check_circle,
                  color: Colors.green,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: _buildStatCard(
                  context,
                  title: 'Meta Pendiente',
                  value: stats['pacientesConMetaPendiente'].toString(),
                  icon: Icons.pending,
                  color: Colors.orange,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: _buildStatCard(
                  context,
                  title: 'Promedio Hierro',
                  value: '${stats['promedioHierroConsumido']} mg',
                  icon: Icons.science,
                  color: AppColors.primary,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(
    BuildContext context, {
    required String title,
    required String value,
    required IconData icon,
    required Color color,
  }) {
    final theme = Theme.of(context);
    
    return Card(
      color: theme.brightness == Brightness.dark 
          ? AppColors.surfaceDark 
          : Colors.white,
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: color, size: 32),
            const SizedBox(height: 12),
            Text(
              value,
              style: theme.textTheme.headlineMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              title,
              style: theme.textTheme.bodyMedium,
            ),
          ],
        ),
      ),
    );
  }
}