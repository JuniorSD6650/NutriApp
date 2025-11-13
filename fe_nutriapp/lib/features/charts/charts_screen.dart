// lib/features/charts/charts_screen.dart
import 'package:flutter/material.dart';

class ChartsScreen extends StatelessWidget {
  const ChartsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Gráficas')),
      body: const Center(child: Text('Pantalla de Gráficas (Charts)')),
    );
  }
}