import 'package:http/http.dart' as http;
import '../api_service.dart';

class MedicoApi {
    Future<List<dynamic>> getMetasPaciente(String pacienteId) async {
      if (_apiService.token == null) throw Exception('No estás autenticado.');
      final endpoint = '/metas/paciente/$pacienteId';
      final response = await _apiService.get(endpoint);
      if (response is List) return response;
      if (response is Map && response['data'] is List) return response['data'];
      return [];
    }
  final ApiService _apiService;

  MedicoApi(this._apiService);

  Future<List<dynamic>> getMisPacientes(String medicoId) async {
    if (_apiService.token == null) throw Exception('No estás autenticado.');
    
    final url = Uri.parse('${_apiService.baseUrl}/profiles/medicos/$medicoId/pacientes');
    
    http.Response response;
    try {
      response = await http.get(url, headers: _apiService.headers);
    } catch (e) {
      throw Exception('No se pudo conectar al servidor. Revisa tu internet.');
    }

    final result = _apiService.processResponse(response);
    
    // Si el resultado es null o no es una lista, devolver lista vacía
    if (result == null || result is! List) {
      return [];
    }

    return result;
  }

  Future<Map<String, dynamic>> getEstadisticas(String medicoId) async {
    if (_apiService.token == null) throw Exception('No estás autenticado.');
    
    final url = Uri.parse('${_apiService.baseUrl}/profiles/medicos/$medicoId/estadisticas');
    
    http.Response response;
    try {
      response = await http.get(url, headers: _apiService.headers);
    } catch (e) {
      throw Exception('No se pudo conectar al servidor. Revisa tu internet.');
    }

    return _apiService.processResponse(response) as Map<String, dynamic>;
  }
}
