// lib/core/services/api_service.dart
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:intl/intl.dart';
import 'dart:ui'; // Para VoidCallback

class ApiService {
  
  final Map<String, String> _ngrokHeaders = {
    'ngrok-skip-browser-warning': 'true',
  };

  final String _baseUrl = "https://49dfc2a2f4e9.ngrok-free.app"; // Tu URL

  String? _token;
  
  // 1. AÑADIDO: "Botón de emergencia" que el AuthService "conectará"
  VoidCallback? onTokenExpired; 

  void setToken(String? token) {
    _token = token;
    if (_token != null) {
      _ngrokHeaders['Authorization'] = 'Bearer $_token';
    } else {
      _ngrokHeaders.remove('Authorization');
    }
  }

  // --- 2. NUEVO HELPER CENTRALIZADO PARA PROCESAR RESPUESTAS ---
  dynamic _processResponse(http.Response response) {
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
    
    // NUEVO: Validar que el body no esté vacío en respuestas 200
    if (response.body.isEmpty || response.body.trim() == '') {
      print('ApiService: Body vacío detectado con statusCode 200. Token probablemente inválido.');
      onTokenExpired?.call(); // Forzar logout
      throw Exception('Sesión inválida. Por favor, inicia sesión nuevamente.');
    }

    // Si la respuesta es exitosa pero nula (como en metas)
    if (response.body == 'null') {
      return null;
    }

    // Si la respuesta es exitosa y tiene JSON
    return jsonDecode(response.body);
  }

  // --- LOGIN (Maneja el 401 de forma DIFERENTE) ---
  Future<Map<String, dynamic>> login(String email, String password) async {
    final url = Uri.parse('$_baseUrl/auth/login');
    http.Response response;

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

    // 401 en LOGIN significa "Credenciales incorrectas", NO "Token expirado"
    if (response.statusCode == 401) {
      // Intenta leer el mensaje de error de NestJS
      try {
         final errorBody = jsonDecode(response.body) as Map<String, dynamic>;
         throw Exception(errorBody['message'] ?? 'Credenciales incorrectas');
      } catch (e) {
        throw Exception('Credenciales incorrectas');
      }
    }

    // Pasa al helper para manejar el éxito (200) u otros errores (500)
    return _processResponse(response);
  }

  // --- GET PROFILE (Usa el helper) ---
  Future<Map<String, dynamic>> getProfile() async {
    if (_token == null) throw Exception('No estás autenticado.');
    
    final url = Uri.parse('$_baseUrl/auth/profile');
    print('ApiService: GET $url');
    http.Response response;

    try {
      response = await http.get(
        url,
        headers: {
          ..._ngrokHeaders,
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $_token',
        },
      );
    } catch (e) {
      print('ApiService: Error de conexión: $e');
      throw Exception('No se pudo conectar al servidor. Revisa tu internet.');
    }

    // Pasa la respuesta al helper para que maneje 401, 200, etc.
    return _processResponse(response);
  }

  // --- GET META ACTIVA (Usa el helper) ---
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

    // Pasa la respuesta al helper para que maneje 401, 200, null, etc.
    return _processResponse(response);
  }

  // --- NUEVO: Obtener resumen diario detallado
  Future<Map<String, dynamic>> getResumenDiario(DateTime selectedDate) async {
    if (_token == null) throw Exception('No estás autenticado.');
    
    final dateString = DateFormat('yyyy-MM-dd').format(selectedDate);
    final url = Uri.parse('$_baseUrl/registros/resumen-dia?fecha=$dateString');
    print('ApiService: GET $url');
    http.Response response;

    try {
      response = await http.get(
        url,
        headers: {
          ..._ngrokHeaders,
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $_token',
        },
      );
    } catch (e) {
      print('ApiService: Error de conexión: $e');
      throw Exception('No se pudo conectar al servidor. Revisa tu internet.');
    }

    final result = _processResponse(response);
    
    // VALIDACIÓN: Si result es null, retornar estructura por defecto
    if (result == null) {
      return {
        'fecha': dateString,
        'totalRegistros': 0,
        'totalHierro': 0.0,
        'totalCalorias': 0.0,
        'registrosPorTipo': {
          'desayuno': [],
          'almuerzo': [],
          'cena': [],
          'snack': [],
        },
      };
    }

    return result as Map<String, dynamic>;
  }

  // --- CAMBIAR CONTRASEÑA ---
  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    if (_token == null) throw Exception('No estás autenticado.');

    final url = Uri.parse('$_baseUrl/auth/change-password');
    http.Response response;

    try {
      response = await http.patch(
        url,
        headers: {
          ..._ngrokHeaders,
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $_token',
        },
        body: jsonEncode({
          'currentPassword': currentPassword,
          'newPassword': newPassword,
        }),
      );
    } catch (e) {
      print('ApiService: Error de conexión: $e');
      throw Exception('No se pudo conectar al servidor. Revisa tu internet.');
    }

    _processResponse(response); // Lanza excepción si hay error, no retorna nada si éxito
  }
}