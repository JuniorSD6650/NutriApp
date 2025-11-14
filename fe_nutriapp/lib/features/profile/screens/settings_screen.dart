// lib/features/profile/screens/settings_screen.dart
import 'package:flutter/material.dart';
import 'package:fe_nutriapp/core/theme/app_colors.dart';
import 'package:fe_nutriapp/features/profile/screens/privacy_policy_screen.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:provider/provider.dart';
import 'package:fe_nutriapp/core/theme/theme_provider.dart'; // <-- ¡LA IMPORTACIÓN ESTÁ AQUÍ!

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _notificationsEnabled = true;

  @override
  void initState() {
    super.initState();
    _loadPreferences();
  }

  Future<void> _loadPreferences() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _notificationsEnabled = prefs.getBool('notifications') ?? true;
    });
  }

  Future<void> _saveNotificationPreference(bool value) async {
    final prefs = await SharedPreferences.getInstance();
    prefs.setBool('notifications', value);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final themeProvider = context.watch<ThemeProvider>(); // <-- Esta línea ahora es válida

    return Scaffold(
      appBar: AppBar(title: const Text('Ajustes')),
      body: ListView(
        children: [
          _buildSectionTitle(context, 'Notificaciones'),
          SwitchListTile(
            title: Text('Habilitar notificaciones', style: theme.textTheme.titleMedium),
            value: _notificationsEnabled,
            onChanged: (bool value) {
              setState(() { _notificationsEnabled = value; });
              _saveNotificationPreference(value);
            },
            secondary: Icon(Icons.notifications, color: theme.colorScheme.primary),
          ),
          
          _buildSectionTitle(context, 'Apariencia'),
          SwitchListTile(
            title: Text('Modo Oscuro', style: theme.textTheme.titleMedium),
            value: themeProvider.themeMode == ThemeMode.dark, 
            onChanged: (bool value) {
              context.read<ThemeProvider>().toggleTheme(value); // <-- Esta línea ahora es válida
            },
            secondary: Icon(Icons.dark_mode, color: theme.colorScheme.primary),
          ),
          
          _buildSectionTitle(context, 'Cuenta'),
          ListTile(
            leading: Icon(Icons.lock_outline, color: AppColors.textPrimary), // <-- AppColors está bien aquí
            title: Text('Cambiar contraseña', style: theme.textTheme.titleMedium),
            // --- CORRECCIÓN: Quitado el 'const' ---
            trailing: Icon(Icons.chevron_right, color: AppColors.textSecondary),
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('TODO: Pantalla de cambiar contraseña'))
              );
            },
          ),
          ListTile(
            leading: Icon(Icons.privacy_tip_outlined, color: AppColors.textPrimary),
            title: Text('Política de privacidad', style: theme.textTheme.titleMedium),
            // --- CORRECCIÓN: Quitado el 'const' ---
            trailing: Icon(Icons.chevron_right, color: AppColors.textSecondary),
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const PrivacyPolicyScreen()),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(BuildContext context, String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16.0, 24.0, 16.0, 8.0),
      child: Text(
        title.toUpperCase(),
        style: TextStyle(
          color: AppColors.textSecondary, // <-- AppColors está bien aquí
          fontWeight: FontWeight.bold,
          fontSize: 12,
        ),
      ),
    );
  }
}