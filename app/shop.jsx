'use client';
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { useLocalSearchParams, useRouter } from "expo-router";

import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Cart from "@/components/Cart";
import { useBooleanValue } from "@/contexts/CartBoolContext";
import { useCart } from "@/contexts/CartContext";
import { useColorScheme } from "@/hooks/useColorScheme";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = width / 2 - 20;

export default function ShopPage() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const searchParams = useLocalSearchParams();

  // ✅ discount & category from query params
  const discountParam = searchParams.discount ?? "";
  const categoryParam = searchParams.category ?? "";

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { cart } = useCart();
  const { isBooleanValue, setBooleanValue } = useBooleanValue();
  const [user, setUser] = useState(null);

  const token =
    Constants.expoConfig?.extra?.jwtToken ||
    process.env.EXPO_PUBLIC_JWT_TOKEN;

  const toggleCart = () => setBooleanValue(!isBooleanValue);

  // ✅ Fetch categories
  useEffect(() => {
    fetch("https://frischly-server.onrender.com/api/categories")
      .then((res) => res.json())
      .then((json) => setCategories(json.data || []))
      .catch((err) => console.error(err));
  }, []);

  // ✅ Fetch products (discount OR category)
  const fetchProducts = async () => {
    try {
      let url = "https://frischly-server.onrender.com/api/products?limit=12";

      // ✅ Discount products
      if (discountParam === "true") {
        const res = await fetch(
          "https://frischly-server.onrender.com/api/products?limit=1000"
        );
        const json = await res.json();
        const withDiscount = json.data.filter(
          (item) => item.discount && item.discount > 0
        );
        setProducts(withDiscount.slice(0, 12));
        setLoading(false);
        return;
      }

      // ✅ Category products
      if (categoryParam) {
        url = `https://frischly-server.onrender.com/api/products/category?categoryName=${categoryParam}`;
      }

      const res = await fetch(url);
      const json = await res.json();
      setProducts(json.data || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [discountParam, categoryParam]);

  // ✅ Check login & fetch user
  useEffect(() => {
    const checkLogin = async () => {
      const userData = await AsyncStorage.getItem("userData");
      const guest = await AsyncStorage.getItem("guest");

      if (!userData && !guest) {
        router.replace("/start");
      } else {
        try {
          const res = await fetch(
            "https://frischly-server.onrender.com/api/auth/me",
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

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

  const renderProduct = ({ item }) => {
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
        onPress={() => router.push(`/product/${item._id}`)}
        activeOpacity={0.8}
      >
        <View style={styles.card}>
          <View style={styles.imageWrapper}>
 

            <Image
              source={{
                uri: item.picture?.replace("/upload/", "/upload/q_15/")
                  || "https://via.placeholder.com/150",
              }}
              style={styles.image}
              resizeMode="cover"
            />

            {item.stock === 0 && (
              <View style={styles.overlay}>
                <Text style={styles.outOfStockText}>Out of Stock</Text>
              </View>
            )}

            {discountPercent > 0 && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>-{discountPercent}%</Text>
              </View>
            )}
          </View>

          <Text style={styles.name} numberOfLines={2}>
            {item.name}
          </Text>

          <View style={styles.priceDetails}>
            <Text style={styles.finalPrice}>€{finalPrice.toFixed(2)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#ffc300" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Back arrow + Categories */}
      <View style={styles.categoryHeader}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Feather name="chevron-left" size={24} color="#777" />
        </TouchableOpacity>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryBar}
          contentContainerStyle={{ alignItems: "center" }}
        >
          {/* All button */}
          <TouchableOpacity
            style={[
              styles.categoryBtn,
              !categoryParam && discountParam !== "true" && {
                backgroundColor: "#ffc300",
              },
            ]}
            onPress={() => router.push("/shop")}
          >
            <Text
              style={[
                styles.categoryText,
                !categoryParam && discountParam !== "true" && {
                  color: "#000",
                  fontWeight: "700",
                },
              ]}
            >
              All
            </Text>
          </TouchableOpacity>



          {/* Dynamic categories */}
          {categories.map((cat) => {
            const isSelected = categoryParam === cat.name;
            return (
              <TouchableOpacity
                key={cat._id}
                style={[
                  styles.categoryBtn,
                  isSelected && { backgroundColor: "#ffc300" },
                ]}
                onPress={() => router.push(`/shop?category=${cat.name}`)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    isSelected && { color: "#000", fontWeight: "700" },
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Products Grid */}
      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        renderItem={renderProduct}
        numColumns={2}
        contentContainerStyle={{ paddingBottom: 100, ...styles.grid }}
      />

      {/* Bottom Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => router.push("/")}
        >
          <Feather name="home" size={24} color="gray" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setProfileOpen(true)}
        >
          <Feather name="user" size={24} color="gray" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setMenuOpen(true)}
        >
          <Feather name="menu" size={24} color="gray" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabButton} onPress={toggleCart}>
          <Feather name="shopping-cart" size={24} color="gray" />
          {cart && cart.length > 0 && <View style={styles.cartBadge} />}
        </TouchableOpacity>
      </View>


      {/* ✅ Profile Overlay */}
      {profileOpen && (
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => setProfileOpen(false)}>
            <Feather name="x" size={28} color="#000" />
          </TouchableOpacity>
          <ScrollView contentContainerStyle={styles.overlayContentProfile}>
            <Text style={styles.title}>My Profile</Text>
            {user ? (
              <>
                <Text style={styles.item}>Name: {user.name}</Text>
                <Text style={styles.item}>Email: {user.email}</Text>
                <Text style={styles.item}>Phone: {user.phoneNumber}</Text>
              </>
            ) : (
              <Text style={styles.item}>Loading user...</Text>
            )}

            {/* Logout */}
            <TouchableOpacity
              style={styles.row}
              onPress={async () => {
                await AsyncStorage.removeItem("userData");
                await AsyncStorage.setItem("guest", "false");
                setProfileOpen(false);
                router.replace("/start");
              }}
            >
              <Feather name="log-out" size={20} color="red" style={{ marginRight: 6 }} />
              <Text style={[styles.item, { color: "red" }]}>Logout</Text>
            </TouchableOpacity>

            {/* Delete Account */}
            <TouchableOpacity
              style={styles.row}
              onPress={async () => {
                await AsyncStorage.removeItem("userData");
                await AsyncStorage.setItem("guest", "false");
                setProfileOpen(false);
                router.replace("/start");
              }}
            >
              <Feather name="trash-2" size={20} color="red" style={{ marginRight: 6 }} />
              <Text style={[styles.item, { color: "red" }]}>Request Delete Account</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* ✅ Menu Overlay */}
      {menuOpen && (
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => setMenuOpen(false)}>
            <Feather name="x" size={28} color="#000" />
          </TouchableOpacity>
          <ScrollView contentContainerStyle={styles.overlayContentMenu}>
            <Text style={styles.title}>Categories</Text>
            {categories.slice(0, 8).map((cat) => (
              <TouchableOpacity
                key={cat._id}
                onPress={() => {
                  setMenuOpen(false);
                  router.push(`/shop?category=${cat._id}`);
                }}
              >
                <Text style={styles.item}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => {
                setMenuOpen(false);
                router.push("/shop");
              }}
            >
              <Text style={styles.item}>All Categories</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* ✅ Cart Overlay */}
      {isBooleanValue && (
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => setBooleanValue(false)}>
            <Feather name="x" size={28} color="#000" />
          </TouchableOpacity>
          <Cart />
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  backButton: { marginRight: 6, padding: 4 },
  categoryBar: { flex: 1 },
  categoryBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryText: { fontSize: 14, fontWeight: "500", color: "#777" },
  grid: { padding: 10 },
  card: {
    width: ITEM_WIDTH,
    margin: 5,
    backgroundColor: "#fff",
    padding: 8,
  },
  imageWrapper: {
    position: "relative",
    width: "100%",
    height: 150,
    marginBottom: 6,
  },
  image: { width: "100%", height: "100%" },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    zIndex: 100,
    paddingTop: 60,
  },
  outOfStockText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  discountBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "red",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  name: { fontSize: 13, fontWeight: "500", marginBottom: 4, color: "#777" },
  priceRow: { flexDirection: "row", alignItems: "center" },
  oldPrice: {
    textDecorationLine: "line-through",
    color: "#777",
    marginRight: 6,
    fontSize: 13,
  },
  newPrice: { fontSize: 15, fontWeight: "700", color: "#333" },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  arrowButton: { padding: 6 },

  // Tabs
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  tabButton: { alignItems: "center", justifyContent: "center" },
  cartBadge: {
    position: "absolute",
    right: -6,
    top: -3,
    backgroundColor: "red",
    borderRadius: 8,
    width: 12,
    height: 12,
  },
  closeBtn: {
    position: "absolute",
    top: 40,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 200,
  },

  // Overlay contents
  overlayContentProfile: {
    paddingTop: 100,
    paddingHorizontal: 20,
    alignItems: "flex-start",
  },
  overlayContentMenu: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, color: "#000" },

  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  tabButton: { alignItems: "center", justifyContent: "center" },
  cartBadge: {
    position: "absolute",
    right: -6,
    top: -3,
    backgroundColor: "red",
    borderRadius: 8,
    width: 12,
    height: 12,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,1)",
    zIndex: 100,
    paddingTop: 50,
  },
  closeBtn: {
    position: "absolute",
    top: 40,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 200,
  },
  overlayContentProfile: {
    paddingTop: 100,
    paddingHorizontal: 20,
    alignItems: "flex-start",
  },
  overlayContentMenu: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  item: { fontSize: 16, marginVertical: 10, color: "#000" },
  row: { flexDirection: "row", alignItems: "center", marginVertical: 8 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 8 },

})