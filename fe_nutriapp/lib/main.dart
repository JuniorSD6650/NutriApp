// lib/main.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fe_nutriapp/core/theme/app_theme.dart';
import 'package:fe_nutriapp/core/services/api_service.dart';
import 'package:fe_nutriapp/core/services/auth_service.dart';
import 'package:fe_nutriapp/features/auth/login_screen.dart';
import 'package:fe_nutriapp/features/dashboard/home_screen.dart';

void main() {
  final apiService = ApiService();
  
  runApp(
    MultiProvider(
      providers: [
        Provider<ApiService>(
          create: (_) => apiService,
        ),
        ChangeNotifierProvider<AuthService>(
          create: (context) => AuthService(context.read<ApiService>()),
        ),
      ],
      child: const MyApp(), // El widget MyApp sigue aquí
    ),
  );
}

// 1. CONVERTIR MyApp A UN StatefulWidget
class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

// 2. CREAR EL ESTADO
class _MyAppState extends State<MyApp> {

  // 3. DEFINIR UNA VARIABLE PARA GUARDAR EL FUTURE
  late Future<void> _tryAutoLoginFuture;

  @override
  void initState() {
    super.initState();
    // 4. LLAMAR A LA FUNCIÓN UNA SOLA VEZ AQUÍ
    _tryAutoLoginFuture = context.read<AuthService>().tryAutoLogin();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'NutriApp',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      themeMode: ThemeMode.light,
      
      // 5. USAR EL FUTUREBUILDER CON LA VARIABLE
      home: FutureBuilder(
        future: _tryAutoLoginFuture, // <-- Usa la variable (no llama a la función)
        builder: (context, snapshot) {
          
          // Mientras espera a que termine el tryAutoLogin...
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Scaffold(
              body: Center(child: CircularProgressIndicator()),
            );
          }
          
          // Una vez que termina, revisa el estado (isLoggedIn)
          // Usamos Consumer para que se actualice si el estado cambia (ej. al hacer logout)
          return Consumer<AuthService>(
            builder: (context, authService, child) {
              if (authService.isLoggedIn) {
                return const HomeScreen();
              } else {
                return const LoginScreen();
              }
            },
          );
        },
      ),
    );
  }
}