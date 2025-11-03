import React, { useState } from 'react';
import { SafeAreaView, View, StyleSheet, StatusBar, AppRegistry } from 'react-native';

// Importa los datos estáticos
import { MOCK_USER, MOCK_HISTORY } from './constants/mockData';

// Importa las pantallas
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import HistoryScreen from './screens/HistoryScreen';
import ProfileScreen from './screens/ProfileScreen';
import CameraScreen from './screens/CameraScreen';
import ConfirmScreen from './screens/ConfirmScreen';
import AnemiaScreen from './screens/AnemiaScreen';

// Importa los componentes reutilizables
import BottomNavBar from './components/BottomNavBar';

export default function App() {
  // Estado para manejar la pantalla activa y el login
  const [screen, setScreen] = useState('login'); // 'login', 'home', 'history', 'profile', 'camera', 'confirm', 'anemia'

  // --- Funciones de Navegación ---
  const handleLogin = () => setScreen('home');
  const handleLogout = () => setScreen('login');
  const handleNavigate = (targetScreen) => setScreen(targetScreen);
  const handleTakePhoto = () => setScreen('camera');
  const handlePhotoTaken = () => setScreen('confirm');
  const handleConfirmMeal = () => {
    // Aquí se guardaría en BD, pero solo navegamos
    setScreen('home');
  };
  const handleCancelConfirm = () => setScreen('camera');
  const handleStartAnemia = () => setScreen('anemia');
  const handleAnemiaTest = () => setScreen('home'); // Volver al home después del test

  // --- Renderizado de Pantallas ---
  const renderScreen = () => {
    switch (screen) {
      case 'login':
        return <LoginScreen onLogin={handleLogin} />;
      case 'home':
        return (
          <HomeScreen
            user={MOCK_USER}
            onNavigate={handleNavigate}
            onTakePhoto={handleTakePhoto}
            onStartAnemia={handleStartAnemia}
          />
        );
      case 'history':
        return <HistoryScreen history={MOCK_HISTORY} onNavigate={handleNavigate} />;
      case 'profile':
        return <ProfileScreen user={MOCK_USER} onLogout={handleLogout} />;
      case 'camera':
        return <CameraScreen onPhotoTaken={handlePhotoTaken} />;
      case 'confirm':
        return (
          <ConfirmScreen
            onConfirm={handleConfirmMeal}
            onCancel={handleCancelConfirm}
          />
        );
      case 'anemia':
        return <AnemiaScreen onAnemiaTest={handleAnemiaTest} />;
      default:
        return <LoginScreen onLogin={handleLogin} />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      {/* Contenido Principal de la Pantalla */}
      <View style={styles.container}>{renderScreen()}</View>

      {/* --- Barra de Navegación Inferior --- */}
      {/* Solo se muestra si no estamos en login, cámara o confirmación */}
      {['home', 'history', 'profile'].includes(screen) && (
        <BottomNavBar activeScreen={screen} onNavigate={handleNavigate} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
  },
});

// Registrar el componente principal
AppRegistry.registerComponent('main', () => App);