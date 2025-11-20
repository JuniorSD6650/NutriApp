// lib/features/profile/profile_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fe_nutriapp/core/services/auth_service.dart';
import 'package:fe_nutriapp/core/services/nutriapp_api.dart';
import 'package:fe_nutriapp/core/theme/app_colors.dart';
import 'package:fe_nutriapp/features/profile/screens/settings_screen.dart';
import 'package:fe_nutriapp/features/profile/screens/profile_detail_screen.dart';
import 'package:fe_nutriapp/features/profile/screens/help_screen.dart';
import 'package:fe_nutriapp/features/profile/screens/goals_screen.dart';
import 'package:fe_nutriapp/features/profile/screens/iron_tracker_screen.dart';
import 'package:fe_nutriapp/features/paciente/screens/charts_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _isLoading = true;
  Map<String, dynamic>? _profileData;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final api = context.read<NutriAppApi>();
      final data = await api.auth.getProfile();
      
      setState(() {
        _profileData = data;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceFirst('Exception: ', '');
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final authService = context.watch<AuthService>();
    final userRole = authService.userRole?.toLowerCase();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Perfil'),
        actions: [
          // ✅ Botón de configuración
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const SettingsScreen()),
              );
            },
          ),
          // ✅ NUEVO: Botón de cerrar sesión (solo ícono)
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              // Mostrar diálogo de confirmación
              final shouldLogout = await showDialog<bool>(
                context: context,
                builder: (context) => AlertDialog(
                  title: const Text('Cerrar sesión'),
                  content: const Text('¿Estás seguro de que deseas cerrar sesión?'),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.of(context).pop(false),
                      child: const Text('Cancelar'),
                    ),
                    TextButton(
                      onPressed: () => Navigator.of(context).pop(true),
                      child: const Text('Cerrar sesión', style: TextStyle(color: Colors.red)),
                    ),
                  ],
                ),
              );

              if (shouldLogout == true && mounted) {
                await context.read<AuthService>().logout();
              }
            },
          ),
        ],
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
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    children: [
                      // Avatar y nombre
                      CircleAvatar(
                        radius: 50,
                        backgroundColor: AppColors.primary,
                        child: Text(
                          (_profileData?['name'] ?? '?')[0].toUpperCase(),
                          style: const TextStyle(
                            fontSize: 40,
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        _profileData?['name'] ?? 'Usuario',
                        style: theme.textTheme.headlineSmall?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        _profileData?['email'] ?? authService.userEmail ?? '',
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Chip(
                        label: Text(
                          _getRoleLabel(_profileData?['role'] ?? authService.userRole ?? ''),
                        ),
                        backgroundColor: AppColors.primary.withOpacity(0.2),
                      ),
                      const SizedBox(height: 24),

                      // Opciones de menú según rol
                      _buildMenuSection(context, theme, userRole ?? ''),

                      // ❌ ELIMINADO: Ya no mostramos el botón de cerrar sesión aquí
                    ],
                  ),
                ),
    );
  }

  Widget _buildMenuSection(BuildContext context, ThemeData theme, String userRole) {
    return Column(
      children: [
        // Detalles del perfil (SOLO para pacientes y médicos, NO para admin)
        if (userRole == 'paciente' || userRole == 'medico')
          _buildMenuItem(
            context: context,
            icon: Icons.person_outline,
            title: 'Detalles del perfil',
            subtitle: 'Ver información personal',
            onTap: () {
              if (_profileData != null) {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => ProfileDetailScreen(profileData: _profileData!),
                  ),
                );
              } else {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('No se pudo cargar la información del perfil'),
                    backgroundColor: Colors.red,
                  ),
                );
              }
            },
          ),

        // ✅ ADMIN: Solo muestra un bloque centrado y estilizado
        if (userRole == 'admin')
          Center(
            child: Container(
              margin: const EdgeInsets.symmetric(vertical: 32, horizontal: 16),
              padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 24),
              decoration: BoxDecoration(
                color: Theme.of(context).cardColor,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: Theme.of(context).dividerColor.withOpacity(0.2),
                  width: 1.5,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.03),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.admin_panel_settings,
                    size: 80,
                    color: AppColors.primary,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Cuenta de Administrador',
                    style: theme.textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Acceso completo al panel de administración',
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: AppColors.textSecondary,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
          ),

        // Opciones SOLO para pacientes
        if (userRole == 'paciente') ...[
          _buildMenuItem(
            context: context,
            icon: Icons.show_chart,
            title: 'Estadísticas',
            subtitle: 'Ver gráficos y progreso',
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const ChartsScreen()),
              );
            },
          ),
          _buildMenuItem(
            context: context,
            icon: Icons.track_changes,
            title: 'Seguimiento de hierro',
            subtitle: 'Monitorear niveles de hierro',
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const IronTrackerScreen()),
              );
            },
          ),
          _buildMenuItem(
            context: context,
            icon: Icons.flag,
            title: 'Metas',
            subtitle: 'Configurar objetivos',
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const GoalsScreen()),
              );
            },
          ),
        ],

        // Ayuda (SOLO para pacientes y médicos, NO para admin)
        if (userRole == 'paciente' || userRole == 'medico')
          _buildMenuItem(
            context: context,
            icon: Icons.help_outline,
            title: 'Ayuda',
            subtitle: 'Preguntas frecuentes',
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const HelpScreen()),
              );
            },
          ),
      ],
    );
  }

  Widget _buildMenuItem({
    required BuildContext context,
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Icon(icon, color: AppColors.primary),
        title: Text(title),
        subtitle: Text(subtitle),
        trailing: const Icon(Icons.chevron_right, color: AppColors.textSecondary),
        onTap: onTap,
      ),
    );
  }

  String _getRoleLabel(String role) {
    switch (role.toLowerCase()) {
      case 'paciente':
        return 'Paciente';
      case 'medico':
        return 'Médico';
      case 'admin':
        return 'Administrador';
      default:
        return role;
    }
  }
}