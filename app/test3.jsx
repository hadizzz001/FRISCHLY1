'use client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export default function TestOrder() { 
  
     const router = useRouter();

  return (
    <View style={styles.container}> 
						<TouchableOpacity 
							style={styles.row}
							onPress={async () => {
								await AsyncStorage.removeItem("userData");
								await AsyncStorage.setItem("guest", "false"); 
								router.replace("/start");
							}}
						>tester</TouchableOpacity>
    </View>
  );
}
  
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 8,
  },
  cell: {
    flex: 1,
    textAlign: 'center',
  },
  header: {
    backgroundColor: '#f2f2f2',
  },
  headerText: {
    fontWeight: 'bold',
  },
});
