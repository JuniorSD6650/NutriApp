import 'package:flutter/material.dart';
import 'package:fe_nutriapp/core/models/meal_time.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

class MealTimesScreen extends StatefulWidget {
  final Function(List<MealTime>) onSave;
  
  const MealTimesScreen({super.key, required this.onSave});

  @override
  State<MealTimesScreen> createState() => _MealTimesScreenState();
}

class _MealTimesScreenState extends State<MealTimesScreen> {
  List<MealTime> _mealTimes = [];

  @override
  void initState() {
    super.initState();
    _loadMealTimes();
  }

  Future<void> _loadMealTimes() async {
    final prefs = await SharedPreferences.getInstance();
    final jsonString = prefs.getString('meal_times');
    
    if (jsonString != null) {
      final List<dynamic> jsonList = jsonDecode(jsonString);
      setState(() {
        _mealTimes = jsonList.map((json) => MealTime.fromJson(json)).toList();
      });
    } else {
      setState(() {
        _mealTimes = [
          MealTime(id: '1', hour: 7, minute: 0, label: 'Desayuno'),
          MealTime(id: '2', hour: 13, minute: 0, label: 'Almuerzo'),
          MealTime(id: '3', hour: 19, minute: 0, label: 'Cena'),
        ];
      });
      _saveMealTimes();
    }
  }

  Future<void> _saveMealTimes() async {
    final prefs = await SharedPreferences.getInstance();
    final jsonString = jsonEncode(_mealTimes.map((m) => m.toJson()).toList());
    await prefs.setString('meal_times', jsonString);
    widget.onSave(_mealTimes);
  }

  Future<void> _editMealTime(int index) async {
    final mealTime = _mealTimes[index];
    final TimeOfDay? picked = await showTimePicker(
      context: context,
      initialTime: TimeOfDay(hour: mealTime.hour, minute: mealTime.minute),
    );
    
    if (picked != null) {
      setState(() {
        _mealTimes[index] = MealTime(
          id: mealTime.id,
          hour: picked.hour,
          minute: picked.minute,
          label: mealTime.label,
        );
      });
      await _saveMealTimes();
    }
  }

  Future<void> _addMealTime() async {
    final TextEditingController labelController = TextEditingController();
    final TimeOfDay? picked = await showTimePicker(
      context: context,
      initialTime: const TimeOfDay(hour: 12, minute: 0),
    );
    
    if (picked != null && mounted) {
      await showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Nombre de la comida'),
          content: TextField(
            controller: labelController,
            decoration: const InputDecoration(hintText: 'Ej: Merienda'),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancelar'),
            ),
            TextButton(
              onPressed: () {
                Navigator.pop(context);
                setState(() {
                  _mealTimes.add(MealTime(
                    id: DateTime.now().millisecondsSinceEpoch.toString(),
                    hour: picked.hour,
                    minute: picked.minute,
                    label: labelController.text.isEmpty ? 'Comida' : labelController.text,
                  ));
                });
                _saveMealTimes();
              },
              child: const Text('Guardar'),
            ),
          ],
        ),
      );
    }
  }

  void _deleteMealTime(int index) {
    setState(() {
      _mealTimes.removeAt(index);
    });
    _saveMealTimes();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Scaffold(
      appBar: AppBar(title: const Text('Horarios de Comida')),
      body: ListView.builder(
        itemCount: _mealTimes.length,
        itemBuilder: (context, index) {
          final mealTime = _mealTimes[index];
          return ListTile(
            leading: Icon(Icons.restaurant_menu, color: theme.colorScheme.primary),
            title: Text(mealTime.label, style: theme.textTheme.titleMedium),
            subtitle: Text(mealTime.timeString, style: theme.textTheme.bodyMedium),
            trailing: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                IconButton(
                  icon: const Icon(Icons.edit),
                  onPressed: () => _editMealTime(index),
                ),
                IconButton(
                  icon: const Icon(Icons.delete, color: Colors.red),
                  onPressed: () => _deleteMealTime(index),
                ),
              ],
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _addMealTime,
        child: const Icon(Icons.add),
      ),
    );
  }
}
