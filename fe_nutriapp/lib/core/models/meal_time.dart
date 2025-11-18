class MealTime {
  final String id; // Para identificar cada notificación única
  final int hour;
  final int minute;
  final String label; // "Desayuno", "Almuerzo", etc.

  MealTime({
    required this.id,
    required this.hour,
    required this.minute,
    required this.label,
  });

  String get timeString {
    final h = hour.toString().padLeft(2, '0');
    final m = minute.toString().padLeft(2, '0');
    return '$h:$m';
  }

  // Para guardar/cargar de SharedPreferences
  Map<String, dynamic> toJson() => {
    'id': id,
    'hour': hour,
    'minute': minute,
    'label': label,
  };

  factory MealTime.fromJson(Map<String, dynamic> json) => MealTime(
    id: json['id'],
    hour: json['hour'],
    minute: json['minute'],
    label: json['label'],
  );
}
