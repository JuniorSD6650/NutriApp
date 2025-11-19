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
      if (name != null) 'name': name,
    };

    final uri = Uri.parse('/ingredientes').replace(queryParameters: queryParams);
    return await _apiService.get(uri.toString()) as Map<String, dynamic>;
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
}
