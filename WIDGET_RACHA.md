# Widget de Racha - NutriMama

## 📱 ¿Qué es esto?

Un widget de Android que puedes colocar en la pantalla principal de tu celular. Muestra tu **racha actual** de días consecutivos completando tus metas de hierro, ¡para motivarte a seguir adelante! 🔥

## 🚀 Instalación

### 1. Instalar dependencias

Ejecuta en la terminal:

```bash
cd C:\Users\TurismoProyect\Documents\LTD\NutriMama\fe_nutriapp
flutter pub get
```

### 2. Compilar la aplicación

Asegúrate de que tu celular esté conectado en modo de depuración USB, luego ejecuta:

```bash
flutter run
```

O si prefieres generar un APK instalable:

```bash
flutter build apk --release
```

El APK se generará en: `build/app/outputs/flutter-apk/app-release.apk`

## 📲 Cómo agregar el widget a tu pantalla principal

1. **Abre la aplicación** al menos una vez después de instalarla (esto inicializa el widget con tus datos)

2. **Ve a tu pantalla principal** de Android

3. **Mantén presionado** en un espacio vacío de la pantalla

4. Selecciona **"Widgets"** o **"Complementos"** (depende de tu versión de Android)

5. Busca **"NutriMama"** o **"fe_nutriapp"** en la lista de widgets

6. **Arrastra el widget** "Racha" a tu pantalla principal

7. ¡Listo! El widget mostrará:
   - Tu nombre
   - 🔥 Icono de fuego
   - El número de días seguidos que has completado tus metas
   - Un mensaje motivacional

## 🎨 Diseño del widget

- **Fondo verde** con esquinas redondeadas
- **Racha en grande** con color naranja/rojo
- **Ícono de fuego** para simbolizar la racha
- **Actualización automática** cada 30 minutos

## 🔄 ¿Cuándo se actualiza?

El widget se actualiza automáticamente cuando:
- Abres la aplicación
- Cargas tus metas diarias
- Completas una nueva meta
- Cada 30 minutos (actualización periódica de Android)

## 🐛 Solución de problemas

### El widget no aparece en la lista
- Asegúrate de que la app esté instalada correctamente
- Reinicia tu dispositivo
- Verifica que compilaste con los cambios más recientes

### El widget muestra "0 días"
- Abre la aplicación al menos una vez
- Asegúrate de tener conexión a internet
- Verifica que tengas metas registradas en el backend

### El widget no se actualiza
- Abre la aplicación para forzar la actualización
- Verifica los permisos de la aplicación en Configuración
- Algunos fabricantes (Xiaomi, Huawei) tienen optimización de batería agresiva que puede detener la actualización automática

## 🎯 Siguientes mejoras posibles

- Widget con diferentes tamaños (pequeño, mediano, grande)
- Modo oscuro para el widget
- Gráfico de progreso semanal
- Tocar el widget para abrir directamente la app
- Diferentes colores según el nivel de racha (bronce, plata, oro)

## 📝 Notas técnicas

- **Paquete usado**: `home_widget ^0.7.0`
- **Lenguaje nativo**: Kotlin (Android)
- **Layout XML**: `racha_widget.xml`
- **Provider**: `RachaWidgetProvider.kt`
- **Actualización**: `WidgetService.dart`

---

¡Disfruta tu widget y mantén tu racha! 💪🔥
