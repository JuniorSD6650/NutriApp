// lib/features/profile/screens/profile_detail_screen.dart
import 'package:flutter/material.dart';

class ProfileDetailScreen extends StatelessWidget {
  // Recibimos los datos de la pantalla anterior
  final Map<String, dynamic> profileData;
  
  const ProfileDetailScreen({
    super.key,
    required this.profileData,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final String name = profileData['name'] ?? 'Usuario';
    final String email = profileData['email'] ?? 'Sin email';
    final String role = profileData['role'] ?? '';

    // Detectar tipo de perfil
    final pacienteProfile = profileData['pacienteProfile'];
    final medicoProfile = profileData['medicoProfile'];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Detalle del Perfil'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Center(
          child: Column(
            children: [
              CircleAvatar(
                radius: 50,
                backgroundColor: Colors.blue.shade100,
                child: Icon(Icons.person, size: 50, color: Colors.blue.shade800),
              ),
              const SizedBox(height: 16),
              Text(name, style: theme.textTheme.headlineLarge),
              Text(email, style: theme.textTheme.titleMedium),
              const SizedBox(height: 24),
              const Divider(),
              if (role == 'paciente') ...[
                _buildInfoTile(
                  context,
                  icon: Icons.cake,
                  title: 'Fecha de Nacimiento',
                  value: pacienteProfile?['fecha_nacimiento']?.toString() ?? 'No registrado',
                ),
                _buildInfoTile(
                  context,
                  icon: Icons.monitor_weight,
                  title: 'Peso Inicial',
                  value: pacienteProfile?['peso_inicial_kg'] != null ? "${pacienteProfile?['peso_inicial_kg']} kg" : 'No registrado',
                ),
                _buildInfoTile(
                  context,
                  icon: Icons.height,
                  title: 'Altura',
                  value: pacienteProfile?['altura_cm'] != null ? "${pacienteProfile?['altura_cm']} cm" : 'No registrado',
                ),
                _buildInfoTile(
                  context,
                  icon: Icons.calendar_today,
                  title: 'Fecha probable de parto',
                  value: pacienteProfile?['fecha_probable_parto']?.toString() ?? 'No registrado',
                ),
                _buildInfoTile(
                  context,
                  icon: Icons.pregnant_woman,
                  title: 'Semanas de gestación',
                  value: pacienteProfile?['semanas_gestacion']?.toString() ?? 'No registrado',
                ),
                _buildInfoTile(
                  context,
                  icon: Icons.restaurant_menu,
                  title: 'Tipo de dieta',
                  value: pacienteProfile?['tipo_dieta']?.toString() ?? 'No registrado',
                ),
                _buildInfoTile(
                  context,
                  icon: Icons.warning_amber,
                  title: 'Alergias alimentarias',
                  value: pacienteProfile?['alergias_alimentarias'] ?? 'No registrado',
                ),
                _buildInfoTile(
                  context,
                  icon: Icons.check_circle_outline,
                  title: 'Toma suplementos de hierro',
                  value: (pacienteProfile?['toma_suplementos_hierro'] ?? false) ? 'Sí' : 'No',
                ),
              ] else if (role == 'medico') ...[
                _buildInfoTile(
                  context,
                  icon: Icons.medical_services,
                  title: 'Especialidad',
                  value: medicoProfile?['especialidad'] ?? 'No registrado',
                ),
                _buildInfoTile(
                  context,
                  icon: Icons.badge,
                  title: 'Número colegiado',
                  value: medicoProfile?['numero_colegiado'] ?? 'No registrado',
                ),
                _buildInfoTile(
                  context,
                  icon: Icons.info_outline,
                  title: 'Biografía',
                  value: medicoProfile?['biografia'] ?? 'No registrado',
                ),
              ] else ...[
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Text('No hay perfil disponible para este usuario.', style: theme.textTheme.bodyMedium),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  // Widget reutilizable
  Widget _buildInfoTile(BuildContext context, {required IconData icon, required String title, required String value}) {
    final theme = Theme.of(context);
    return ListTile(
      leading: Icon(icon, color: theme.colorScheme.primary),
      title: Text(title, style: theme.textTheme.titleMedium?.copyWith(fontSize: 16)),
      subtitle: Text(value, style: theme.textTheme.bodyMedium?.copyWith(fontSize: 16)),
    );
  }
}