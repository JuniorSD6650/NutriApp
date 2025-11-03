import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Vibration, Alert, Platform } from 'react-native';

const CameraScreen = ({ onPhotoTaken }) => {
  const [isCapturing, setIsCapturing] = useState(false);

  const takePicture = async () => {
    if (!isCapturing) {
      setIsCapturing(true);
      if (Platform.OS !== 'web') {
        Vibration.vibrate(100); // Feedback háptico
      }
      
      try {
        // Simular captura de foto con delay realista
        setTimeout(() => {
          setIsCapturing(false);
          onPhotoTaken();
        }, 800);
      } catch (error) {
        setIsCapturing(false);
        Alert.alert('Error', 'No se pudo tomar la foto');
      }
    }
  };

  // Pantalla simulada compatible con Expo Go
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📷 Registrar Comida</Text>
        <Text style={styles.headerSubtitle}>
          Demo de cámara - Presiona el botón para simular captura
        </Text>
      </View>

      {/* Simulación de cámara */}
      <View style={styles.cameraContainer}>
        <View style={styles.mockCamera}>
          <View style={styles.overlay}>
            {/* Guías de encuadre */}
            <View style={styles.framingGuide}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
              <Text style={styles.frameText}>📱 Demo en Expo Go</Text>
              <Text style={styles.frameSubtext}>Centra el plato aquí</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Controles */}
      <View style={styles.controls}>
        <Text style={styles.instructionText}>
          ✨ Presiona el botón para simular la captura de foto
        </Text>
        
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.backButton}>
            <Text style={styles.backButtonText}>❌</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.captureButton, isCapturing && styles.capturingButton]} 
            onPress={takePicture}
            disabled={isCapturing}
          >
            <View style={[styles.captureButtonInner, isCapturing && styles.capturingInner]} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.flashButton}>
            <Text style={styles.flashButtonText}>💡</Text>
          </TouchableOpacity>
        </View>
        
        {isCapturing && (
          <Text style={styles.capturingText}>📸 Capturando...</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 20,
    paddingTop: 50,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E0E0E0',
    textAlign: 'center',
  },
  cameraContainer: {
    flex: 1,
    margin: 20,
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
  framingGuide: {
    width: 280,
    height: 280,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#10B981',
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  frameText: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
  },
  frameSubtext: {
    color: '#10B981',
    fontSize: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    opacity: 0.8,
  },
  controls: {
    backgroundColor: 'rgba(0,0,0,0.9)',
    padding: 30,
    alignItems: 'center',
  },
  instructionText: {
    color: '#FCD34D',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    backgroundColor: 'rgba(252, 211, 77, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 300,
  },
  backButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  capturingButton: {
    backgroundColor: '#F87171',
    transform: [{ scale: 0.9 }],
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  capturingInner: {
    backgroundColor: '#FEE2E2',
  },
  flashButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flashButtonText: {
    fontSize: 20,
  },
  capturingText: {
    color: '#F87171',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
});

export default CameraScreen;