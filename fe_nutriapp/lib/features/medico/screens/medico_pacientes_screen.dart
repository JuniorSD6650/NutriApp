// lib/features/medico/screens/medico_pacientes_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fe_nutriapp/core/services/nutriapp_api.dart';
import 'package:fe_nutriapp/core/services/auth_service.dart';
import 'package:fe_nutriapp/core/theme/app_colors.dart';
import 'package:jwt_decode/jwt_decode.dart';

class MedicoPacientesScreen extends StatefulWidget {
  const MedicoPacientesScreen({super.key});

  @override
  State<MedicoPacientesScreen> createState() => _MedicoPacientesScreenState();
}

class _MedicoPacientesScreenState extends State<MedicoPacientesScreen> {
  bool _isLoading = true;
  String? _errorMessage;
  List<dynamic> _pacientes = [];

  @override
  void initState() {
    super.initState();
    _fetchPacientes();
  }

  Future<void> _fetchPacientes() async {
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
      final data = await api.medico.getMisPacientes(medicoId);

      setState(() {
        _pacientes = data;
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
        title: Text('Mis Pacientes', style: theme.appBarTheme.titleTextStyle),
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
              : _pacientes.isEmpty
                  ? const Center(
                      child: Text('No tienes pacientes asignados.'),
                    )
                  : ListView.builder(
                      itemCount: _pacientes.length,
                      itemBuilder: (context, index) {
                        final paciente = _pacientes[index];
                        return _buildPacienteCard(context, paciente);
                      },
                    ),
    );
  }

  Widget _buildPacienteCard(BuildContext context, Map<String, dynamic> paciente) {
    final theme = Theme.of(context);
    
    // VALIDACIÓN: Asegurar que name no sea null o vacío
    final nombre = (paciente['name'] as String? ?? 'Sin nombre').trim();
    final inicial = nombre.isEmpty ? '?' : nombre[0].toUpperCase();
    
    return Card(
      color: theme.brightness == Brightness.dark 
          ? AppColors.surfaceDark 
          : Colors.white,
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: AppColors.primary,
          child: Text(
            inicial, // <-- USAR INICIAL VALIDADA
            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
          ),
        ),
        title: Text(
          nombre, // <-- USAR NOMBRE VALIDADO
          style: theme.textTheme.titleMedium,
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(paciente['email'] ?? 'Sin email'),
            const SizedBox(height: 4),
            if (paciente['pesoInicial'] != null)
              Text('Peso: ${paciente['pesoInicial']} kg'),
            if (paciente['alturaCm'] != null)
              Text('Altura: ${paciente['alturaCm']} cm'),
            if (paciente['tomaSuplementos'] == true)
              const Text(
                'Toma suplementos de hierro',
                style: TextStyle(color: Colors.green, fontSize: 12),
              ),
          ],
        ),
        trailing: Icon(
          Icons.chevron_right,
          color: AppColors.textSecondary,
        ),
        onTap: () {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Ver detalles de $nombre')),
          );
        },
      ),
    );
  }
}