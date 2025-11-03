import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { CameraIcon } from '../components/Icons';

const HomeScreen = ({ user, onNavigate, onTakePhoto, onStartAnemia }) => (
  <ScrollView style={styles.container}>
    {/* Header personalizado mejorado */}
    <View style={styles.header}>
      <View style={styles.greeting}>
        <Text style={styles.title}>¡Hola, {user.name}! 👋</Text>
        <Text style={styles.subtitle}>
          ¿Listo para registrar la comida de {user.childName}? 🍽️
        </Text>
      </View>
      <View style={styles.timeOfDay}>
        <Text style={styles.timeText}>🌞 Buenos días</Text>
      </View>
    </View>

    {/* Tarjeta de Progreso mejorada */}
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleSection}>
          <Text style={styles.cardTitle}>📊 Progreso de Hierro</Text>
          <Text style={styles.cardDate}>26 Nov</Text>
        </View>
      </View>
      {/* Simulación de gráfico de anillo mejorado */}
      <View style={styles.progressSection}>
        <View style={styles.ringOuter}>
          <View style={styles.ringProgress} />
          <View style={styles.ringInner}>
            <Text style={styles.ringText}>65%</Text>
            <Text style={styles.ringSubtext}>8.5mg</Text>
          </View>
        </View>
        <View style={styles.progressInfo}>
          <View style={styles.progressItem}>
            <Text style={styles.progressLabel}>Meta diaria</Text>
            <Text style={styles.progressValue}>13mg</Text>
          </View>
          <View style={styles.progressItem}>
            <Text style={styles.progressLabel}>Consumido</Text>
            <Text style={styles.progressValue}>8.5mg</Text>
          </View>
          <View style={styles.progressItem}>
            <Text style={styles.progressLabel}>Restante</Text>
            <Text style={styles.progressValue}>4.5mg</Text>
          </View>
        </View>
      </View>
      <Text style={styles.cardSubtitle}>
        ¡Excelente progreso! 🎉 Faltan solo 4.5 mg para completar la meta.
      </Text>
    </View>

    {/* Botón Principal de Cámara mejorado */}
    <TouchableOpacity style={styles.cameraButton} onPress={onTakePhoto}>
      <View style={styles.cameraButtonContent}>
        <CameraIcon stroke="white" width="32" height="32" />
        <Text style={styles.cameraButtonText}>Registrar Comida</Text>
        <Text style={styles.cameraButtonSubtext}>Toca para tomar foto</Text>
      </View>
    </TouchableOpacity>

    {/* Tarjeta de Tamizaje Ocular mejorada */}
    <View style={styles.anemiaCard}>
      <View style={styles.anemiaHeader}>
        <Text style={styles.anemiaCardTitle}>👁️ Tamizaje de Anemia</Text>
        <View style={styles.anemiaStatus}>
          <Text style={styles.statusText}>Disponible</Text>
        </View>
      </View>
      <Text style={styles.anemiaCardSubtitle}>
        Realiza un tamizaje rápido tomando una foto del párpado inferior. 
        Esta prueba te ayudará a detectar posibles signos de anemia.
      </Text>
      <View style={styles.anemiaFeatures}>
        <Text style={styles.featureText}>✓ Rápido y fácil</Text>
        <Text style={styles.featureText}>✓ Sin dolor para el bebé</Text>
        <Text style={styles.featureText}>✓ Resultados inmediatos</Text>
      </View>
      <TouchableOpacity style={styles.anemiaButton} onPress={onStartAnemia}>
        <Text style={styles.anemiaButtonText}>🚀 Iniciar Tamizaje</Text>
      </TouchableOpacity>
    </View>

    {/* Espacio adicional para scroll */}
    <View style={styles.bottomSpace} />
  </ScrollView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#10B981',
    padding: 24,
    paddingTop: 50,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  greeting: {
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#E6FFFA',
    lineHeight: 22,
  },
  timeOfDay: {
    alignSelf: 'flex-end',
  },
  timeText: {
    fontSize: 14,
    color: '#E6FFFA',
    opacity: 0.8,
  },
  // Card de Progreso mejorado
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  cardHeader: {
    marginBottom: 20,
  },
  cardTitleSection: {
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  cardDate: {
    fontSize: 14,
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  ringOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    position: 'relative',
  },
  ringProgress: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    borderColor: '#10B981',
    borderTopColor: '#F3F4F6',
    borderRightColor: '#F3F4F6',
  },
  ringInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
  },
  ringSubtext: {
    fontSize: 12,
    color: '#6B7280',
  },
  progressInfo: {
    flex: 1,
  },
  progressItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    textAlign: 'center',
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 12,
  },
  // Botón de Cámara mejorado
  cameraButton: {
    backgroundColor: '#10B981',
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  cameraButtonContent: {
    padding: 24,
    alignItems: 'center',
  },
  cameraButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
  },
  cameraButtonSubtext: {
    color: '#E6FFFA',
    fontSize: 14,
    opacity: 0.9,
  },
  // Card de Anemia mejorada
  anemiaCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#DBEAFE',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  anemiaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  anemiaCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E40AF',
  },
  anemiaStatus: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
  },
  anemiaCardSubtitle: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 16,
  },
  anemiaFeatures: {
    marginBottom: 20,
  },
  featureText: {
    fontSize: 14,
    color: '#059669',
    marginBottom: 4,
    fontWeight: '500',
  },
  anemiaButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  anemiaButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  bottomSpace: {
    height: 40,
  },
});

export default HomeScreen;