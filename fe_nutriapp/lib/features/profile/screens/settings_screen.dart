// lib/features/profile/screens/settings_screen.dart
import 'package:flutter/material.dart';
import 'package:fe_nutriapp/core/theme/app_colors.dart';
import 'package:fe_nutriapp/features/profile/screens/privacy_policy_screen.dart';
import 'package:fe_nutriapp/features/profile/screens/change_password_screen.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:provider/provider.dart';
import 'package:fe_nutriapp/core/theme/theme_provider.dart';
// 1. IMPORTAR EL SERVICIO DE NOTIFICACIONES
import 'package:fe_nutriapp/core/services/notification_service.dart';
import 'package:permission_handler/permission_handler.dart'; // <-- AÑADIR IMPORT

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

  // --- 2. LÓGICA REAL DE NOTIFICACIONES (MODIFICADO) ---
  Future<void> _saveNotificationPreference(bool value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('notifications', value);

    if (!mounted) return;
    final notificationService = context.read<NotificationService>();

    if (value) {
      // Solo pedir permisos y activar la notificación diaria
      print("Solicitando permisos y activando recordatorios diarios...");
      await notificationService.requestPermissions();
      await notificationService.scheduleDailyReminder();
    } else {
      print("Desactivando recordatorios...");
      await notificationService.cancelAllReminders();
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final themeProvider = context.watch<ThemeProvider>();

    return Scaffold(
      appBar: AppBar(title: const Text('Ajustes')),
      body: ListView(
        children: [
          _buildSectionTitle(context, 'Notificaciones'),
          SwitchListTile(
            title: Text('Habilitar notificaciones', style: theme.textTheme.titleMedium),
            subtitle: Text(
              'Recordatorio diario a las 3:49 PM', 
              style: theme.textTheme.bodyMedium
            ),
            value: _notificationsEnabled,
            onChanged: (bool value) {
              setState(() { _notificationsEnabled = value; });
              _saveNotificationPreference(value);
            },
            secondary: Icon(Icons.notifications, color: theme.colorScheme.primary),
          ),
          
          // BOTÓN DE DEBUG: Notificación instantánea
          ListTile(
            leading: Icon(Icons.notifications_active, color: theme.colorScheme.primary),
            title: Text('Enviar notificación de prueba', style: theme.textTheme.titleMedium),
            subtitle: Text('Aparecerá al instante', style: theme.textTheme.bodySmall),
            trailing: Icon(Icons.send, color: theme.colorScheme.primary),
            onTap: () async {
              await context.read<NotificationService>().showInstantNotification();
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Notificación enviada. Revisa la bandeja.')),
                );
              }
            },
          ),
          
          _buildSectionTitle(context, 'Apariencia'),
          SwitchListTile(
            title: Text('Modo Oscuro', style: theme.textTheme.titleMedium),
            value: themeProvider.themeMode == ThemeMode.dark, 
            onChanged: (bool value) {
              context.read<ThemeProvider>().toggleTheme(value);
            },
            secondary: Icon(Icons.dark_mode, color: theme.colorScheme.primary),
          ),
          
          _buildSectionTitle(context, 'Cuenta'),
          ListTile(
            leading: Icon(Icons.lock_outline, color: AppColors.textPrimary),
            title: Text('Cambiar contraseña', style: theme.textTheme.titleMedium),
            trailing: Icon(Icons.chevron_right, color: AppColors.textSecondary),
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const ChangePasswordScreen()),
              );
            },
          ),
          ListTile(
            leading: Icon(Icons.privacy_tip_outlined, color: AppColors.textPrimary),
            title: Text('Política de privacidad', style: theme.textTheme.titleMedium),
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
          color: AppColors.textSecondary,
          fontWeight: FontWeight.bold,
          fontSize: 12,
        ),
      ),
    );
  }
}