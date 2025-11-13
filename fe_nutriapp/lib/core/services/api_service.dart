// lib/core/services/api_service.dart
import 'package:http/http.dart' as http;
import 'dart:convert';

class ApiService {
  // -----------------------------------------------------------
  // ¡¡IMPORTANTE!! 
  // CAMBIA ESTA IP por la IP local de tu computadora (la que
  // te da 'ipconfig' o 'ifconfig'). NO uses 'localhost'.
  final String _baseUrl = "https://6a843927a0fe.ngrok-free.app"; 
  // -----------------------------------------------------------

  // Almacenará el token del usuario una vez logueado
  String? _token;

  // Método para actualizar el token (lo usará el AuthService)
  void setToken(String? token) {
    _token = token;
  }

  // --- Endpoint de Login ---
  Future<Map<String, dynamic>> login(String email, String password) async {
    final url = Uri.parse('$_baseUrl/auth/login');
    print('ApiService: POST $url');
    print('ApiService: body: email=$email, password=$password');
    
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': email,
        'password': password,
      }),
    );

    print('ApiService: statusCode=${response.statusCode}');
    print('ApiService: response.body=${response.body}');

    if (response.statusCode == 200) {
      // Éxito, devuelve el JSON (ej. {"access_token": "..."})
      return jsonDecode(response.body);
    } else {
      // Error (ej. 401 Credenciales incorrectas)
      throw Exception('Falló el inicio de sesión: ${response.body}');
    }
  }

  // --- Endpoint de Perfil (para probar el token) ---
  Future<Map<String, dynamic>> getProfile() async {
    final url = Uri.parse('$_baseUrl/auth/profile');
    
    final response = await http.get(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $_token', // <-- Usa el token guardado
      },
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Falló al obtener el perfil: ${response.body}');
    }
  }

  // Aquí irán todos tus otros endpoints (getPlatillos, createRegistro, etc.)
}