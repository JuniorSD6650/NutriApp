import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { HomeIcon, HistoryIcon, UserIcon } from './Icons';

const BottomNavBar = ({ activeScreen, onNavigate }) => {
  return (
    <View style={styles.navBar}>
      <TouchableOpacity
        style={styles.navButton}
        onPress={() => onNavigate('home')}>
        <HomeIcon stroke={activeScreen === 'home' ? '#16a34a' : '#6b7280'} />
        <Text
          style={[
            styles.navText,
            activeScreen === 'home' && styles.navTextActive,
          ]}>
          Inicio
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navButton}
        onPress={() => onNavigate('history')}>
        <HistoryIcon
          stroke={activeScreen === 'history' ? '#16a34a' : '#6b7280'}
        />
        <Text
          style={[
            styles.navText,
            activeScreen === 'history' && styles.navTextActive,
          ]}>
          Historial
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navButton}
        onPress={() => onNavigate('profile')}>
        <UserIcon stroke={activeScreen === 'profile' ? '#16a34a' : '#6b7280'} />
        <Text
          style={[
            styles.navText,
            activeScreen === 'profile' && styles.navTextActive,
          ]}>
          Perfil
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navBar: {
    flexDirection: 'row',
    height: 80, // Aumentado para dar espacio a la safe area inferior
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 5,
    paddingBottom: 10, // Espacio para safe area
  },
  navButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#6b7280',
  },
  navTextActive: {
    color: '#16a34a',
  },
});

export default BottomNavBar;