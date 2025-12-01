// lib/core/services/widget_service.dart
import 'package:home_widget/home_widget.dart';

class WidgetService {
  static Future<void> updateWidget({
    required int rachaActual,
    required String nombrePaciente,
    required String rol,
  }) async {
    try {
      // Guardar datos en el widget
      await HomeWidget.saveWidgetData<int>('racha', rachaActual);
      await HomeWidget.saveWidgetData<String>('nombre', nombrePaciente);
      await HomeWidget.saveWidgetData<String>('rol', rol);
      
      // Actualizar el widget en Android
      await HomeWidget.updateWidget(
        androidName: 'RachaWidgetProvider',
      );
    } catch (e) {
      print('Error actualizando widget: $e');
    }
  }
}
