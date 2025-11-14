// lib/features/profile/screens/goals_screen.dart
import 'package:flutter/material.dart';

class GoalsScreen extends StatelessWidget {
  const GoalsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Metas')),
      body: const Center(child: Text('Pantalla de Metas de Calorías y Macros')),
    );
  }
}