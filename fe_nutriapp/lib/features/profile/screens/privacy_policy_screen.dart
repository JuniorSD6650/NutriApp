// lib/features/profile/screens/privacy_policy_screen.dart
import 'package:flutter/material.dart';

class PrivacyPolicyScreen extends StatelessWidget {
  const PrivacyPolicyScreen({super.key});

  // Helper widget para títulos de sección
  Widget _buildSectionTitle(BuildContext context, String title) {
    return Padding(
      padding: const EdgeInsets.only(top: 16.0, bottom: 8.0),
      child: Text(
        title,
        style: Theme.of(context).textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.bold,
              color: Theme.of(context).textTheme.bodyLarge?.color,
            ),
      ),
    );
  }

  // Helper widget para párrafos de texto
  Widget _buildSectionText(BuildContext context, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Text(
        text,
        style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontSize: 15),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Política de Privacidad')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // --- INICIO DEL TEXTO DE LA POLÍTICA ---

            _buildSectionText(
              context,
              'Última actualización: 17 de noviembre de 2025\n\n'
              'Bienvenido a NutriApp. Tu privacidad es fundamental para nosotros. Esta Política de Privacidad explica cómo recopilamos, usamos, divulgamos y protegemos tu información cuando usas nuestra aplicación móvil.',
            ),
            
            _buildSectionTitle(context, '1. Información que Recopilamos'),
            _buildSectionText(
              context,
              'Podemos recopilar la siguiente información sobre ti:\n\n'
              'a) Información Personal de la Cuenta:\n'
              '•  Nombre, dirección de correo electrónico y contraseña (encriptada) cuando te registras.\n'
              '•  Tu rol (Paciente, Médico o Administrador).\n\n'
              'b) Información de Perfil de Salud (Pacientes):\n'
              '•  Datos que proporcionas voluntariamente, como fecha de nacimiento, peso inicial, altura, semanas de gestación, tipo de dieta y alergias alimentarias.\n\n'
              'c) Datos de Uso (Pacientes):\n'
              '•  Registros de consumo de alimentos, incluyendo el tipo de comida, porciones y platillos seleccionados.\n'
              '•  Fotografías de tus comidas que subes voluntariamente a la aplicación.\n\n'
              'd) Información Profesional (Médicos):\n'
              '•  Especialidad y número de colegiado para la verificación y perfil profesional.',
            ),

            _buildSectionTitle(context, '2. Cómo Usamos tu Información'),
            _buildSectionText(
              context,
              'Usamos la información que recopilamos para:\n\n'
              '•  Proveer y mantener el servicio (autenticarte, mostrar tu panel).\n'
              '•  Calcular tu ingesta nutricional (ej. hierro, calorías) basado en los platillos que registras.\n'
              '•  Permitir que tu Médico asignado vea tu progreso y te asigne metas.\n'
              '•  Mostrarte tu progreso y metas en gráficos y resúmenes.\n'
              '•  Mejorar la aplicación y responder a solicitudes de soporte.',
            ),
            
            _buildSectionTitle(context, '3. Cómo Compartimos tu Información'),
            _buildSectionText(
              context,
              'Tu privacidad es nuestra prioridad:\n\n'
              '•  Con tu Médico Asignado: La información de tu perfil de paciente y tus registros de consumo (incluyendo fotos) son compartidos **únicamente** con el profesional de la salud (Médico) que está vinculado a tu cuenta en nuestra plataforma. Esto es esencial para tu seguimiento.\n\n'
              '•  Proveedores de Servicios: (Si usaras Ngrok o un servicio de hosting) Podemos compartir información con proveedores que alojan nuestros servidores (backend) y bases de datos, pero están obligados a mantener tu información segura.\n\n'
              '•  Por Obligación Legal: No compartiremos tu información personal o de salud con nadie más, excepto si es requerido por ley.\n\n'
              '**No vendemos tu información personal a terceros.**',
            ),

            _buildSectionTitle(context, '4. Seguridad de tus Datos'),
            _buildSectionText(
              context,
              'Implementamos medidas de seguridad para proteger tu información. Tu contraseña se almacena de forma encriptada (hashing) y la comunicación entre la app y el servidor está protegida (ej. HTTPS a través de Ngrok). Las fotos subidas se almacenan en nuestro servidor y solo son accesibles a través de la app por usuarios autenticados (tú y tu médico).',
            ),

            _buildSectionTitle(context, '5. Tus Derechos'),
            _buildSectionText(
              context,
              'Tienes derecho a acceder, corregir o eliminar tu información personal. Puedes actualizar la mayoría de tu información de perfil directamente en la app. Si deseas eliminar tu cuenta por completo, por favor contáctanos.',
            ),
            
            _buildSectionTitle(context, '6. Cambios a esta Política'),
            _buildSectionText(
              context,
              'Podemos actualizar esta política de privacidad de vez en cuando. Te notificaremos de cualquier cambio publicando la nueva política en esta página.',
            ),

            _buildSectionTitle(context, '7. Contáctanos'),
            _buildSectionText(
              context,
              'Si tienes alguna pregunta sobre esta Política de Privacidad, por favor contáctanos en:\n\n'
              'admin@nutriapp.com (o tu email de soporte)',
            ),

            // --- FIN DEL TEXTO DE LA POLÍTICA ---
          ],
        ),
      ),
    );
  }
}