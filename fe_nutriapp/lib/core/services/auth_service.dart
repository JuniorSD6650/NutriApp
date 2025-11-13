// lib/core/services/auth_service.dart
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:fe_nutriapp/core/services/api_service.dart';

class AuthService with ChangeNotifier {
  final ApiService _apiService;
  final _storage = const FlutterSecureStorage();

  String? _token;
  bool _isLoggedIn = false;
  
  bool get isLoggedIn => _isLoggedIn;
  String? get token => _token;

  AuthService(this._apiService);

  // Intenta cargar el token al iniciar la app
  Future<void> tryAutoLogin() async {
    _token = await _storage.read(key: 'jwt_token');
    if (_token != null) {
      _isLoggedIn = true;
      _apiService.setToken(_token); // Configura el token en el ApiService
      notifyListeners(); // Avisa a la UI que estamos logueados
    }
  }

  Future<void> login(String email, String password) async {
    try {
      print('AuthService: llamando a ApiService.login');
      final response = await _apiService.login(email, password);
      print('AuthService: respuesta de login: $response');
      _token = response['access_token'];
      
      await _storage.write(key: 'jwt_token', value: _token);
      print('AuthService: token guardado en storage');
      _apiService.setToken(_token);
      _isLoggedIn = true;
      
      notifyListeners(); // Avisa a la UI que el login fue exitoso
      print('AuthService: notifyListeners llamado');
    } catch (e) {
      print('AuthService: error en login: $e');
      rethrow;
    }
  }

  Future<void> logout() async {
    _token = null;
    _isLoggedIn = false;
    await _storage.delete(key: 'jwt_token');
    _apiService.setToken(null);
    
    notifyListeners(); // Avisa a la UI que cerramos sesión
  }
}