import 'dart:io';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import 'package:permission_handler/permission_handler.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import 'package:fe_nutriapp/core/services/nutriapp_api.dart';
import 'package:fe_nutriapp/core/theme/app_colors.dart';

// PANTALLA PRINCIPAL
class AddMealScreen extends StatefulWidget {
  const AddMealScreen({super.key});

  @override
  State<AddMealScreen> createState() => _AddMealScreenState();
}

class _AddMealScreenState extends State<AddMealScreen> {
  String _selectedMealType = 'Desayuno';
  int _selectedModeIndex = 0;
  final List<String> _modes = ['Foto', 'Describir'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // VISTA DEL MODO SELECCIONADO (PANTALLA COMPLETA)
          _selectedModeIndex == 0 
            ? MealCameraView(mealType: _selectedMealType)
            : MealDescribeView(mealType: _selectedMealType),
          
          // CONTROLES SUPERPUESTOS
          SafeArea(
            child: Column(
              children: [
                _buildTopBar(),
                const Spacer(),
                _buildModeSelector(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTopBar() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          GestureDetector(
            onTap: () => Navigator.pop(context),
            child: CircleAvatar(
              backgroundColor: Colors.black.withOpacity(0.5),
              child: const Icon(Icons.close, color: Colors.white),
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.black.withOpacity(0.5),
              borderRadius: BorderRadius.circular(30),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: _selectedMealType,
                dropdownColor: Colors.grey[900],
                icon: const Icon(Icons.keyboard_arrow_down, color: Colors.white),
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                onChanged: (value) => setState(() => _selectedMealType = value!),
                items: ['Desayuno', 'Almuerzo', 'Cena', 'Snack'] // <-- CAMBIO: 4 opciones
                    .map((e) => DropdownMenuItem(value: e, child: Text(e)))
                    .toList(),
              ),
            ),
          ),
          const SizedBox(width: 44),
        ],
      ),
    );
  }

  Widget _buildModeSelector() {
    return Container(
      margin: const EdgeInsets.all(20),
      padding: const EdgeInsets.all(5),
      height: 50,
      decoration: BoxDecoration(
        color: Colors.black.withOpacity(0.6),
        borderRadius: BorderRadius.circular(30),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: List.generate(_modes.length, (index) {
          final isSelected = _selectedModeIndex == index;
          return Expanded(
            child: GestureDetector(
              onTap: () => setState(() => _selectedModeIndex = index),
              child: Container(
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: isSelected ? Colors.white : Colors.transparent,
                  borderRadius: BorderRadius.circular(25),
                ),
                child: Text(
                  _modes[index],
                  style: TextStyle(
                    color: isSelected ? Colors.black : Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                  ),
                ),
              ),
            ),
          );
        }),
      ),
    );
  }
}

// ====== VISTA DE CÁMARA (PANTALLA COMPLETA) ======
class MealCameraView extends StatefulWidget {
  final String mealType;
  const MealCameraView({super.key, required this.mealType});

  @override
  State<MealCameraView> createState() => _MealCameraViewState();
}

class _MealCameraViewState extends State<MealCameraView> {
  CameraController? _cameraController;
  List<CameraDescription>? _cameras;
  bool _isInitialized = false;
  final ImagePicker _imagePicker = ImagePicker();

  @override
  void initState() {
    super.initState();
    _initializeCamera();
  }

  Future<void> _initializeCamera() async {
    final status = await Permission.camera.request();
    if (!status.isGranted) return;

    _cameras = await availableCameras();
    if (_cameras!.isEmpty) return;

    _cameraController = CameraController(_cameras![0], ResolutionPreset.high);
    await _cameraController!.initialize();
    if (mounted) {
      setState(() => _isInitialized = true);
    }
  }

  Future<void> _takePicture() async {
    if (_cameraController == null || !_cameraController!.value.isInitialized) return;
    
    try {
      final image = await _cameraController!.takePicture();
      print('📸 Foto tomada: ${image.path}');
      // Navegar a vista de preview
      if (mounted) {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => MealPreviewScreen(
              imagePath: image.path,
              mealType: widget.mealType,
            ),
          ),
        );
      }
    } catch (e) {
      print('Error al tomar foto: $e');
    }
  }

  Future<void> _pickFromGallery() async {
    final XFile? image = await _imagePicker.pickImage(source: ImageSource.gallery);
    if (image != null) {
      print('🖼️ Imagen seleccionada: ${image.path}');
      // Navegar a vista de preview
      if (mounted) {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => MealPreviewScreen(
              imagePath: image.path,
              mealType: widget.mealType,
            ),
          ),
        );
      }
    }
  }

  @override
  void dispose() {
    _cameraController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!_isInitialized) {
      return Container(
        color: Colors.black,
        child: const Center(child: CircularProgressIndicator(color: Colors.white)),
      );
    }

    return Stack(
      children: [
        // CÁMARA EN PANTALLA COMPLETA
        SizedBox.expand(
          child: FittedBox(
            fit: BoxFit.cover,
            child: SizedBox(
              width: _cameraController!.value.previewSize!.height,
              height: _cameraController!.value.previewSize!.width,
              child: CameraPreview(_cameraController!),
            ),
          ),
        ),

        // CUADRO GUÍA CENTRAL (SOLO LAS ESQUINAS)
        Center(
          child: SizedBox(
            width: 280,
            height: 280,
            child: CustomPaint(
              painter: CornerBracketsPainter(),
            ),
          ),
        ),
        
        // CONTROLES INFERIORES (MÁS ARRIBA)
        Positioned(
          bottom: 120, // <-- CAMBIO: de 30 a 120 para subirlos
          left: 0,
          right: 0,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 40.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // Botón Galería
                GestureDetector(
                  onTap: _pickFromGallery,
                  child: Container(
                    width: 50,
                    height: 50,
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.5),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.photo_library_outlined, color: Colors.white, size: 28),
                  ),
                ),

                // Botón Disparador (Grande)
                GestureDetector(
                  onTap: _takePicture,
                  child: Container(
                    height: 75,
                    width: 75,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white, width: 4),
                      color: Colors.transparent,
                    ),
                    child: Center(
                      child: Container(
                        height: 60,
                        width: 60,
                        decoration: const BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
                        ),
                      ),
                    ),
                  ),
                ),

                // Espacio vacío (para balance visual)
                const SizedBox(width: 50, height: 50),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

// PAINTER PARA LAS ESQUINAS DEL CUADRO GUÍA
class CornerBracketsPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withOpacity(0.9)
      ..strokeWidth = 4
      ..style = PaintingStyle.stroke;

    const cornerLength = 30.0;

    // Esquina superior izquierda
    canvas.drawLine(const Offset(0, 0), const Offset(cornerLength, 0), paint);
    canvas.drawLine(const Offset(0, 0), const Offset(0, cornerLength), paint);

    // Esquina superior derecha
    canvas.drawLine(Offset(size.width, 0), Offset(size.width - cornerLength, 0), paint);
    canvas.drawLine(Offset(size.width, 0), Offset(size.width, cornerLength), paint);

    // Esquina inferior izquierda
    canvas.drawLine(Offset(0, size.height), Offset(cornerLength, size.height), paint);
    canvas.drawLine(Offset(0, size.height), Offset(0, size.height - cornerLength), paint);

    // Esquina inferior derecha
    canvas.drawLine(Offset(size.width, size.height), Offset(size.width - cornerLength, size.height), paint);
    canvas.drawLine(Offset(size.width, size.height), Offset(size.width, size.height - cornerLength), paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// ====== VISTA DE DESCRIPCIÓN ======
class MealDescribeView extends StatefulWidget {
  final String mealType;
  const MealDescribeView({super.key, required this.mealType});

  @override
  State<MealDescribeView> createState() => _MealDescribeViewState();
}

class _MealDescribeViewState extends State<MealDescribeView> {
  final TextEditingController _textController = TextEditingController();
  final stt.SpeechToText _speech = stt.SpeechToText();
  bool _isListening = false;

  @override
  void dispose() {
    _textController.dispose();
    super.dispose();
  }

  Future<void> _toggleListening() async {
    if (_isListening) {
      await _speech.stop();
      setState(() => _isListening = false);
    } else {
      final available = await _speech.initialize();
      if (available) {
        setState(() => _isListening = true);
        _speech.listen(
          onResult: (result) {
            setState(() {
              _textController.text = result.recognizedWords;
            });
          },
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.grey[900],
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 80),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Expanded(
            child: Center(
              child: TextField(
                controller: _textController,
                maxLines: null,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: Colors.white, 
                  fontSize: 18,
                  height: 1.5,
                ),
                decoration: const InputDecoration(
                  hintText: 'Describe qué comiste...',
                  hintStyle: TextStyle(color: Colors.white54),
                  border: InputBorder.none,
                  contentPadding: EdgeInsets.symmetric(horizontal: 20),
                ),
              ),
            ),
          ),
          const SizedBox(height: 40),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              ElevatedButton.icon(
                onPressed: _toggleListening,
                icon: Icon(_isListening ? Icons.stop : Icons.mic),
                label: Text(_isListening ? 'Detener' : 'Hablar'),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                ),
              ),
              ElevatedButton(
                onPressed: () {
                  if (_textController.text.trim().isEmpty) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Por favor describe qué comiste')),
                    );
                    return;
                  }
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => MealPreviewScreen(
                        description: _textController.text.trim(),
                        mealType: widget.mealType,
                      ),
                    ),
                  );
                },
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
                ),
                child: const Text('Continuar'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ====== VISTA DE PREVIEW (CONFIRMAR ANTES DE ENVIAR) ======
class MealPreviewScreen extends StatelessWidget {
  final String? imagePath;
  final String? description;
  final String mealType;

  const MealPreviewScreen({
    super.key,
    this.imagePath,
    this.description,
    required this.mealType,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? Colors.grey[900] : Colors.white,
      appBar: AppBar(
        title: Text('Confirmar $mealType'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
      ),
      body: Column(
        children: [
          Expanded(
            child: Center(
              child: imagePath != null
                  ? Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(16),
                        child: Image.file(
                          File(imagePath!),
                          fit: BoxFit.contain,
                        ),
                      ),
                    )
                  : Padding(
                      padding: const EdgeInsets.all(32.0),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.restaurant_menu,
                            size: 80,
                            color: AppColors.primary,
                          ),
                          const SizedBox(height: 24),
                          Text(
                            description ?? '',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 18,
                              height: 1.5,
                              color: isDark ? Colors.white : Colors.black87,
                            ),
                          ),
                        ],
                      ),
                    ),
            ),
          ),
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: isDark ? Colors.grey[850] : Colors.grey[100],
              borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
            ),
            child: SafeArea(
              child: Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.pop(context),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        side: BorderSide(color: AppColors.primary),
                      ),
                      child: const Text('Cancelar', style: TextStyle(fontSize: 16)),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        // Navegar a la vista de procesamiento
                        Navigator.pushReplacement(
                          context,
                          MaterialPageRoute(
                            builder: (context) => MealProcessingScreen(
                              imagePath: imagePath,
                              description: description,
                              mealType: mealType,
                            ),
                          ),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                      child: const Text('Enviar', style: TextStyle(fontSize: 16)),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ====== VISTA DE PROCESAMIENTO (MOSTRAR PROMPT Y LOADER) ======
class MealProcessingScreen extends StatefulWidget {
  final String? imagePath;
  final String? description;
  final String mealType;

  const MealProcessingScreen({
    super.key,
    this.imagePath,
    this.description,
    required this.mealType,
  });

  @override
  State<MealProcessingScreen> createState() => _MealProcessingScreenState();
}

class _MealProcessingScreenState extends State<MealProcessingScreen> {
  String _generatedPrompt = '';
  String _aiResponse = '';
  bool _isLoading = true;
  bool _isProcessingAI = false;
  String _statusMessage = 'Cargando catálogo de platillos...';

  @override
  void initState() {
    super.initState();
    _loadPlatillosAndGeneratePrompt();
  }

  Future<void> _loadPlatillosAndGeneratePrompt() async {
    try {
      setState(() {
        _isLoading = true;
        _statusMessage = 'Cargando catálogo de platillos...';
      });
      
      print('🤖 Generando prompt de IA...');
      
      // 1. Obtener todos los platillos del backend (sin límite)
      final api = context.read<NutriAppApi>();
      final response = await api.admin.getPlatillos(
        estado: 'activo',
        page: 1,
      );
      
      // Obtener TODOS sin importar la paginación
      final totalPages = response['totalPages'] as int;
      List<dynamic> platillos = response['data'] as List<dynamic>;
      
      // Si hay más páginas, obtener todas
      if (totalPages > 1) {
        for (int i = 2; i <= totalPages; i++) {
          final nextPage = await api.admin.getPlatillos(
            estado: 'activo',
            page: i,
          );
          platillos.addAll(nextPage['data'] as List<dynamic>);
        }
      }
      
      // 2. Formatear la lista de platillos con numeración
      final platillosString = platillos.asMap().entries.map((entry) {
        final index = entry.key + 1;
        final platillo = entry.value;
        return '$index. ${platillo['nombre']}';
      }).join('\n');
      
      // 3. Determinar el tipo de entrada (imagen o descripción)
      final bool isImage = widget.imagePath != null;
      final String inputType = isImage ? 'imagen' : 'descripción de texto';
      final String inputContext = isImage 
          ? 'Analiza cuidadosamente la imagen adjunta. Si ves comida real, identifica los alimentos. Si la imagen está vacía, borrosa, o no muestra comida, responde "NINGUNO".'
          : 'Analiza la siguiente descripción: "${widget.description}"';
      
      // 4. Construir el prompt MEJORADO contra falsos positivos
      final prompt = '''
TAREA: Identificar platillo exacto de un catálogo basándose en ${isImage ? 'una imagen' : 'una descripción textual'}.

⚠️ REGLAS ESTRICTAS DE VALIDACIÓN:
- Si la imagen NO muestra comida clara y reconocible → responde "NINGUNO"
- Si la imagen está vacía, borrosa o es irrelevante → responde "NINGUNO"
- Si la descripción es vaga o no describe comida específica → responde "NINGUNO"
- Si ningún platillo del catálogo coincide razonablemente (>50% similitud) → responde "NINGUNO"
- Solo responde con un platillo si estás SEGURO de la coincidencia

CONTEXTO:
- Tipo de comida esperada: ${widget.mealType}
- Método de entrada: $inputType
- Total de platillos en catálogo: ${platillos.length}

INSTRUCCIONES:
1. $inputContext
2. Si identificas comida real, compárala con el catálogo de platillos disponibles.
3. Verifica que el tipo de comida coincida con "${widget.mealType}".
4. Selecciona ÚNICAMENTE el platillo que mejor coincida (>80% seguridad).
5. Si tienes CUALQUIER duda, es mejor responder "NINGUNO".

CATÁLOGO DE PLATILLOS DISPONIBLES:
$platillosString

FORMATO DE RESPUESTA REQUERIDO:
Responde EXACTAMENTE en uno de estos dos formatos:

Si hay coincidencia segura:
"[NÚMERO]. [NOMBRE_PLATILLO]"
Ejemplo: "15. Ensalada César"

Si NO hay coincidencia o cualquier duda:
"NINGUNO - [razón breve]"
Ejemplo: "NINGUNO - La imagen no muestra comida claramente"
''';
      
      print('✅ PROMPT GENERADO:');
      print('=' * 60);
      print(prompt);
      print('=' * 60);
      print('📊 Estadísticas:');
      print('   - Total platillos: ${platillos.length}');
      print('   - Tipo entrada: $inputType');
      print('   - Longitud prompt: ${prompt.length} caracteres');
      
      setState(() {
        _generatedPrompt = prompt;
        _isLoading = false;
      });
      
    } catch (e) {
      print('❌ Error generando prompt: $e');
      setState(() {
        _generatedPrompt = 'Error: $e';
        _isLoading = false;
        _statusMessage = 'Error al generar prompt';
      });
    }
  }

  Future<void> _sendToBackendAI() async {
    try {
      setState(() {
        _isProcessingAI = true;
        _statusMessage = 'Enviando al servidor...';
      });

      print('🚀 Enviando a backend AI...');

      final api = context.read<NutriAppApi>();
      
      // Preparar la request según el tipo de entrada
      Map<String, dynamic> requestData = {
        'mealType': widget.mealType,
      };

      // Si es imagen, convertir a base64
      if (widget.imagePath != null) {
        final imageFile = File(widget.imagePath!);
        final imageBytes = await imageFile.readAsBytes();
        final base64Image = base64Encode(imageBytes);
        requestData['imageBase64'] = base64Image;
      } else if (widget.description != null) {
        // Si es descripción de texto
        requestData['description'] = widget.description;
      }

      // Llamar al endpoint del backend
      final response = await api.ai.recognizeDish(
        imageBase64: requestData['imageBase64'],
        description: requestData['description'],
        mealType: requestData['mealType'],
      );

      print('✅ Respuesta del backend:');
      print(response);

      // Formatear la respuesta para mostrar
      final bool success = response['success'] ?? false;
      final String aiAnswer = response['aiResponse'] ?? '';
      final Map<String, dynamic>? recognizedPlatillo = response['recognizedPlatillo'];
      
      // Manejar confidence que puede ser double, int, string o null
      final dynamic confidenceRaw = response['confidence'];
      double? confidence;
      if (confidenceRaw is num) {
        confidence = confidenceRaw.toDouble();
      } else if (confidenceRaw is String && confidenceRaw != 'unknown') {
        confidence = double.tryParse(confidenceRaw);
      }

      String displayText = '';
      if (success && recognizedPlatillo != null) {
        displayText = '✅ Platillo reconocido:\n\n${recognizedPlatillo['nombre']}\n\n';
        if (confidence != null && confidence > 0) {
          displayText += '📊 Nivel de confianza: ${(confidence * 100).toStringAsFixed(0)}%';
        } else {
          displayText += '📊 Nivel de confianza: Alto';
        }
      } else {
        displayText = '❌ No se pudo identificar el platillo\n\n$aiAnswer';
      }

      setState(() {
        _aiResponse = displayText;
        _isProcessingAI = false;
        _statusMessage = 'Completado';
      });

    } catch (e) {
      print('❌ Error en backend AI: $e');
      setState(() {
        _aiResponse = 'ERROR: $e';
        _isProcessingAI = false;
        _statusMessage = 'Error al procesar';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? Colors.grey[900] : Colors.white,
      appBar: AppBar(
        title: const Text('Procesando...'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        automaticallyImplyLeading: false,
      ),
      body: _isLoading || _isProcessingAI
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(color: AppColors.primary),
                  const SizedBox(height: 24),
                  Text(
                    _statusMessage,
                    style: TextStyle(
                      fontSize: 16,
                      color: isDark ? Colors.white70 : Colors.black54,
                    ),
                  ),
                ],
              ),
            )
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Mostrar imagen o descripción
                  if (widget.imagePath != null)
                    ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: Image.file(
                        File(widget.imagePath!),
                        height: 200,
                        fit: BoxFit.cover,
                      ),
                    )
                  else if (widget.description != null)
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        widget.description!,
                        style: TextStyle(
                          fontSize: 16,
                          height: 1.5,
                          color: isDark ? Colors.white : Colors.black87,
                        ),
                      ),
                    ),
                  
                  const SizedBox(height: 24),
                  
                  // Título del prompt
                  Text(
                    'Prompt Generado para IA:',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: isDark ? Colors.white : Colors.black87,
                    ),
                  ),
                  
                  const SizedBox(height: 12),
                  
                  // Mostrar el prompt generado
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: isDark ? Colors.grey[850] : Colors.grey[100],
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: AppColors.primary.withOpacity(0.3),
                      ),
                    ),
                    child: SelectableText(
                      _generatedPrompt,
                      style: TextStyle(
                        fontSize: 14,
                        height: 1.6,
                        fontFamily: 'monospace',
                        color: isDark ? Colors.white70 : Colors.black87,
                      ),
                    ),
                  ),
                  
                  const SizedBox(height: 24),
                  
                  // Respuesta de la IA
                  if (_aiResponse.isNotEmpty) 
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: _aiResponse.startsWith('NINGUNO') 
                            ? Colors.orange.withOpacity(0.1)
                            : Colors.green.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: _aiResponse.startsWith('NINGUNO')
                              ? Colors.orange
                              : Colors.green,
                          width: 2,
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Icon(
                                _aiResponse.startsWith('NINGUNO') 
                                    ? Icons.warning_amber_rounded
                                    : Icons.check_circle,
                                color: _aiResponse.startsWith('NINGUNO')
                                    ? Colors.orange
                                    : Colors.green,
                                size: 28,
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Text(
                                  _aiResponse.startsWith('NINGUNO')
                                      ? 'No se reconoció platillo'
                                      : 'Platillo Identificado',
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                    color: _aiResponse.startsWith('NINGUNO')
                                        ? Colors.orange.shade700
                                        : Colors.green.shade700,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Text(
                            _aiResponse,
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w500,
                              color: isDark ? Colors.white : Colors.black87,
                            ),
                          ),
                        ],
                      ),
                    ),
                  
                  if (_aiResponse.isNotEmpty)
                    const SizedBox(height: 24),
                  
                  // Botones de acción
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () {
                            // Volver a la pantalla principal
                            Navigator.popUntil(context, (route) => route.isFirst);
                          },
                          icon: const Icon(Icons.close),
                          label: const Text('Cerrar'),
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 16),
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: _aiResponse.isEmpty ? _sendToBackendAI : null,
                          icon: const Icon(Icons.auto_awesome),
                          label: Text(_aiResponse.isEmpty ? 'Enviar a IA' : 'Ya procesado'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primary,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            disabledBackgroundColor: Colors.grey,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
    );
  }
}