'use client';
import { useCart } from '@/contexts/CartContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import OrderComponent from '../components/CreateOrderButton';



export default function TestOrder() { 
  const [user, setUser] = useState(null);
  const { cart } = useCart();

  useEffect(() => {
    const checkLogin = async () => {
      const userData = await AsyncStorage.getItem('userData');
      const guest = await AsyncStorage.getItem('guest');

      if (!userData && !guest) {
        router.replace('/start');
      } else {
        try {
          const parsedUser = userData ? JSON.parse(userData) : null;
          const token = parsedUser?.token;

          if (!token) return;

          const res = await fetch("https://frischly-server.onrender.com/api/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          if (res.ok) { 
            const data = await res.json();
            setUser(data.data.user);
          }
        } catch (err) {
          console.error("Fetch error:", err);
        }
      }
    };
    checkLogin();
  }, []);

  // Only render OrderComponent if both cart and user exist
  if (!user || !cart) {
    return null; // or a loading indicator
  }

  return <OrderComponent items={cart} customer={user} />;
}
