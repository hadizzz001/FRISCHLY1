import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import CarCard from './CarCard'; // Ensure this is a React Native component

const YourComponent = () => {
  const [allTemps, setAllTemps] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    fetchCategories();
  }, []);

const fetchCategories = async () => {
  try {
    const response = await fetch('https://diablocar.netlify.app/api/products'); // Adjust API URL
    if (response.ok) {
      const data = await response.json();
      setAllTemps(data.slice(0, 20)); // Get only the first 20 items
    } else {
      console.error('Failed to fetch categories');
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
};


  return (
    <ScrollView contentContainerStyle={styles.container}>
      {allTemps && allTemps.length > 0 ? (
        <View style={styles.gridContainer}>
          {allTemps.map((temp, index) => (
            <View key={temp.id} style={styles.cardWrapper}>
              <CarCard temp={temp} index={index} />
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No products available</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardWrapper: {
    width: '48%',
    marginBottom: 16,
  },
  errorContainer: {
    marginTop: 50,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
});

export default YourComponent;
