// lib/features/daily_log/daily_log_screen.dart
import 'package:flutter/material.dart';

class DailyLogScreen extends StatelessWidget {
  const DailyLogScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Diario')),
      body: const Center(child: Text('Pantalla del Diario (Meals)')),
    );
  }
}