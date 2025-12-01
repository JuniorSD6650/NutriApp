import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import '../api_service.dart';

class RegistrosApi {
    Future<List<dynamic>> getRegistrosConsumoPaciente(String pacienteId, {int limit = 5}) async {
      if (_apiService.token == null) throw Exception('No estás autenticado.');
      final endpoint = '/registros/consumo/paciente/$pacienteId?limit=$limit';
      final response = await _apiService.get(endpoint);
      if (response is List) return response;
      if (response is Map && response['data'] is List) return response['data'];
      return [];
    }
  final ApiService _apiService;

  RegistrosApi(this._apiService);

  Future<Map<String, dynamic>> getResumenDiario(DateTime selectedDate) async {
    if (_apiService.token == null) throw Exception('No estás autenticado.');
    
    final dateString = DateFormat('yyyy-MM-dd').format(selectedDate);
    final url = Uri.parse('${_apiService.baseUrl}/registros/resumen-dia?fecha=$dateString');
    
    http.Response response;
    try {
      response = await http.get(url, headers: _apiService.headers);
    } catch (e) {
      throw Exception('No se pudo conectar al servidor. Revisa tu internet.');
    }

    final result = _apiService.processResponse(response);
    
    if (result == null) {
      return {
        'fecha': dateString,
        'totalRegistros': 0,
        'totalHierro': 0.0,
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

  Future<Map<String, dynamic>> getEstadisticasNutrientes({
    String? fechaInicio,
    String? fechaFin,
  }) async {
    if (_apiService.token == null) throw Exception('No estás autenticado.');
    
    final queryParams = <String, String>{};
    if (fechaInicio != null) queryParams['fechaInicio'] = fechaInicio;
    if (fechaFin != null) queryParams['fechaFin'] = fechaFin;
    
    final url = Uri.parse('${_apiService.baseUrl}/registros/estadisticas-nutrientes')
        .replace(queryParameters: queryParams);
    
    http.Response response;
    try {
      response = await http.get(url, headers: _apiService.headers);
    } catch (e) {
      throw Exception('No se pudo conectar al servidor. Revisa tu internet.');
    }

    return _apiService.processResponse(response);
  }
}
