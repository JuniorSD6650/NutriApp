// lib/features/profile/screens/help_screen.dart
import 'package:flutter/material.dart';

class HelpScreen extends StatelessWidget {
  const HelpScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        // El AppBar tomará el color de tu tema automáticamente
        title: const Text('Ayuda'),
      ),
      // Usamos un ListView para que la lista sea desplazable
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          Text(
            'Preguntas Frecuentes (FAQ)',
            style: theme.textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),

          // --- Pregunta 1 ---
          _buildFaqTile(
            context,
            question: '¿Cómo registro una comida?',
            answer: 'Ve a la pestaña "Meals" y presiona el botón "+". Busca el platillo que comiste, selecciona las porciones y añade una foto si lo deseas. ¡Eso es todo!',
          ),
          
          // --- Pregunta 2 ---
          _buildFaqTile(
            context,
            question: 'Mis metas de hierro no aparecen',
            answer: 'Las metas de hierro son asignadas por tu médico. Si no ves una meta, por favor contacta a tu médico para que te asigne una en la sección "Metas".',
          ),

          // --- Pregunta 3 ---
          _buildFaqTile(
            context,
            question: '¿Cómo actualizo mi perfil?',
            answer: 'Puedes actualizar tus datos personales (como peso o alergias) navegando a la pestaña "More" > "Perfil" y buscando el botón de editar.',
          ),
          
          // --- Pregunta 4 ---
          _buildFaqTile(
            context,
            question: '¿Qué hago si no encuentro un platillo?',
            answer: 'El catálogo de platillos es administrado por el equipo de NutriApp. Si falta un platillo que consumes con frecuencia, por favor contacta a soporte o a tu médico para que sea añadido.',
          ),
        ],
      ),
    );
  }

  // Widget reutilizable para las tarjetas de FAQ
  Widget _buildFaqTile(BuildContext context, {required String question, required String answer}) {
    final theme = Theme.of(context);
    return Card(
      // Usamos el color de superficie (blanco) de tu tema
      color: theme.cardColor,
      margin: const EdgeInsets.symmetric(vertical: 8.0),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      elevation: 1,
      child: ExpansionTile(
        // El título de la pregunta
        title: Text(
          question,
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        // El icono de flecha
        iconColor: theme.colorScheme.primary,
        collapsedIconColor: theme.textTheme.bodyMedium?.color,
        children: [
          // La respuesta (con padding)
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Text(
              answer,
              style: theme.textTheme.bodyMedium?.copyWith(fontSize: 15),
            ),
          ),
        ],
      ),
    );
  }
}