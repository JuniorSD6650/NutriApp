import 'api_service.dart';
import 'api/auth_api.dart';
import 'api/metas_api.dart';
import 'api/registros_api.dart';
import 'api/medico_api.dart';
import 'api/admin_api.dart';
import 'api/ai_api.dart';
import 'dart:ui';

class NutriAppApi {
  final ApiService _apiService = ApiService();
  
  late final AuthApi auth;
  late final MetasApi metas;
  late final RegistrosApi registros;
  late final MedicoApi medico;
  late final AdminApi admin;
  late final AiApi ai;

  NutriAppApi() {
    auth = AuthApi(_apiService);
    metas = MetasApi(_apiService);
    registros = RegistrosApi(_apiService);
    medico = MedicoApi(_apiService);
    admin = AdminApi(_apiService);
    ai = AiApi(_apiService);
  }

  void setToken(String? token) => _apiService.setToken(token);
  
  set onTokenExpired(VoidCallback? callback) {
    _apiService.onTokenExpired = callback;
  }

  Future<Map<String, dynamic>> getNutrientes({
    required int page,
    String? name,
  }) async {
    final queryParams = {
      'page': page.toString(),
      if (name != null && name.trim().isNotEmpty) 'name': name.trim(),
    };

    final uri = Uri.parse('/nutrientes').replace(queryParameters: queryParams);
    return await _apiService.get(uri.toString()) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getIngredientes({
    required int page,
    String? name,
  }) async {
    final queryParams = {
      'page': page.toString(),
      if (name != null && name.trim().isNotEmpty) 'name': name.trim(),
    };

    final uri = Uri.parse('/ingredientes').replace(queryParameters: queryParams);
    return await _apiService.get(uri.toString()) as Map<String, dynamic>;
  }
}
