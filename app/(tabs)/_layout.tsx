'use client';
import { Feather } from "@expo/vector-icons";
import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import Cart from "@/components/Cart";
import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useBooleanValue } from '@/contexts/CartBoolContext';
import { useCart } from '@/contexts/CartContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const { cart } = useCart();
  const { isBooleanValue, setBooleanValue } = useBooleanValue();
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState(null);

  const toggleCart = () => setBooleanValue(!isBooleanValue);

  // Tabs to show
  const visibleTabs = ['index', 'acc', 'menu', 'cart'];

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("https://frischly-server.onrender.com/api/categories");
        const data = await res.json();
        setCategories(data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  // Check login
  useEffect(() => {
    const checkLogin = async () => {
      const userData = await AsyncStorage.getItem('userData');
      const guest = await AsyncStorage.getItem('guest');

      if (!userData && !guest) {
        router.replace('/start');
      } else {
        try {
          // ✅ Parse userData and get token
          const parsedUser = userData ? JSON.parse(userData) : null;
          const token = parsedUser?.token;

          if (!token) {
            console.error("⚠️ No token found in userData");
            setLoading(false);
            return;
          }

          const res = await fetch("https://frischly-server.onrender.com/api/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          if (res.ok) {
            const data = await res.json();
            setUser(data.data.user);
          } else {
            console.error("❌ Failed to fetch user:", res.status);
          }
        } catch (err) {
          console.error("🔥 Network/Fetch error:", err);
        }
        setLoading(false);
      }
    };
    checkLogin();
  }, [router]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#ffc300" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Bottom Tabs */}
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarActiveTintColor: 'gray',
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            ios: { position: 'absolute' },
            default: {},
          }),
        }}
      >
        {visibleTabs.includes('index') && (
          <Tabs.Screen
            name="index"
            options={{
              tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} />,
            }}
          />
        )}

        {visibleTabs.includes('acc') && (
          <Tabs.Screen
            name="acc"
            options={{
              tabBarIcon: ({ color, size }) => <Feather name="user" size={size} color={color} />,
              tabBarButton: (props) =>
                <TouchableOpacity {...props}
                  onPress={() => { 
                    setProfileOpen(true);
                  }}
                />,
            }}
          />
        )}

        {visibleTabs.includes('menu') && (
          <Tabs.Screen
            name="menu"
            options={{
              tabBarIcon: ({ color, size }) => <Feather name="menu" size={size} color={color} />,
              tabBarButton: (props) => <TouchableOpacity {...props} onPress={() => setMenuOpen(true)} />,
            }}
          />
        )}

        {visibleTabs.includes('cart') && (
          <Tabs.Screen
            name="cart"
            options={{
              tabBarIcon: ({ color, size }) => (
                <View>
                  <Feather name="shopping-cart" size={size} color={color} />
                  {cart && cart.length > 0 && <View style={styles.cartBadge} />}
                </View>
              ),
              tabBarButton: (props) => <TouchableOpacity {...props} onPress={toggleCart} />,
            }}
          />
        )}
      </Tabs>

{/* Profile Overlay */}
{profileOpen && (
  <View style={styles.profileOverlay}>
    <TouchableOpacity style={styles.profileCloseBtn} onPress={() => setProfileOpen(false)}>
      <Feather name="x" size={28} color="#000" />
    </TouchableOpacity>

    <ScrollView contentContainerStyle={styles.profileContent}>
      <Text style={styles.profileTitle}>My Profile</Text>
      {user ? (
        <>
          <Text style={styles.profileItem}>Name: {user.name}</Text>
          <Text style={styles.profileItem}>Email: {user.email}</Text>
          <Text style={styles.profileItem}>Phone: {user.phoneNumber}</Text>
        </>
      ) : (
        <Text style={styles.profileItem}>Guest</Text>
      )}

      {/* Login / Logout Button */}
      <TouchableOpacity
        style={styles.profileRow}
        onPress={async () => {
          if (user) {
            // Logout
            await AsyncStorage.removeItem("userData");
            setProfileOpen(false);
            router.replace("/start");
          } else {
            // Navigate to login if guest
            setProfileOpen(false);
            router.replace("/start");
          }
        }}
      >
        <Feather
          name={user ? "log-out" : "log-in"}
          size={20}
          color="red"
          style={{ marginRight: 6 }}
        />
        <Text style={[styles.profileItem, { color: "red" }]}>{user ? "Logout" : "Login"}</Text>
      </TouchableOpacity>

      {/* Delete Account button only for logged-in users */}
      {user && (
        <TouchableOpacity
          style={styles.profileRow}
          onPress={async () => {
            await AsyncStorage.removeItem("userData");
            setProfileOpen(false);
            router.replace("/start");
          }}
        >
          <Feather name="trash-2" size={20} color="red" style={{ marginRight: 6 }} />
          <Text style={[styles.profileItem, { color: "red" }]}>Request Delete Account</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  </View>
)}


      {/* Menu Overlay */}
      {menuOpen && (
        <View style={styles.menuOverlay}>
          <TouchableOpacity style={styles.menuCloseBtn} onPress={() => setMenuOpen(false)}>
            <Feather name="x" size={28} color="#000" />
          </TouchableOpacity>
          <ScrollView contentContainerStyle={styles.menuContent}>
            <Text style={styles.menuTitle}>Categories</Text>

            {categories.slice(0, 8).map((cat) => (
              <TouchableOpacity
                key={cat._id}
                onPress={() => {
                  setMenuOpen(false);
                  router.push(`/shop?category=${cat._id}`);
                }}
              >
                <Text style={styles.menuItem}>{cat.name}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={() => {
                setMenuOpen(false);
                router.push('/shop');
              }}
            >
              <Text style={styles.menuItem}>All Categories</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* Cart Overlay */}
      {isBooleanValue && (
        <View style={styles.cartOverlay}>
          <TouchableOpacity style={styles.cartCloseBtn} onPress={() => setBooleanValue(false)}>
            <Feather name="x" size={28} color="#000" />
          </TouchableOpacity>
          <Cart />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  profileOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#fff", zIndex: 60 },
  profileCloseBtn: { position: "absolute", top: 40, right: 20, width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center", zIndex: 100 },
  profileContent: { paddingTop: 100, paddingHorizontal: 20, alignItems: "flex-start" },
  profileTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 20, color: "#000" },
  profileItem: { fontSize: 16, marginVertical: 10, color: "#000" },
  profileRow: { flexDirection: "row", alignItems: "center", marginVertical: 8 },

  menuOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#fff", zIndex: 50 },
  menuCloseBtn: { position: "absolute", top: 40, right: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: "transparent", justifyContent: "center", alignItems: "center", zIndex: 100 },
  menuContent: { paddingTop: 100, paddingHorizontal: 20, alignItems: "center" },
  menuTitle: { fontSize: 22, fontWeight: "bold", color: "#000", marginBottom: 20 },
  menuItem: { fontSize: 18, color: "#000", marginVertical: 10 },

  cartOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#fff", zIndex: 100, paddingTop: 60 },
  cartCloseBtn: { position: "absolute", top: 40, right: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: "transparent", justifyContent: "center", alignItems: "center", zIndex: 200 },
  cartBadge: { position: "absolute", right: -6, top: -3, backgroundColor: "red", borderRadius: 8, width: 12, height: 12 },
});
