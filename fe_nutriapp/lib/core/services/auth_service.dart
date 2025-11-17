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
  String? _userEmail;
  bool _isLoggedIn = false;
  
  bool get isLoggedIn => _isLoggedIn;
  String? get token => _token;
  String? get userRole => _role;
  String? get userEmail => _userEmail;

  // --- ¡CAMBIO CLAVE AQUÍ! ---
  AuthService(this._apiService) {
    // Le dice al ApiService: "Si alguna vez recibes un 401,
    // ejecuta mi función logout()."
    _apiService.onTokenExpired = () {
      print("AuthService: onTokenExpired detectado, cerrando sesión.");
      logout();
    };
  }
  // --------------------------

  // Función para guardar el token, rol Y email
  Future<void> _processToken(String token) async {
    Map<String, dynamic> payload = Jwt.parseJwt(token);
    
    _token = token;
    _role = payload['role'];
    _userEmail = payload['email'];
    _isLoggedIn = true;
    _apiService.setToken(_token);

    await _storage.write(key: 'jwt_token', value: _token);
    await _storage.write(key: 'user_role', value: _role);
    await _storage.write(key: 'user_email', value: _userEmail);
  }

  Future<void> tryAutoLogin() async {
    _token = await _storage.read(key: 'jwt_token');
    _role = await _storage.read(key: 'user_role');
    _userEmail = await _storage.read(key: 'user_email');
    
    if (_token != null && _role != null && _userEmail != null) {
      _isLoggedIn = true;
      _apiService.setToken(_token);
      // No notificamos aquí, esperamos a que el FutureBuilder termine
      // y la primera llamada a la API (ej. getMetaActiva) valide el token.
    }
    // Si el token es nulo, _isLoggedIn sigue en false
  }

  Future<void> login(String email, String password) async {
    try {
      final response = await _apiService.login(email, password);
      await _processToken(response['access_token']);
      notifyListeners(); // Avisa a la UI (main.dart) que el estado cambió
    } catch (e) {
      rethrow; // Pasa el error (ej. "Credenciales incorrectas") a la UI
    }
  }

  Future<void> logout() async {
    // Evitar bucles infinitos si ya se llamó
    if (!_isLoggedIn && _token == null) return; 

    print("AuthService: Ejecutando logout...");
    _token = null;
    _role = null;
    _userEmail = null;
    _isLoggedIn = false;
    
    await _storage.delete(key: 'jwt_token');
    await _storage.delete(key: 'user_role');
    await _storage.delete(key: 'user_email');
    
    _apiService.setToken(null);
    
    notifyListeners(); // Avisa a la UI (main.dart) que debe ir al Login
  }

  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    await _apiService.changePassword(
      currentPassword: currentPassword,
      newPassword: newPassword,
    );
  }
}