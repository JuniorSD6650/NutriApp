import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';

const ConfirmScreen = ({ onConfirm, onCancel }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    // Simular análisis de IA
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    
    pulseAnimation.start();
    
    setTimeout(() => {
      pulseAnimation.stop();
      setIsAnalyzing(false);
      setShowResults(true);
    }, 3000);

    return () => pulseAnimation.stop();
  }, []);

  if (isAnalyzing) {
    return (
      <View style={styles.analyzingContainer}>
        <Text style={styles.analyzingTitle}>🤖 Analizando comida...</Text>
        <Animated.View style={[styles.analyzeIcon, { transform: [{ scale: pulseAnim }] }]}>
          <Text style={styles.analyzeEmoji}>🔍</Text>
        </Animated.View>
        <Text style={styles.analyzingSubtitle}>
          Nuestra IA está identificando los alimentos y calculando el contenido nutricional
        </Text>
        <View style={styles.loadingSteps}>
          <Text style={styles.stepText}>✓ Procesando imagen</Text>
          <Text style={styles.stepText}>✓ Identificando alimentos</Text>
          <Text style={styles.stepText}>⏳ Calculando nutrientes...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>✅ Análisis Completado</Text>
          <Text style={styles.confidence}>Confianza: 94% 🎯</Text>
        </View>
        
        <Image
          source={require('../assets/images/meals/lentejas-pollo.jpg')}
          style={styles.image}
        />
        
        {/* Resultados del análisis */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleSection}>
              <Text style={styles.cardTitle}>🍽️ Alimentos Detectados</Text>
              <View style={styles.accuracyBadge}>
                <Text style={styles.accuracyText}>Alta precisión</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.foodList}>
            <View style={styles.foodItem}>
              <Text style={styles.foodEmoji}>🫘</Text>
              <View style={styles.foodInfo}>
                <Text style={styles.foodName}>Lentejas cocidas</Text>
                <Text style={styles.foodAmount}>~100g</Text>
              </View>
              <Text style={styles.foodIron}>6.9mg Fe</Text>
            </View>
            
            <View style={styles.foodItem}>
              <Text style={styles.foodEmoji}>🍚</Text>
              <View style={styles.foodInfo}>
                <Text style={styles.foodName}>Arroz blanco</Text>
                <Text style={styles.foodAmount}>~80g</Text>
              </View>
              <Text style={styles.foodIron}>0.8mg Fe</Text>
            </View>
            
            <View style={styles.foodItem}>
              <Text style={styles.foodEmoji}>🥩</Text>
              <View style={styles.foodInfo}>
                <Text style={styles.foodName}>Hígado de pollo</Text>
                <Text style={styles.foodAmount}>~50g</Text>
              </View>
              <Text style={styles.foodIron}>5.5mg Fe</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.totalSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>💪 Total de Hierro:</Text>
              <Text style={styles.totalIron}>13.2 mg</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>🔥 Calorías estimadas:</Text>
              <Text style={styles.totalCalories}>420 kcal</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>🥄 Proteínas:</Text>
              <Text style={styles.totalProtein}>18.5g</Text>
            </View>
          </View>
          
          <View style={styles.recommendation}>
            <Text style={styles.recommendationText}>
              🎉 ¡Excelente! Esta comida aporta el 101% de la dosis diaria recomendada de hierro.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Botones de Acción mejorados */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={onConfirm}>
          <Text style={styles.confirmButtonText}>💾 Guardar Registro</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onCancel}>
          <Text style={styles.cancelButtonText}>📷 Tomar Nueva Foto</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Pantalla de análisis
  analyzingContainer: {
    flex: 1,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  analyzingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 40,
    textAlign: 'center',
  },
  analyzeIcon: {
    marginBottom: 40,
  },
  analyzeEmoji: {
    fontSize: 80,
  },
  analyzingSubtitle: {
    fontSize: 16,
    color: '#E5E7EB',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  loadingSteps: {
    alignItems: 'flex-start',
  },
  stepText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  
  // Pantalla principal
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 8,
  },
  confidence: {
    fontSize: 14,
    color: '#6B7280',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  cardHeader: {
    marginBottom: 20,
  },
  cardTitleSection: {
    alignItems: 'center',
    width: '100%',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  accuracyBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  accuracyText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  foodList: {
    marginBottom: 24,
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  foodEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  foodAmount: {
    fontSize: 14,
    color: '#6B7280',
  },
  foodIron: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#059669',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  divider: {
    height: 2,
    backgroundColor: '#F3F4F6',
    marginVertical: 20,
  },
  totalSection: {
    marginBottom: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 16,
    color: '#4B5563',
    fontWeight: '500',
  },
  totalIron: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#DC2626',
  },
  totalCalories: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  totalProtein: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7C3AED',
  },
  recommendation: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  recommendationText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
    fontWeight: '500',
  },
  buttonContainer: {
    padding: 24,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
  confirmButton: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ConfirmScreen;