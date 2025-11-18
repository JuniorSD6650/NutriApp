import 'package:http/http.dart' as http;
import 'dart:convert';
import '../api_service.dart';

class AuthApi {
  final ApiService _apiService;

  AuthApi(this._apiService);

  Future<Map<String, dynamic>> login(String email, String password) async {
    final url = Uri.parse('${_apiService.baseUrl}/auth/login');
    http.Response response;

    try {
      response = await http.post(
        url,
        headers: _apiService.headers,
        body: jsonEncode({'email': email, 'password': password}),
      );
    } catch (e) {
      print('AuthApi: Error de conexión: $e');
      throw Exception('No se pudo conectar al servidor. Revisa tu internet.');
    }

    if (response.statusCode == 401) {
      try {
        final errorBody = jsonDecode(response.body) as Map<String, dynamic>;
        throw Exception(errorBody['message'] ?? 'Credenciales incorrectas');
      } catch (e) {
        throw Exception('Credenciales incorrectas');
      }
    }

    return _apiService.processResponse(response);
  }

  Future<Map<String, dynamic>> getProfile() async {
    if (_apiService.token == null) throw Exception('No estás autenticado.');
    
    final url = Uri.parse('${_apiService.baseUrl}/auth/profile');
    print('AuthApi: GET $url');
    
    http.Response response;
    try {
      response = await http.get(url, headers: _apiService.headers);
    } catch (e) {
      print('AuthApi: Error de conexión: $e');
      throw Exception('No se pudo conectar al servidor. Revisa tu internet.');
    }

    return _apiService.processResponse(response);
  }

  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    if (_apiService.token == null) throw Exception('No estás autenticado.');

    final url = Uri.parse('${_apiService.baseUrl}/auth/change-password');
    http.Response response;

    try {
      response = await http.patch(
        url,
        headers: _apiService.headers,
        body: jsonEncode({
          'currentPassword': currentPassword,
          'newPassword': newPassword,
        }),
      );
    } catch (e) {
      print('AuthApi: Error de conexión: $e');
      throw Exception('No se pudo conectar al servidor. Revisa tu internet.');
    }

    _apiService.processResponse(response);
  }
}
