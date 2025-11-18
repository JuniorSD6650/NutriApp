// lib/core/services/api_service.dart
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:ui';

class ApiService {
  final String baseUrl = "https://617254a2d300.ngrok-free.app";
  
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
}