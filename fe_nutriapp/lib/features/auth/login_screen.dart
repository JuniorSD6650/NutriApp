// lib/features/auth/login_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fe_nutriapp/core/services/auth_service.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;
  String? _errorMessage;

  // --- AÑADIDO ---
  // 1. Variable de estado para controlar la visibilidad
  bool _isPasswordObscured = true;
  // --- FIN DE AÑADIDO ---

  Future<void> _submitLogin() async {
    final email = _emailController.text;
    final password = _passwordController.text;

    // --- 1. Validación del lado del cliente ---
    if (email.isEmpty || password.isEmpty) {
      setState(() {
        _errorMessage = 'Por favor, complete todos los campos.';
      });
      return; // No continuar si está vacío
    }
    
    if (!email.contains('@') || !email.contains('.')) {
      setState(() {
        _errorMessage = 'Por favor, ingrese un correo válido.';
      });
      return;
    }
    
    // Si pasa la validación, inicia la carga
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      // Llama al AuthService
      await context.read<AuthService>().login(
            email,
            password,
          );
      // Si llega aquí, el login fue exitoso

    } catch (e) {
      // --- 2. Manejo de Errores del Lado del Servidor ---
      String message = e.toString();
      
      // Limpia el "Exception: " del mensaje
      if (message.startsWith('Exception: ')) {
        message = message.substring(11);
      }

      setState(() {
        // Ahora _errorMessage solo será "Credenciales incorrectas"
        // o "No se pudo conectar al servidor."
        _errorMessage = message; 
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'Bienvenido a NutriApp',
              textAlign: TextAlign.center,
              // ¡Usa el tema que definiste!
              style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                color: Theme.of(context).colorScheme.primary
              ),
            ),
            const SizedBox(height: 40),
            TextField(
              controller: _emailController,
              keyboardType: TextInputType.emailAddress,
              decoration: const InputDecoration(
                labelText: 'Email',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),

            // --- WIDGET DE CONTRASEÑA MODIFICADO ---
            TextField(
              controller: _passwordController,
              // 2. Usa la variable de estado aquí
              obscureText: _isPasswordObscured, 
              decoration: InputDecoration(
                labelText: 'Contraseña',
                border: const OutlineInputBorder(),
                // 3. Añade el icono (el "ojito")
                suffixIcon: IconButton(
                  icon: Icon(
                    // Cambia el icono basado en el estado
                    _isPasswordObscured ? Icons.visibility_off : Icons.visibility,
                  ),
                  onPressed: () {
                    // 4. Actualiza el estado al presionar el botón
                    setState(() {
                      _isPasswordObscured = !_isPasswordObscured;
                    });
                  },
                ),
              ),
            ),
            // --- FIN DE LA MODIFICACIÓN ---

            const SizedBox(height: 24),
            if (_isLoading)
              const Center(child: CircularProgressIndicator())
            else
              ElevatedButton(
                onPressed: _submitLogin,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  backgroundColor: Theme.of(context).colorScheme.primary,
                  foregroundColor: Colors.white,
                ),
                child: const Text('Iniciar Sesión'),
              ),
            if (_errorMessage != null)
              Padding(
                padding: const EdgeInsets.only(top: 16),
                child: Text(
                  _errorMessage!, // <-- Ahora muestra un mensaje limpio
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: Colors.red),
                ),
              ),
          ],
        ),
      ),
    );
  }
}