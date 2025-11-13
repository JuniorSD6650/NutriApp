// lib/features/profile/profile_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fe_nutriapp/core/services/auth_service.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Perfil')),
      body: Center(
        child: ElevatedButton(
          // Botón de Logout (como en Ejemplo 2)
          onPressed: () {
            context.read<AuthService>().logout();
          },
          child: const Text('Cerrar Sesión'),
        ),
      ),
    );
  }
}