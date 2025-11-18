// lib/features/profile/profile_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fe_nutriapp/core/services/api_service.dart';
import 'package:fe_nutriapp/core/services/auth_service.dart';
import 'package:fe_nutriapp/core/services/nutriapp_api.dart'; // <-- CAMBIO
import 'package:fe_nutriapp/core/theme/app_colors.dart';

// Importa las nuevas pantallas
import 'package:fe_nutriapp/features/profile/screens/profile_detail_screen.dart';
import 'package:fe_nutriapp/features/profile/screens/settings_screen.dart';
import 'package:fe_nutriapp/features/profile/screens/iron_tracker_screen.dart';
import 'package:fe_nutriapp/features/profile/screens/goals_screen.dart';
import 'package:fe_nutriapp/features/profile/screens/help_screen.dart';


class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _isLoading = true;
  String? _errorMessage;
  Map<String, dynamic>? _profileData;

  @override
  void initState() {
    super.initState();
    _fetchProfile();
  }

  Future<void> _fetchProfile() async {
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
    return Scaffold(
      appBar: AppBar(
        title: Text('NutriApp', style: theme.appBarTheme.titleTextStyle),
        elevation: 0,
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
            'Error: $_errorMessage',
            textAlign: TextAlign.center,
            style: const TextStyle(color: Colors.red),
          ),
        ),
      );
    }

    if (_profileData == null) {
      return const Center(child: Text('No se encontraron datos del perfil.'));
    }

    return _buildProfileList(context, _profileData!);
  }
  
  Widget _buildProfileList(BuildContext context, Map<String, dynamic> data) {
    final theme = Theme.of(context);
    final String name = data['name'] ?? 'Usuario';

    return ListView(
      children: [
        // --- Cabecera del Perfil ---
        Container(
          padding: const EdgeInsets.symmetric(vertical: 24.0),
          alignment: Alignment.center,
          child: Column(
            children: [
              CircleAvatar(
                radius: 40,
                backgroundColor: Colors.blue.shade100, 
                child: Icon(
                  Icons.person,
                  size: 40,
                  color: Colors.blue.shade800, 
                ),
              ),
              const SizedBox(height: 12),
              Text(
                name,
                style: theme.textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                  // color: theme.textTheme.headlineLarge?.color, // <-- Dejamos que el tema decida
                ),
              ),
            ],
          ),
        ),

        // --- Lista de Opciones (Modificada) ---
        
        _buildNavigationTile(
          context,
          icon: Icons.settings,
          title: 'Ajustes',
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => const SettingsScreen()),
            );
          },
        ),
        
        _buildNavigationTile(
          context,
          icon: Icons.account_circle,
          title: 'Perfil',
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => ProfileDetailScreen(profileData: data),
              ),
            );
          },
        ),
        
        _buildNavigationTile(
          context,
          icon: Icons.monitor_weight,
          title: 'Seguimiento de Hierro',
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => const IronTrackerScreen()),
            );
          },
        ),
        
        _buildNavigationTile(
          context,
          icon: Icons.track_changes,
          title: 'Metas de Hierro y Macros',
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => const GoalsScreen()),
            );
          },
        ),
        
        _buildNavigationTile(
          context,
          icon: Icons.help_outline,
          title: 'Ayuda',
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => const HelpScreen()),
            );
          },
        ),

        // --- Botón de Cerrar Sesión ---
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 40.0),
          child: ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red[400],
              foregroundColor: Colors.white,
              minimumSize: const Size(double.infinity, 50),
            ),
            onPressed: () {
              context.read<AuthService>().logout();
            },
            child: const Text('Cerrar Sesión'),
          ),
        ),
      ],
    );
  }

  // --- WIDGET CORREGIDO ---
  Widget _buildNavigationTile(
    BuildContext context, {
    required IconData icon, 
    required String title, 
    required VoidCallback onTap,
  }) {
    final theme = Theme.of(context);
    return ListTile(
      leading: Icon(
        icon, 
        // ¡CAMBIO! Al ser nulo, el 'ListTile' usará el color
        // correcto del IconTheme del tema (claro u oscuro).
        color: null, 
      ),
      title: Text(
        title, 
        style: theme.textTheme.titleMedium?.copyWith(
          fontSize: 17, 
          fontWeight: FontWeight.w500,
        ),
      ),
      trailing: const Icon(
        Icons.chevron_right,
        color: AppColors.textSecondary,
      ),
      onTap: onTap,
    );
  }
}