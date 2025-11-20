// lib/features/profile/screens/settings_screen.dart
import 'package:flutter/material.dart';
import 'package:fe_nutriapp/core/theme/app_colors.dart';
import 'package:fe_nutriapp/features/profile/screens/privacy_policy_screen.dart';
import 'package:fe_nutriapp/features/profile/screens/change_password_screen.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:provider/provider.dart';
import 'package:fe_nutriapp/core/theme/theme_provider.dart';
import 'package:fe_nutriapp/core/services/notification_service.dart';
import 'package:fe_nutriapp/core/models/meal_time.dart';
import 'package:fe_nutriapp/features/profile/screens/meal_times_screen.dart';
import 'package:fe_nutriapp/core/services/auth_service.dart';
import 'dart:convert';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _notificationsEnabled = true;
  List<MealTime> _mealTimes = [];

  @override
  void initState() {
    super.initState();
    _loadPreferences();
  }

  Future<void> _loadPreferences() async {
    final prefs = await SharedPreferences.getInstance();
    final jsonString = prefs.getString('meal_times');
    
    setState(() {
      _notificationsEnabled = prefs.getBool('notifications') ?? true;
      
      if (jsonString != null) {
        final List<dynamic> jsonList = jsonDecode(jsonString);
        _mealTimes = jsonList.map((json) => MealTime.fromJson(json)).toList();
      } else {
        _mealTimes = [
          MealTime(id: '1', hour: 7, minute: 0, label: 'Desayuno'),
          MealTime(id: '2', hour: 13, minute: 0, label: 'Almuerzo'),
          MealTime(id: '3', hour: 19, minute: 0, label: 'Cena'),
        ];
        prefs.setString('meal_times', jsonEncode(_mealTimes.map((m) => m.toJson()).toList()));
      }
    });
  }

  Future<void> _saveNotificationPreference(bool value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('notifications', value);

    if (!mounted) return;
    final notificationService = context.read<NotificationService>();

    if (value) {
      print("Activando recordatorios de comidas...");
      await notificationService.requestPermissions();
      await notificationService.scheduleMultipleMealReminders(_mealTimes);
    } else {
      print("Desactivando recordatorios...");
      await notificationService.cancelAllReminders();
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final themeProvider = context.watch<ThemeProvider>();
    
    // ✅ Obtener el rol del usuario
    final authService = context.watch<AuthService>();
    final userRole = authService.userRole?.toLowerCase();
    final isPaciente = userRole == 'paciente';

    return Scaffold(
      appBar: AppBar(title: const Text('Ajustes')),
      body: ListView(
        children: [
          _buildSectionTitle(context, 'Notificaciones'),
          
          // ✅ Switch general de notificaciones (para todos los roles)
          SwitchListTile(
            title: Text('Habilitar notificaciones', style: theme.textTheme.titleMedium),
            subtitle: Text(
              _notificationsEnabled 
                ? isPaciente 
                  ? '${_mealTimes.length} recordatorios activos' 
                  : 'Notificaciones activadas'
                : 'Sin notificaciones',
              style: theme.textTheme.bodyMedium
            ),
            value: _notificationsEnabled,
            onChanged: (bool value) {
              setState(() { _notificationsEnabled = value; });
              _saveNotificationPreference(value);
            },
            secondary: Icon(Icons.notifications, color: theme.colorScheme.primary),
          ),
          
          // ✅ CAMBIO: Configuración de horarios de comida (SOLO para pacientes)
          if (isPaciente && _notificationsEnabled)
            ListTile(
              leading: Icon(Icons.schedule, color: theme.colorScheme.primary),
              title: Text('Configurar horarios de comida', style: theme.textTheme.titleMedium),
              subtitle: Text('${_mealTimes.length} horarios configurados', style: theme.textTheme.bodySmall),
              trailing: Icon(Icons.chevron_right, color: AppColors.textSecondary),
              onTap: () async {
                await Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => MealTimesScreen(
                      onSave: (updatedTimes) {
                        setState(() {
                          _mealTimes = updatedTimes;
                        });
                        context.read<NotificationService>().scheduleMultipleMealReminders(updatedTimes);
                      },
                    ),
                  ),
                );
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