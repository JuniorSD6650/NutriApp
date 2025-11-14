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
    
    // Extraemos los datos del JSON
    final String name = profileData['name'] ?? 'Usuario';
    final String email = profileData['email'] ?? 'Sin email';
    
    // Usamos el objeto "profile" anidado
    final profile = profileData['profile'];

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
              
              // Mostramos los datos que pediste
              _buildInfoTile(
                context,
                icon: Icons.cake,
                title: 'Fecha de Nacimiento',
                value: profile?['fecha_nacimiento']?.toString() ?? 'No especificado',
              ),
              _buildInfoTile(
                context,
                icon: Icons.monitor_weight,
                title: 'Peso Inicial',
                value: "${profile?['peso_inicial_kg']?.toString() ?? 'N/A'} kg",
              ),
              _buildInfoTile(
                context,
                icon: Icons.height,
                title: 'Altura',
                value: "${profile?['altura_cm']?.toString() ?? 'N/A'} cm",
              ),
              _buildInfoTile(
                context,
                icon: Icons.warning_amber,
                title: 'Alergias',
                value: profile?['alergias_alimentarias'] ?? 'Ninguna',
              ),
              _buildInfoTile(
                context,
                icon: Icons.check_circle_outline,
                title: 'Toma Suplementos de Hierro',
                value: (profile?['toma_suplementos_hierro'] ?? false) ? 'Sí' : 'No',
              ),
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