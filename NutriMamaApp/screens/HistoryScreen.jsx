import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
} from 'react-native';

const MealCard = ({ meal }) => (
  <View style={styles.card}>
    <Image source={meal.image} style={styles.image} />
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle}>{meal.title}</Text>
      <Text style={styles.cardDate}>{meal.date}</Text>
      <View style={styles.cardStats}>
        <Text style={styles.cardIron}>
          Hierro: {meal.iron} mg
        </Text>
        <Text style={styles.cardCalories}>
          {meal.calories} kcal
        </Text>
      </View>
    </View>
  </View>
);

const HistoryScreen = ({ history, onNavigate }) => (
  <FlatList
    data={history}
    renderItem={({ item }) => <MealCard meal={item} />}
    keyExtractor={(item) => item.id.toString()}
    ListHeaderComponent={
      <Text style={styles.title}>Historial</Text>
    }
    contentContainerStyle={styles.container}
  />
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9FAFB',
    padding: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 24,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 16,
    overflow: 'hidden', // Para que la imagen no se salga de los bordes
  },
  image: {
    width: '100%',
    height: 128,
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  cardDate: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  cardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardIron: {
    fontSize: 16,
    color: '#059669',
    fontWeight: '600',
  },
  cardCalories: {
    fontSize: 16,
    color: '#4B5563',
  },
});

export default HistoryScreen;