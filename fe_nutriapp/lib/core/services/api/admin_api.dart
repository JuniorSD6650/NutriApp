import 'package:fe_nutriapp/core/services/api_service.dart';

class AdminApi {
  final ApiService _apiService;

  AdminApi(this._apiService);

  Future<Map<String, dynamic>> getUsuarios({
    int page = 1,
    String? role,
    String? name,
  }) async {
    final queryParams = {
      'page': page.toString(),
      if (role != null) 'role': role,
      if (name != null) 'name': name,
    };

    final uri = Uri.parse('/users').replace(queryParameters: queryParams);
    return await _apiService.get(uri.toString()) as Map<String, dynamic>;
  }

  Future<void> deleteUsuario(String userId) async {
    await _apiService.delete('/users/$userId');
  }

  Future<Map<String, dynamic>> getIngredientes({
    int page = 1,
    String? name,
  }) async {
    final queryParams = {
      'page': page.toString(),
      if (name != null && name.trim().isNotEmpty) 'name': name.trim(),
    };

    final uri = Uri.parse('/ingredientes').replace(queryParameters: queryParams);
    return await _apiService.get(uri.toString()) as Map<String, dynamic>;
  }

  // ✅ NUEVO: Obtener TODOS los ingredientes sin paginación
  Future<List<dynamic>> getAllIngredientes() async {
    final response = await _apiService.get('/ingredientes?limit=1000') as Map<String, dynamic>;
    return response['data'] as List<dynamic>;
  }

  Future<Map<String, dynamic>> getNutrientes({
    int page = 1,
    String? name,
  }) async {
    final queryParams = {
      'page': page.toString(),
      if (name != null) 'name': name,
    };

    final uri = Uri.parse('/nutrientes').replace(queryParameters: queryParams);
    return await _apiService.get(uri.toString()) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getPlatillos({
    int page = 1,
    String? name,
  }) async {
    final queryParams = {
      'page': page.toString(),
      if (name != null) 'name': name,
    };

    final uri = Uri.parse('/platillos').replace(queryParameters: queryParams);
    return await _apiService.get(uri.toString()) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getPlatilloById(String platilloId) async {
    final response = await _apiService.get('/platillos/$platilloId');
    return response as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> addIngredienteToPlatillo(
    String platilloId,
    String ingredienteId,
    double cantidad,
    String unidad,
  ) async {
    final body = {
      'ingredienteId': ingredienteId,
      'cantidad': cantidad,
      'unidad': unidad,
    };
    final response = await _apiService.post('/platillos/$platilloId/ingredientes', body);
    return response as Map<String, dynamic>;
  }

  // ✅ CORRECCIÓN: No esperar Map en el retorno
  Future<void> removeIngredienteFromPlatillo(
    String platilloId,
    String ingredienteId,
  ) async {
    await _apiService.delete('/platillos/$platilloId/ingredientes/$ingredienteId');
  }
}
