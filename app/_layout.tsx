'use client';

import Header from "@/components/Header";
import { BooleanProvider } from "@/contexts/CartBoolContext";
import { CartProvider } from "@/contexts/CartContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, usePathname } from "expo-router"; // <-- usePathname
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import "react-native-reanimated";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const pathname = usePathname(); // current route
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // For Lower.js overlays
  const [menuOpen, setMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]); 
  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("https://frischly-server.onrender.com/api/categories");
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  if (!loaded) return null;

  // Hide header on login/register page
  const hideHeaderOn = ['/start', '/register', '/checkout']; // add more paths if needed
const showHeader = !hideHeaderOn.includes(pathname) 

  return (
    <CartProvider>
      <BooleanProvider>
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
          <View style={styles.container}>
            {showHeader && <Header />} {/* Show header conditionally */}

            {/* Main navigation stack */}
            <Stack
              screenOptions={{
                headerBackTitleVisible: false,
                headerTitle: "",
              }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

              {/* Force hide header for auth screens */}
              <Stack.Screen
                name="start"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="register"
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="shop"
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="checkout"
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="product/[id]"
                options={{ headerShown: false }}
              />

              <Stack.Screen name="+not-found" />
            </Stack>


            <StatusBar style="auto" />
          </View>
        </ThemeProvider>
      </BooleanProvider>
    </CartProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
