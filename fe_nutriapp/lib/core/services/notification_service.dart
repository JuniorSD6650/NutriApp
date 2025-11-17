// lib/core/services/notification_service.dart
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:timezone/data/latest_all.dart' as tz; // <-- CAMBIO: all en vez de latest
import 'package:timezone/timezone.dart' as tz;

class NotificationService {
  final FlutterLocalNotificationsPlugin _notifications =
      FlutterLocalNotificationsPlugin();

  // 1. Inicializar
  Future<void> initialize() async {
    const AndroidInitializationSettings initializationSettingsAndroid =
        AndroidInitializationSettings('@mipmap/ic_launcher'); 

    const InitializationSettings initializationSettings =
        InitializationSettings(
      android: initializationSettingsAndroid,
    );
    
    tz.initializeTimeZones();
    
    // CAMBIO: America/Lima (Perú - UTC-5)
    final String timeZoneName = 'America/Lima';
    tz.setLocalLocation(tz.getLocation(timeZoneName));
    
    print('Zona horaria configurada: ${tz.local.name}');
    print('Hora actual (local): ${tz.TZDateTime.now(tz.local)}');

    await _notifications.initialize(initializationSettings);
  }

  // 2. Pedir permisos (Android 13+)
  Future<void> requestPermissions() async {
    // Android 13+ requiere permiso explícito para notificaciones
    final androidPlugin = _notifications
        .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>();
    
    if (androidPlugin != null) {
      // 1. Pedir permiso de notificaciones
      final granted = await androidPlugin.requestNotificationsPermission();
      print('Permiso de notificaciones: ${granted == true ? "Concedido" : "Denegado"}');
      
      // 2. Pedir permiso de alarmas exactas (Android 12+)
      final exactGranted = await androidPlugin.requestExactAlarmsPermission();
      print('Permiso de alarmas exactas: ${exactGranted == true ? "Concedido" : "Denegado"}');
    }

    // iOS (si aplica)
    final iosPlugin = _notifications
        .resolvePlatformSpecificImplementation<IOSFlutterLocalNotificationsPlugin>();
    
    if (iosPlugin != null) {
      await iosPlugin.requestPermissions(
        alert: true,
        badge: true,
        sound: true,
      );
    }
  }

  // 3. Agendar recordatorio diario
  Future<void> scheduleDailyReminder() async {
    final scheduledTime = _nextInstanceOfTime(15, 49);
    print('==== PROGRAMANDO NOTIFICACIÓN DIARIA ====');
    print('Zona horaria: ${tz.local.name}');
    print('Hora actual: ${tz.TZDateTime.now(tz.local)}');
    print('Hora programada: $scheduledTime');
    print('=========================================');
    
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
          playSound: true, // AÑADIDO
          enableVibration: true, // AÑADIDO
        ),
      ),
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
      matchDateTimeComponents: DateTimeComponents.time,
    );
    print('✅ Recordatorio diario programado');
  }

  // MÉTODO DE DEBUG: Mostrar notificación INSTANTÁNEA
  Future<void> showInstantNotification() async {
    await _notifications.show(
      999,
      '🔔 Notificación de Prueba',
      'Si ves esto, las notificaciones están funcionando correctamente.',
      const NotificationDetails(
        android: AndroidNotificationDetails(
          'instant_test_channel',
          'Pruebas Instantáneas',
          channelDescription: 'Canal para probar notificaciones al instante',
          importance: Importance.max,
          priority: Priority.high,
          playSound: true,
          enableVibration: true,
        ),
      ),
    );
    print('✅ Notificación instantánea enviada');
  }

  // 4. Cancelar
  Future<void> cancelAllReminders() async {
    await _notifications.cancelAll();
    print('❌ Todos los recordatorios cancelados');
  }

  // Helper: Calcular la próxima hora específica
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
    
    // Si la hora ya pasó hoy, programa para mañana
    if (scheduledDate.isBefore(now)) {
      scheduledDate = scheduledDate.add(const Duration(days: 1));
      print('⏭️ La hora ya pasó hoy, programando para mañana');
    }
    
    return scheduledDate;
  }
}