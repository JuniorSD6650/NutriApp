// lib/core/services/notification_service.dart
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:timezone/data/latest_all.dart' as tz;
import 'package:timezone/timezone.dart' as tz;
import 'package:fe_nutriapp/core/models/meal_time.dart';

class NotificationService {
  final FlutterLocalNotificationsPlugin _notifications =
      FlutterLocalNotificationsPlugin();

  Future<void> initialize() async {
    const AndroidInitializationSettings initializationSettingsAndroid =
        AndroidInitializationSettings('@mipmap/ic_launcher'); 

    const InitializationSettings initializationSettings =
        InitializationSettings(
      android: initializationSettingsAndroid,
    );
    
    tz.initializeTimeZones();
    
    try {
      tz.setLocalLocation(tz.getLocation('America/Lima'));
    } catch (e) {
      print("No se pudo configurar la zona horaria local: $e");
    }

    await _notifications.initialize(initializationSettings);
  }

  Future<void> requestPermissions() async {
    final androidPlugin = _notifications
        .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>();
    
    if (androidPlugin != null) {
      await androidPlugin.requestNotificationsPermission();
      await androidPlugin.requestExactAlarmsPermission();
    }
  }

  Future<void> scheduleDailyReminder() async {
    final scheduledTime = _nextInstanceOfTime(14, 00); // 2:00 PM
    
    await _notifications.zonedSchedule(
      0,
      '¡No olvides tu registro!',
      'Recuerda registrar tu comida para llevar un control de tu hierro.',
      scheduledTime,
      const NotificationDetails(
        android: AndroidNotificationDetails(
          'daily_reminder_channel',
          'Recordatorios Diarios',
          channelDescription: 'Canal para recordatorios de registro de comidas',
          importance: Importance.max,
          priority: Priority.high,
          playSound: true,
          enableVibration: true,
        ),
      ),
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
      matchDateTimeComponents: DateTimeComponents.time,
      
      // --- ¡LÍNEA ELIMINADA! ---
      // uiLocalNotificationDateInterpretation: ... (Ya no es necesaria)
      // ------------------------
      
      // En versiones nuevas, este es el reemplazo (si es requerido):
    );
    print('✅ Recordatorio diario programado');
  }

  // Programar múltiples notificaciones
  Future<void> scheduleMultipleMealReminders(List<MealTime> mealTimes) async {
    await _notifications.cancelAll();
    
    for (final mealTime in mealTimes) {
      final scheduledTime = _nextInstanceOfTime(mealTime.hour, mealTime.minute);
      final notificationId = mealTime.id.hashCode;
      
      print('📅 Programando ${mealTime.label} a las ${mealTime.timeString}');
      
      await _notifications.zonedSchedule(
        notificationId,
        '🍽️ Hora de ${mealTime.label}',
        'No olvides registrar tu comida para tu control de hierro.',
        scheduledTime,
        const NotificationDetails(
          android: AndroidNotificationDetails(
            'meal_reminders_channel',
            'Recordatorios de Comida',
            channelDescription: 'Notificaciones para recordarte registrar tus comidas',
            importance: Importance.max,
            priority: Priority.high,
            playSound: true,
            enableVibration: true,
          ),
        ),
        androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
        matchDateTimeComponents: DateTimeComponents.time,
      );
    }
    
    print('✅ ${mealTimes.length} recordatorios programados');
  }

  Future<void> cancelAllReminders() async {
    await _notifications.cancelAll();
    print('❌ Todos los recordatorios cancelados');
  }

  Future<void> showInstantNotification() async {
    await _notifications.show(
      999,
      '🔔 Prueba Instantánea',
      '¡Las notificaciones funcionan!',
      const NotificationDetails(
        android: AndroidNotificationDetails(
          'instant_test_channel',
          'Pruebas',
          importance: Importance.max,
          priority: Priority.high,
        ),
      ),
    );
  }

  Future<void> scheduleNotificationIn10Seconds() async {
    final tz.TZDateTime now = tz.TZDateTime.now(tz.local);
    final tz.TZDateTime scheduledDate = now.add(const Duration(seconds: 10));

    print('🕒 Programando prueba para dentro de 10s: $scheduledDate');

    await _notifications.zonedSchedule(
      888,
      '⏳ Prueba de 10 segundos',
      '¡Funciona! Las notificaciones programadas están activas.',
      scheduledDate,
      const NotificationDetails(
        android: AndroidNotificationDetails(
          'scheduled_test_channel',
          'Pruebas Programadas',
          importance: Importance.max,
          priority: Priority.high,
          playSound: true,
          enableVibration: true,
        ),
      ),
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
      
      // --- ¡LÍNEA ELIMINADA! ---
      // uiLocalNotificationDateInterpretation: ...
      // ------------------------
    );
  }

  tz.TZDateTime _nextInstanceOfTime(int hour, int minute) {
    final tz.TZDateTime now = tz.TZDateTime.now(tz.local);
    tz.TZDateTime scheduledDate = tz.TZDateTime(
      tz.local, 
      now.year, 
      now.month, 
      now.day, 
      hour, 
      minute
    );
    if (scheduledDate.isBefore(now)) {
      scheduledDate = scheduledDate.add(const Duration(days: 1));
    }
    return scheduledDate;
  }
}