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

  Future<void> _submitLogin() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    print('Intentando login con: ${_emailController.text}');
    try {
      // Llama al AuthService (que a su vez llama al ApiService)
      await context.read<AuthService>().login(
            _emailController.text,
            _passwordController.text,
          );
      print('Login exitoso');
      // Si llega aquí, el login fue exitoso y el 'Provider'
      // se encargará de movernos a la pantalla de Home.
    } catch (e) {
      print('Error en login: $e');
      setState(() {
        _errorMessage = e.toString();
        _isLoading = false;
      });
    }
    // Si el login fue exitoso, _isLoading se apaga cuando el estado global cambia y la pantalla cambia.
    // Si falla, ya se apaga arriba.
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
              style: Theme.of(context).textTheme.headlineLarge,
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
            TextField(
              controller: _passwordController,
              obscureText: true,
              decoration: const InputDecoration(
                labelText: 'Contraseña',
                border: OutlineInputBorder(),
              ),
            ),
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
                  _errorMessage!,
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