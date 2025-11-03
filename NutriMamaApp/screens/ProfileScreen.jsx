import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

const ProfileScreen = ({ user, onLogout }) => (
  <ScrollView style={styles.container}>
    <View style={styles.header}>
      <Image
        source={user.profilePic}
        style={styles.profilePic}
      />
      <Text style={styles.name}>{user.name}</Text>
      <Text style={styles.childName}>
        Mamá de {user.childName}
      </Text>
    </View>

    <View style={styles.menu}>
      <TouchableOpacity style={styles.menuButton}>
        <Text style={styles.menuButtonText}>Editar Perfil</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuButton}>
        <Text style={styles.menuButtonText}>Configuración</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.menuButton, styles.logoutButton]}
        onPress={onLogout}>
        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  </ScrollView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    alignItems: 'center',
    padding: 24,
    paddingTop: 48,
  },
  profilePic: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 4,
    borderColor: '#10B981',
    marginBottom: 16,
  },
  name: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  childName: {
    fontSize: 18,
    color: '#4B5563',
    marginBottom: 32,
  },
  menu: {
    paddingHorizontal: 24,
  },
  menuButton: {
    backgroundColor: 'white',
    height: 48,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  menuButtonText: {
    fontSize: 16,
    color: '#374151',
  },
  logoutButton: {
    backgroundColor: '#FEE2E2', // red-100
    marginTop: 24,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 16,
    color: '#B91C1C', // red-700
    fontWeight: 'bold',
  },
});

export default ProfileScreen;