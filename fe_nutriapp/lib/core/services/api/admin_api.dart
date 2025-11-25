import 'package:fe_nutriapp/core/services/api_service.dart';

class AdminApi {
        Future<Map<String, dynamic>> getIngredienteById(String ingredienteId) async {
          final response = await _apiService.get('/ingredientes/$ingredienteId');
          return response as Map<String, dynamic>;
        }
      // Añadir nutriente a ingrediente
      Future<Map<String, dynamic>> addNutrienteToIngrediente({
        required String ingredienteId,
        required String nutrienteId,
        required double valuePer100g,
      }) async {
        final body = {
          'nutrienteId': nutrienteId,
          'value_per_100g': valuePer100g,
        };
        final response = await _apiService.post(
          '/ingredientes/$ingredienteId/nutrientes',
          body,
        );
        return response as Map<String, dynamic>;
      }

      // Eliminar nutriente de ingrediente
      Future<Map<String, dynamic>> removeNutrienteFromIngrediente({
        required String ingredienteId,
        required String nutrienteId,
      }) async {
        final response = await _apiService.delete(
          '/ingredientes/$ingredienteId/nutrientes/$nutrienteId',
        );
        return response as Map<String, dynamic>;
      }
    Future<Map<String, dynamic>> createUsuario(Map<String, dynamic> createUserDto) async {
      final response = await _apiService.post('/users', createUserDto);
      return response as Map<String, dynamic>;
    }
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

  Future<Map<String, dynamic>> updateUsuario(
    String userId,
    Map<String, dynamic> updateUserDto,
  ) async {
    final response = await _apiService.patch('/users/$userId', updateUserDto);
    return response as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getIngredientes({
    int page = 1,
    String? name,
    String? estado,
  }) async {
    final queryParams = {
      'page': page.toString(),
      if (name != null && name.trim().isNotEmpty) 'name': name.trim(),
      if (estado != null) 'estado': estado,
    };

    final uri = Uri.parse('/ingredientes').replace(queryParameters: queryParams);
    return await _apiService.get(uri.toString()) as Map<String, dynamic>;
  }

  // ✅ NUEVO: Obtener TODOS los ingredientes sin paginación
  Future<List<dynamic>> getAllIngredientes() async {
    final response =
        await _apiService.get('/ingredientes?limit=1000')
            as Map<String, dynamic>;
    return response['data'] as List<dynamic>;
  }

  Future<void> restoreUsuario(String userId) async {
    await _apiService.patch('/users/$userId/restore', {});
  }

  Future<Map<String, dynamic>> getNutrientes({
    int page = 1,
    String? name,
    String? estado,
  }) async {
    final queryParams = {
      'page': page.toString(),
      if (name != null) 'name': name,
      if (estado != null) 'estado': estado,
    };

    final uri = Uri.parse('/nutrientes').replace(queryParameters: queryParams);
    return await _apiService.get(uri.toString()) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getPlatillos({
    int page = 1,
    String? name,
    String? estado,
  }) async {
    final queryParams = {
      'page': page.toString(),
      if (name != null) 'name': name,
      if (estado != null) 'estado': estado,
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
    final response = await _apiService.post(
      '/platillos/$platilloId/ingredientes',
      body,
    );
    return response as Map<String, dynamic>;
  }

  // ✅ CORRECCIÓN: No esperar Map en el retorno
  Future<void> removeIngredienteFromPlatillo(
    String platilloId,
    String ingredienteId,
  ) async {
    await _apiService.delete(
      '/platillos/$platilloId/ingredientes/$ingredienteId',
    );
  }

  // Editar platillo
  Future<Map<String, dynamic>> updatePlatillo(String platilloId, Map<String, dynamic> updatePlatilloDto) async {
    final response = await _apiService.patch('/platillos/$platilloId', updatePlatilloDto);
    return response as Map<String, dynamic>;
  }

  // Desactivar platillo (soft delete)
  Future<void> deactivatePlatillo(String platilloId) async {
    await _apiService.delete('/platillos/$platilloId');
  }

  // Reactivar platillo
  Future<Map<String, dynamic>> restorePlatillo(String platilloId) async {
    final response = await _apiService.patch('/platillos/$platilloId/restore', {});
    return response as Map<String, dynamic>;
  }
    // Editar ingrediente
    Future<Map<String, dynamic>> updateIngrediente(String ingredienteId, Map<String, dynamic> updateIngredienteDto) async {
      final response = await _apiService.patch('/ingredientes/$ingredienteId', updateIngredienteDto);
      return response as Map<String, dynamic>;
    }

    // Desactivar ingrediente (soft delete)
    Future<void> deactivateIngrediente(String ingredienteId) async {
      await _apiService.delete('/ingredientes/$ingredienteId');
    }

    // Reactivar ingrediente
    Future<Map<String, dynamic>> restoreIngrediente(String ingredienteId) async {
      final response = await _apiService.patch('/ingredientes/$ingredienteId/restore', {});
      return response as Map<String, dynamic>;
    }

    // Editar nutriente
    Future<Map<String, dynamic>> updateNutriente(String nutrienteId, Map<String, dynamic> updateNutrienteDto) async {
      final response = await _apiService.patch('/nutrientes/$nutrienteId', updateNutrienteDto);
      return response as Map<String, dynamic>;
    }

    // Desactivar nutriente (soft delete)
    Future<void> deactivateNutriente(String nutrienteId) async {
      await _apiService.delete('/nutrientes/$nutrienteId');
    }

    // Reactivar nutriente
    Future<Map<String, dynamic>> restoreNutriente(String nutrienteId) async {
      final response = await _apiService.patch('/nutrientes/$nutrienteId/restore', {});
      return response as Map<String, dynamic>;
    }
}
