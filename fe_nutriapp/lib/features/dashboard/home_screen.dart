// lib/features/dashboard/home_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fe_nutriapp/core/services/auth_service.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('NutriApp'), // Usará el tema naranja
      ),
      body: const Center(
        child: Text('¡Logueado! Esta es la pantalla principal.'),
      ),
    );
  }
}