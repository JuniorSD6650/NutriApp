// lib/core/services/auth_service.dart
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:fe_nutriapp/core/services/api_service.dart';
import 'package:jwt_decode/jwt_decode.dart';

class AuthService with ChangeNotifier {
  final ApiService _apiService;
  final _storage = const FlutterSecureStorage();

  String? _token;
  String? _role;
  String? _userEmail; // <-- AÑADIDO: Para guardar el email
  bool _isLoggedIn = false;
  
  bool get isLoggedIn => _isLoggedIn;
  String? get token => _token;
  String? get userRole => _role;
  String? get userEmail => _userEmail; // <-- AÑADIDO: Getter para el email

  AuthService(this._apiService);

  // Función para guardar el token, rol Y email
  Future<void> _processToken(String token) async {
    Map<String, dynamic> payload = Jwt.parseJwt(token);
    
    _token = token;
    _role = payload['role'];
    _userEmail = payload['email']; // <-- AÑADIDO: Extrae el email del token
    _isLoggedIn = true;
    _apiService.setToken(_token);

    // Guarda todo en el almacenamiento seguro
    await _storage.write(key: 'jwt_token', value: _token);
    await _storage.write(key: 'user_role', value: _role);
    await _storage.write(key: 'user_email', value: _userEmail); // <-- AÑADIDO
  }

  Future<void> tryAutoLogin() async {
    _token = await _storage.read(key: 'jwt_token');
    _role = await _storage.read(key: 'user_role');
    _userEmail = await _storage.read(key: 'user_email'); // <-- AÑADIDO: Carga el email
    
    if (_token != null && _role != null && _userEmail != null) { // <-- AÑADIDO: Verifica el email
      _isLoggedIn = true;
      _apiService.setToken(_token);
      notifyListeners();
    }
  }

  Future<void> login(String email, String password) async {
    try {
      final response = await _apiService.login(email, password);
      await _processToken(response['access_token']);
      notifyListeners();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> logout() async {
    _token = null;
    _role = null;
    _userEmail = null; // <-- AÑADIDO: Limpia el email
    _isLoggedIn = false;
    await _storage.delete(key: 'jwt_token');
    await _storage.delete(key: 'user_role');
    await _storage.delete(key: 'user_email'); // <-- AÑADIDO: Borra el email
    _apiService.setToken(null);
    
    notifyListeners();
  }
}