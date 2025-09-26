'use client';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useBooleanValue } from "@/contexts/CartBoolContext";
import { useCart } from "@/contexts/CartContext";
import { useColorScheme } from "@/hooks/useColorScheme";

const { width } = Dimensions.get('window'); 
const ITEM_WIDTH = width / 2 - 20; // 2 items per row
const LIMIT = 14; // items per fetch

export default function ShopPage() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { cart } = useCart();
  const { isBooleanValue, setBooleanValue } = useBooleanValue();
  const [user, setUser] = useState(null);

  const token = Constants.expoConfig?.extra?.jwtToken || process.env.EXPO_PUBLIC_JWT_TOKEN;

  const toggleCart = () => setBooleanValue(!isBooleanValue);

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://frischly-server.onrender.com/api/products?page=1&limit=${LIMIT}`
      );
      const json = await res.json();
      const newProducts = json.data || [];
      setProducts(newProducts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Check login & fetch user
  useEffect(() => {
    const checkLogin = async () => {
      const userData = await AsyncStorage.getItem("userData");
      const guest = await AsyncStorage.getItem("guest");

      if (!userData && !guest) {
        router.replace("/start");
      } else {
        try {
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
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#ffc300" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {products.map((item) => {
          const basePrice = item.price || 0;
          const discountPercent = item.discount || 0;
          const taxPercent = item.tax || 0;
          const bottleRefund = item.bottlerefund || 0;

          const discountAmount = (basePrice * discountPercent) / 100;
          const priceAfterDiscount = basePrice - discountAmount;
          const taxAmount = (priceAfterDiscount * taxPercent) / 100;
          const finalPrice = priceAfterDiscount + taxAmount + bottleRefund;

          return (
            <TouchableOpacity
              key={item._id}
              onPress={() => router.push(`/product/${item._id}`)}
              activeOpacity={0.8}
            >
              <View style={styles.card}>
                <View style={styles.imageWrapper}>
                  <Image
                    source={{
                      uri: item.picture?.replace("/upload/", "/upload/q_1/") 
                        || "https://via.placeholder.com/150",
                    }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                  {item.stock === 0 && (
                    <View style={styles.outOfStockOverlay}>
                      <Text style={styles.outOfStockText}>Out of Stock</Text>
                    </View>
                  )}
                  {discountPercent > 0 && (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>-{discountPercent}%</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.finalPrice}>€{finalPrice.toFixed(2)}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={{ paddingVertical: 16, alignItems: 'center' }}>
        <TouchableOpacity
          onPress={() => router.push("/shop")}
          style={styles.viewMoreBtn}
        >
          <Text style={styles.viewMoreText}>View More</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loader: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 10 },
  card: { width: ITEM_WIDTH, margin: 5, backgroundColor: '#fff', padding: 8 },
  imageWrapper: { position: 'relative', width: '100%', height: 150, marginBottom: 6 },
  image: { width: '100%', height: '100%' },
  outOfStockOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  outOfStockText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  discountBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: 'red', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  discountText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  name: { fontSize: 13, fontWeight: '500', marginBottom: 4, color: '#777' },
  finalPrice: { fontSize: 15, fontWeight: '700', color: '#333' },
  viewMoreBtn: { paddingHorizontal: 20, paddingVertical: 8, backgroundColor: '#ffc300', borderRadius: 6 },
  viewMoreText: { fontWeight: '700', color: '#000' },
});
 