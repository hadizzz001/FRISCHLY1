'use client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    const checkLogin = async () => {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        router.replace('/tabs'); // logged in
      } else {
        router.replace('/start'); // not logged in
      }
    };
    checkLogin();
  }, []);

  return null;
}
