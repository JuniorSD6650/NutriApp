// lib/main.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fe_nutriapp/core/theme/app_theme.dart';
import 'package:fe_nutriapp/core/services/api_service.dart';
import 'package:fe_nutriapp/core/services/auth_service.dart';
import 'package:fe_nutriapp/features/auth/login_screen.dart';
// ¡Ya no importamos HomeScreen, importamos el Despachador!
import 'package:fe_nutriapp/features/navigation/role_dispatcher_screen.dart'; 

void main() {
  // ... (el main() sigue igual)
  final apiService = ApiService();
  runApp(
    MultiProvider(
      providers: [
        Provider<ApiService>(create: (_) => apiService),
        ChangeNotifierProvider<AuthService>(
          create: (context) => AuthService(context.read<ApiService>()),
        ),
      ],
      child: const MyApp(),
    ),
  );
}

class _MyAppState extends State<MyApp> {
  late Future<void> _tryAutoLoginFuture;

  @override
  void initState() {
    super.initState();
    _tryAutoLoginFuture = context.read<AuthService>().tryAutoLogin();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'NutriApp',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      themeMode: ThemeMode.light,
      
      home: FutureBuilder(
        future: _tryAutoLoginFuture,
        builder: (context, snapshot) {
          
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Scaffold(
              body: Center(child: CircularProgressIndicator()),
            );
          }
          
          return Consumer<AuthService>(
            builder: (context, authService, child) {
              if (authService.isLoggedIn) {
                // <-- ¡CAMBIO AQUÍ!
                return const RoleDispatcherScreen(); // Muestra el Despachador
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

// (El State de MyApp sigue igual)
class MyApp extends StatefulWidget {
  const MyApp({super.key});
  @override
  State<MyApp> createState() => _MyAppState();
}