// lib/main.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fe_nutriapp/core/theme/app_theme.dart';
import 'package:fe_nutriapp/core/services/api_service.dart';
import 'package:fe_nutriapp/core/services/auth_service.dart';
import 'package:fe_nutriapp/features/auth/login_screen.dart';
import 'package:fe_nutriapp/features/navigation/role_dispatcher_screen.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:fe_nutriapp/core/theme/theme_provider.dart'; // <-- ¡LA IMPORTACIÓN ESTÁ AQUÍ!

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeDateFormatting('es_ES', null);
  
  final apiService = ApiService();
  runApp(
    MultiProvider(
      providers: [
        Provider<ApiService>(create: (_) => apiService),
        ChangeNotifierProvider<AuthService>(
          create: (context) => AuthService(context.read<ApiService>()),
        ),
        ChangeNotifierProvider<ThemeProvider>( // <-- Esta línea ahora es válida
          create: (_) => ThemeProvider(),
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
    return Consumer<ThemeProvider>( // <-- Esta línea ahora es válida
      builder: (context, themeProvider, child) {
        
        return MaterialApp(
          title: 'NutriApp',
          debugShowCheckedModeBanner: false,
          
          theme: AppTheme.lightTheme,
          darkTheme: AppTheme.darkTheme, // (Asumiendo que lo tienes)
          
          themeMode: themeProvider.themeMode, // <-- Esta línea ahora es válida

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
                    return const RoleDispatcherScreen();
                  } else {
                    return const LoginScreen();
                  }
                },
              );
            },
          ),
        );
      }
    );
  }
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});
  @override
  State<MyApp> createState() => _MyAppState();
}