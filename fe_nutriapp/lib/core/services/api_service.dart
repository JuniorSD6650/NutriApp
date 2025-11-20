// lib/core/services/api_service.dart
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:ui';

class ApiService {
  final String baseUrl = "https://20535e1bb5e0.ngrok-free.app";
  
  final Map<String, String> _ngrokHeaders = {
    'ngrok-skip-browser-warning': 'true',
  };

  String? _token;
  VoidCallback? onTokenExpired;

  void setToken(String? token) {
    _token = token;
    if (_token != null) {
      _ngrokHeaders['Authorization'] = 'Bearer $_token';
    } else {
      _ngrokHeaders.remove('Authorization');
    }
  }

  String? get token => _token;

  Map<String, String> get headers => {
    ..._ngrokHeaders,
    'Content-Type': 'application/json',
  };

  // Método genérico para procesar respuestas
  dynamic processResponse(http.Response response) {
    print('ApiService: statusCode=${response.statusCode}');
    print('ApiService: response.body=${response.body}');

    if (response.statusCode == 401) {
      print('ApiService: 401 Detectado. Ejecutando logout automático.');
      onTokenExpired?.call();
      throw Exception('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
    }

    // ✅ AÑADIR: También hacer logout en caso de 404 con mensaje específico
    if (response.statusCode == 404) {
      try {
        final errorBody = jsonDecode(response.body) as Map<String, dynamic>;
        final message = errorBody['message'] ?? '';
        
        if (message.toString().contains('no encontrado') || 
            message.toString().contains('not found')) {
          print('ApiService: Usuario no encontrado en BD. Ejecutando logout automático.');
          onTokenExpired?.call();
          throw Exception('Tu cuenta ya no existe. Por favor, contacta al administrador.');
        }
      } catch (e) {
        if (e.toString().contains('Exception:')) rethrow;
      }
    }

    if (response.statusCode < 200 || response.statusCode >= 300) {
      try {
        final errorBody = jsonDecode(response.body) as Map<String, dynamic>;
        final dynamic messageField = errorBody['message'];
        String errorMessage;
        if (messageField is String) {
          errorMessage = messageField;
        } else if (messageField is List && messageField.isNotEmpty) {
          errorMessage = messageField.first.toString();
        } else {
          errorMessage = errorBody['error'] ?? 'Error desconocido';
        }
        throw Exception(errorMessage);
      } catch (e) {
        if (e.toString().contains('Exception:')) rethrow;
        throw Exception('Error del servidor (Código: ${response.statusCode})');
      }
    }

    if (response.body.isEmpty || response.body.trim() == '') {
      print('ApiService: Body vacío detectado con statusCode 200.');
      onTokenExpired?.call();
      throw Exception('Sesión inválida. Por favor, inicia sesión nuevamente.');
    }

    if (response.body == 'null') {
      return null;
    }

    return jsonDecode(response.body);
  }

  // ✅ Método GET
  Future<dynamic> get(String endpoint) async {
    final response = await http.get(Uri.parse('$baseUrl$endpoint'), headers: headers);
    return processResponse(response);
  }

  // ✅ Método DELETE
  Future<void> delete(String endpoint) async {
    final response = await http.delete(Uri.parse('$baseUrl$endpoint'), headers: headers);
    processResponse(response);
  }
}