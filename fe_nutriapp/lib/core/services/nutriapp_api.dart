import 'api_service.dart';
import 'api/auth_api.dart';
import 'api/metas_api.dart';
import 'api/registros_api.dart';
import 'api/medico_api.dart';
import 'dart:ui';

class NutriAppApi {
  final ApiService _apiService = ApiService();
  
  late final AuthApi auth;
  late final MetasApi metas;
  late final RegistrosApi registros;
  late final MedicoApi medico;

  NutriAppApi() {
    auth = AuthApi(_apiService);
    metas = MetasApi(_apiService);
    registros = RegistrosApi(_apiService);
    medico = MedicoApi(_apiService);
  }

  void setToken(String? token) => _apiService.setToken(token);
  
  set onTokenExpired(VoidCallback? callback) {
    _apiService.onTokenExpired = callback;
  }
}
