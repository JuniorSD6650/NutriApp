// lib/main.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fe_nutriapp/core/theme/app_theme.dart';
import 'package:fe_nutriapp/core/services/api_service.dart';
import 'package:fe_nutriapp/core/services/auth_service.dart';
import 'package:fe_nutriapp/core/router.dart'; // <-- IMPORTA EL ROUTER

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
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  @override
  void initState() {
    super.initState();
    // Inicia el intento de auto-login, PERO no bloquea la app
    context.read<AuthService>().tryAutoLogin();
  }

  @override
  Widget build(BuildContext context) {
    // Crea el router
    final router = AppRouter.createRouter(context);

    return MaterialApp.router(
      title: 'NutriApp',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      themeMode: ThemeMode.light,
      
      // --- ¡USA EL ROUTER! ---
      routerConfig: router,
    );
  }
}