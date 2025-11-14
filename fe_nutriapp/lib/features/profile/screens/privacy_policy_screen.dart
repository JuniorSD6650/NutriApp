// lib/features/profile/screens/privacy_policy_screen.dart
import 'package:flutter/material.dart';

class PrivacyPolicyScreen extends StatelessWidget {
  const PrivacyPolicyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Política de Privacidad')),
      body: const SingleChildScrollView(
        padding: EdgeInsets.all(16.0),
        child: Text(
          'Aquí va el texto completo de tu política de privacidad...\n\n'
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '
          'Donec vel egestas dolor. Cras sodales, nisl nec '
          'sodales commodo, magna erat'
        ),
      ),
    );
  }
}