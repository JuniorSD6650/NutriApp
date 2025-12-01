import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import '../api_service.dart';

class MetasApi {
  final ApiService _apiService;

  MetasApi(this._apiService);

  Future<Map<String, dynamic>?> getMetaActiva(DateTime selectedDate) async {
    final dateString = DateFormat('yyyy-MM-dd').format(selectedDate);
    final url = Uri.parse('${_apiService.baseUrl}/metas/mi-meta-activa?fecha=$dateString');
    
    http.Response response;
    try {
      response = await http.get(url, headers: _apiService.headers);
    } catch (e) {
      throw Exception('No se pudo conectar al servidor. Revisa tu internet.');
    }

    return _apiService.processResponse(response);
  }

  Future<List<dynamic>> getTodasMisMetas() async {
    if (_apiService.token == null) throw Exception('No estás autenticado.');
    final endpoint = '/metas/mis-metas';
    final response = await _apiService.get(endpoint);
    if (response is List) return response;
    if (response is Map && response['data'] is List) return response['data'];
    return [];
  }
}