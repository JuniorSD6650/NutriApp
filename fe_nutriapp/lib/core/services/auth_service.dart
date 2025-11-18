// lib/core/services/auth_service.dart
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:fe_nutriapp/core/services/nutriapp_api.dart';
import 'package:jwt_decode/jwt_decode.dart';

class AuthService with ChangeNotifier {
  final NutriAppApi _api;
  final _storage = const FlutterSecureStorage();

  String? _token;
  String? _role;
  String? _userEmail;
  bool _isLoggedIn = false;
  
  bool get isLoggedIn => _isLoggedIn;
  String? get token => _token;
  String? get userRole => _role;
  String? get userEmail => _userEmail;

  AuthService(this._api) {
    _api.onTokenExpired = () {
      print("AuthService: onTokenExpired detectado, cerrando sesión.");
      logout();
    };
  }

  Future<void> _processToken(String token) async {
    Map<String, dynamic> payload = Jwt.parseJwt(token);
    
    _token = token;
    _role = payload['role'];
    _userEmail = payload['email'];
    _isLoggedIn = true;
    _api.setToken(_token);

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
      _api.setToken(_token);
    }
  }

  Future<void> login(String email, String password) async {
    try {
      final response = await _api.auth.login(email, password);
      await _processToken(response['access_token']);
      notifyListeners();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> logout() async {
    if (!_isLoggedIn && _token == null) return;

    print("AuthService: Ejecutando logout...");
    _token = null;
    _role = null;
    _userEmail = null;
    _isLoggedIn = false;
    
    await _storage.delete(key: 'jwt_token');
    await _storage.delete(key: 'user_role');
    await _storage.delete(key: 'user_email');
    
    _api.setToken(null);
    
    notifyListeners();
  }

  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    await _api.auth.changePassword(
      currentPassword: currentPassword,
      newPassword: newPassword,
    );
  }
}