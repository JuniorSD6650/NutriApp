// lib/features/navigation/role_dispatcher_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fe_nutriapp/core/services/auth_service.dart';

// Importa las 3 cáscaras de navegación
import 'package:fe_nutriapp/features/paciente/widgets/paciente_navigation_shell.dart';
import 'package:fe_nutriapp/features/medico/widgets/medico_navigation_shell.dart';
import 'package:fe_nutriapp/features/admin/widgets/admin_navigation_shell.dart';

class RoleDispatcherScreen extends StatelessWidget {
  const RoleDispatcherScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final userRole = context.watch<AuthService>().userRole;

    switch (userRole) {
      case 'paciente':
        return const PacienteNavigationShell();
      case 'medico':
        return const MedicoNavigationShell();
      case 'admin':
        return const AdminNavigationShell();
      default:
        return const Scaffold(
          body: Center(
            child: Text('Error: Rol de usuario desconocido.'),
          ),
        );
    }
  }
}