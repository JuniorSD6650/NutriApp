// lib/features/profile/screens/iron_tracker_screen.dart
import 'package:flutter/material.dart';

class IronTrackerScreen extends StatelessWidget {
  const IronTrackerScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Seguimiento de Hierro')),
      body: const Center(child: Text('Pantalla de Seguimiento de Hierro')),
    );
  }
}