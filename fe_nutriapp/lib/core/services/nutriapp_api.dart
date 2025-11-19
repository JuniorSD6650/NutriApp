import 'api_service.dart';
import 'api/auth_api.dart';
import 'api/metas_api.dart';
import 'api/registros_api.dart';
import 'api/medico_api.dart';
import 'api/admin_api.dart'; // <-- AÑADIR IMPORT
import 'dart:ui';

class NutriAppApi {
  final ApiService _apiService = ApiService();
  
  late final AuthApi auth;
  late final MetasApi metas;
  late final RegistrosApi registros;
  late final MedicoApi medico;
  late final AdminApi admin; // <-- AÑADIR ADMIN API

  NutriAppApi() {
    auth = AuthApi(_apiService);
    metas = MetasApi(_apiService);
    registros = RegistrosApi(_apiService);
    medico = MedicoApi(_apiService);
    admin = AdminApi(_apiService); // <-- INICIALIZAR ADMIN API
  }

  void setToken(String? token) => _apiService.setToken(token);
  
  set onTokenExpired(VoidCallback? callback) {
    _apiService.onTokenExpired = callback;
  }
}
