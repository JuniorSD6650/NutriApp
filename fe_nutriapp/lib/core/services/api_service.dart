// lib/core/services/api_service.dart
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:intl/intl.dart';

class ApiService {
  final Map<String, String> _ngrokHeaders = {
    'ngrok-skip-browser-warning': 'true',
  };

  final String _baseUrl = "https://72947d158411.ngrok-free.app";

  String? _token;

  void setToken(String? token) {
    _token = token;
    if (_token != null) {
      _ngrokHeaders['Authorization'] = 'Bearer $_token';
    } else {
      _ngrokHeaders.remove('Authorization');
    }
  }

  Future<Map<String, dynamic>> login(String email, String password) async {
    final url = Uri.parse('$_baseUrl/auth/login');

    print('ApiService: POST $url');
    print('ApiService: body: email=$email, password=$password');

    http.Response response;

    // 1. Manejo de errores de conexión
    try {
      response = await http.post(
        url,
        headers: {..._ngrokHeaders, 'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}),
      );
    } catch (e) {
      print('ApiService: Error de conexión: $e');
      throw Exception('No se pudo conectar al servidor. Revisa tu internet.');
    }

    print('ApiService: statusCode=${response.statusCode}');
    print('ApiService: response.body=${response.body}');

    // 2. Verificar si la respuesta fue exitosa
    if (response.statusCode >= 200 && response.statusCode < 300) {
      // Éxito - decodificar y retornar
      return jsonDecode(response.body);
    }

    // 3. Manejo de errores del servidor (4xx, 5xx)
    try {
      final errorBody = jsonDecode(response.body) as Map<String, dynamic>;

      // NestJS puede devolver 'message' como String o como Array
      final dynamic messageField = errorBody['message'];
      String errorMessage;

      if (messageField is String) {
        errorMessage = messageField;
      } else if (messageField is List && messageField.isNotEmpty) {
        // Si es un array de errores de validación, toma el primero
        errorMessage = messageField.first.toString();
      } else {
        errorMessage = errorBody['error'] ?? 'Error desconocido';
      }

      print('ApiService: Error del servidor: $errorMessage');
      throw Exception(errorMessage);
    } catch (e) {
      // Si no se puede decodificar el JSON
      if (e is Exception && e.toString().contains('Exception:')) {
        rethrow; // Re-lanza la excepción que ya formateamos
      }
      print('ApiService: Error al decodificar respuesta de error: $e');
      throw Exception('Error del servidor (Código: ${response.statusCode})');
    }
  }

  Future<Map<String, dynamic>> getProfile() async {
    // Nota: El _token ya fue guardado por el login
    if (_token == null) {
      throw Exception('No estás autenticado.');
    }

    final url = Uri.parse('$_baseUrl/auth/profile');
    print('ApiService: GET $url');

    http.Response response;

    try {
      response = await http.get(
        url,
        headers: {
          ..._ngrokHeaders, // Headers de Ngrok
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $_token', // <-- Envía el token
        },
      );
    } catch (e) {
      print('ApiService: Error de conexión: $e');
      throw Exception('No se pudo conectar al servidor. Revisa tu internet.');
    }

    print('ApiService: statusCode=${response.statusCode}');
    print('ApiService: response.body=${response.body}');

    if (response.statusCode < 200 || response.statusCode >= 300) {
      try {
        final errorBody = jsonDecode(response.body) as Map<String, dynamic>;
        final errorMessage = errorBody['message'] ?? 'Error desconocido';
        throw Exception(errorMessage);
      } catch (e) {
        throw Exception('Error del servidor (Código: ${response.statusCode})');
      }
    }

    return jsonDecode(response.body);
  }

  Future<Map<String, dynamic>?> getMetaActiva(DateTime selectedDate) async {
    final dateString = DateFormat('yyyy-MM-dd').format(selectedDate);
    final url = Uri.parse('$_baseUrl/metas/mi-meta-activa?fecha=$dateString');

    print('ApiService: GET $url');
    http.Response response;

    try {
      response = await http.get(
        url,
        headers: {..._ngrokHeaders, 'Content-Type': 'application/json'},
      );
    } catch (e) {
      print('ApiService: Error de conexión: $e');
      throw Exception('No se pudo conectar al servidor. Revisa tu internet.');
    }

    print('ApiService: statusCode=${response.statusCode}');
    print('ApiService: response.body=${response.body}');

    if (response.statusCode < 200 || response.statusCode >= 300) {
      try {
        final errorBody = jsonDecode(response.body) as Map<String, dynamic>;
        final errorMessage = errorBody['message'] ?? 'Error desconocido';
        throw Exception(errorMessage);
      } catch (e) {
        throw Exception('Error del servidor (Código: ${response.statusCode})');
      }
    }

    // --- LÓGICA CORREGIDA PARA ACEPTAR NULL ---
    if (response.body == 'null' || response.body.isEmpty) {
      return null; // El backend devolvió null (no hay meta)
    }
    return jsonDecode(response.body);
  }
}
