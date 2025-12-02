import '../api_service.dart';

class AiApi {
  final ApiService _apiService;

  AiApi(this._apiService);

  /// Reconocer platillo usando IA
  /// [imageBase64] - Imagen en base64
  /// [description] - Descripción de texto (alternativa a imagen)
  /// [mealType] - Tipo de comida: Desayuno, Almuerzo, Cena, Snack
  Future<Map<String, dynamic>> recognizeDish({
    String? imageBase64,
    String? description,
    required String mealType,
  }) async {
    if (imageBase64 == null && description == null) {
      throw Exception('Se requiere imagen o descripción');
    }

    final body = {
      'mealType': mealType,
      if (imageBase64 != null) 'imageBase64': imageBase64,
      if (description != null) 'description': description,
    };

    final response = await _apiService.post('/ai/recognize-dish', body);
    return response as Map<String, dynamic>;
  }

  /// Obtener estadísticas de uso de IA (solo admin)
  Future<Map<String, dynamic>> getUsageStats() async {
    final response = await _apiService.get('/ai/usage-stats');
    return response as Map<String, dynamic>;
  }
}
