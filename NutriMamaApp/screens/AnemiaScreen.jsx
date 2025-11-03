import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  Animated,
  Vibration
} from 'react-native';

const AnemiaScreen = ({ onAnemiaTest }) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animación de pulso para el indicador
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();
    return () => pulseAnimation.stop();
  }, []);

  const takePicture = async () => {
    if (!isCapturing) {
      setIsCapturing(true);
      Vibration.vibrate(100); // Feedback háptico
      
      try {
        // Simular captura de foto
        setTimeout(() => {
          setIsCapturing(false);
          setShowResult(true);
          // Simular análisis de 3 segundos
          setTimeout(() => {
            Alert.alert(
              "Resultado del Tamizaje",
              "🟢 Resultado: NORMAL\n\nNiveles de hemoglobina aparentemente normales. Se recomienda continuar con controles regulares.",
              [
                {
                  text: "Entendido",
                  onPress: onAnemiaTest
                }
              ]
            );
          }, 3000);
        }, 1000);
      } catch (error) {
        setIsCapturing(false);
        Alert.alert('Error', 'No se pudo tomar la foto');
      }
    }
  };

  if (showResult) {
    return (
      <View style={styles.resultContainer}>
        <Text style={styles.resultTitle}>Analizando imagen...</Text>
        <View style={styles.loadingIndicator}>
          <Animated.View style={[styles.pulseCircle, { transform: [{ scale: pulseAnim }] }]} />
        </View>
        <Text style={styles.resultSubtitle}>Procesando datos del párpado inferior</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tamizaje de Anemia</Text>
        <Text style={styles.instructions}>
          Coloca el párpado inferior del niño frente a la cámara con buena iluminación (Simulación)
        </Text>
      </View>

      <View style={styles.cameraContainer}>
        <View style={styles.mockCamera}>
          <View style={styles.overlay}>
            <View style={styles.targetArea}>
              <Text style={styles.targetText}>Coloca el párpado aquí</Text>
              <Text style={styles.targetSubtext}>📱 Demo sin cámara real</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity 
          style={[styles.captureButton, isCapturing && styles.capturingButton]} 
          onPress={takePicture}
          disabled={isCapturing}
        >
          <View style={styles.captureButtonInner} />
          {isCapturing && <Text style={styles.capturingText}>Capturando...</Text>}
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.cancelButton} onPress={onAnemiaTest}>
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  instructions: {
    fontSize: 16,
    color: '#E0E0E0',
    textAlign: 'center',
    lineHeight: 22,
  },
  cameraContainer: {
    flex: 1,
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  mockCamera: {
    flex: 1,
    backgroundColor: '#2D3748',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetArea: {
    width: 200,
    height: 120,
    borderWidth: 3,
    borderColor: '#00D4AA',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 212, 170, 0.1)',
  },
  targetText: {
    color: '#00D4AA',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  targetSubtext: {
    color: '#00D4AA',
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.8,
  },
  controls: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#00D4AA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#00D4AA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  capturingButton: {
    backgroundColor: '#FF6B6B',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  capturingText: {
    position: 'absolute',
    bottom: -25,
    color: '#fff',
    fontSize: 12,
  },
  cancelButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00D4AA',
    marginBottom: 40,
    textAlign: 'center',
  },
  loadingIndicator: {
    marginBottom: 40,
  },
  pulseCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#00D4AA',
    opacity: 0.6,
  },
  resultSubtitle: {
    fontSize: 16,
    color: '#E0E0E0',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default AnemiaScreen;