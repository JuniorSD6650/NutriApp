import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import '../api_service.dart';

class RegistrosApi {
  final ApiService _apiService;

  RegistrosApi(this._apiService);

  Future<Map<String, dynamic>> getResumenDiario(DateTime selectedDate) async {
    if (_apiService.token == null) throw Exception('No estás autenticado.');
    
    final dateString = DateFormat('yyyy-MM-dd').format(selectedDate);
    final url = Uri.parse('${_apiService.baseUrl}/registros/resumen-dia?fecha=$dateString');
    print('RegistrosApi: GET $url');
    
    http.Response response;
    try {
      response = await http.get(url, headers: _apiService.headers);
    } catch (e) {
      print('RegistrosApi: Error de conexión: $e');
      throw Exception('No se pudo conectar al servidor. Revisa tu internet.');
    }

    final result = _apiService.processResponse(response);
    
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
    print('RegistrosApi: GET $url');
    
    http.Response response;
    try {
      response = await http.get(url, headers: _apiService.headers);
    } catch (e) {
      print('RegistrosApi: Error de conexión: $e');
      throw Exception('No se pudo conectar al servidor. Revisa tu internet.');
    }

    return _apiService.processResponse(response);
  }
}
