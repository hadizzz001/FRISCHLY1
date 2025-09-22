'use client';
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { useRouter, useSearchParams } from "expo-router"; // ✅ for URL params
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
  const searchParams = useSearchParams(); // ✅
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    category: "",
    minPrice: "",
    maxPrice: "",
    inStock: false,
    sortBy: "",
    sortOrder: "",
  });
  const [loading, setLoading] = useState(true);
  const { cart } = useCart();
  const { isBooleanValue, setBooleanValue } = useBooleanValue();
  const [user, setUser] = useState(null);

  const token =
    Constants.expoConfig?.extra?.jwtToken ||
    process.env.EXPO_PUBLIC_JWT_TOKEN;

  const toggleCart = () => setBooleanValue(!isBooleanValue);

  // Fetch categories
  useEffect(() => {
    fetch("https://frischly-server.onrender.com/api/categories")
      .then((res) => res.json())
      .then((json) => setCategories(json.data || []))
      .catch((err) => console.error(err));
  }, []);

  // Normal fetch products
  const fetchProducts = async (pageNumber = 1) => {
    const params = {
      page: pageNumber,
      limit: 10,
      ...(filters.category && { category: filters.category }),
      ...(filters.minPrice && { minPrice: filters.minPrice }),
      ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
      ...(filters.inStock && { inStock: true }),
      ...(filters.sortBy && { sortBy: filters.sortBy }),
      ...(filters.sortOrder && { sortOrder: filters.sortOrder }),
    };

    const query = new URLSearchParams(params).toString();

    try {
      const res = await fetch(
        `https://frischly-server.onrender.com/api/products?${query}`
      );
      const json = await res.json();

      setProducts(json.data || []);
      setPage(json.pagination?.currentPage || 1);
      setTotalPages(json.pagination?.totalPages || 1);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // 🔥 Fetch discount products if ?discount=true
  useEffect(() => {
    const discountParam = searchParams.get("discount");

    if (discountParam === "true") {
      const fetchDiscountProducts = async () => {
        try {
          const res = await fetch(
            "https://frischly-server.onrender.com/api/products?limit=1000"
          );
          const json = await res.json();
          const withDiscount = json.data.filter(
            (item) => item.discount && item.discount > 0
          );
          setProducts(withDiscount.slice(0, 6)); // limit 6
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchDiscountProducts();
    } else {
      fetchProducts(1);
    }
  }, [searchParams]);

  // re-fetch if filters change (but not when discount=true)
  useEffect(() => {
    const discountParam = searchParams.get("discount");
    if (discountParam !== "true") {
      fetchProducts(1);
    }
  }, [filters]);

  // Check login & fetch user
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
                uri: item.picture.replace("/upload/", "/upload/q_15/"),
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
              !filters.category && { backgroundColor: "#ffc300" },
            ]}
            onPress={() => setFilters({ ...filters, category: "" })}
          >
            <Text
              style={[
                styles.categoryText,
                !filters.category && { color: "#000", fontWeight: "700" },
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          {/* ✅ Discounts button */}
          <TouchableOpacity
            style={[
              styles.categoryBtn,
              searchParams.get("discount") === "true" && {
                backgroundColor: "#ffc300",
              },
            ]}
            onPress={() => router.push("/shop?discount=true")}
          >
            <Text
              style={[
                styles.categoryText,
                searchParams.get("discount") === "true" && {
                  color: "#000",
                  fontWeight: "700",
                },
              ]}
            >
              Discounts
            </Text>
          </TouchableOpacity>

          {/* Dynamic categories */}
          {categories.map((cat) => {
            const isSelected = filters.category === cat._id;
            return (
              <TouchableOpacity
                key={cat._id}
                style={[
                  styles.categoryBtn,
                  isSelected && { backgroundColor: "#ffc300" },
                ]}
                onPress={() => setFilters({ ...filters, category: cat._id })}
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
        ListFooterComponent={
          searchParams.get("discount") !== "true" && (
            <View style={styles.pagination}>
              <TouchableOpacity
                disabled={page <= 1}
                onPress={() => fetchProducts(page - 1)}
                style={[styles.arrowButton, page <= 1 && { opacity: 0.3 }]}
              >
                <Feather name="chevron-left" size={24} color="#777" />
              </TouchableOpacity>

              <Text style={{ marginHorizontal: 10 }}>
                {page} / {totalPages}
              </Text>

              <TouchableOpacity
                disabled={page >= totalPages}
                onPress={() => fetchProducts(page + 1)}
                style={[
                  styles.arrowButton,
                  page >= totalPages && { opacity: 0.3 },
                ]}
              >
                <Feather name="chevron-right" size={24} color="#777" />
              </TouchableOpacity>
            </View>
          )
        }
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

      {/* Profile Overlay */}
      {profileOpen && (
        <View style={styles.overlay}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setProfileOpen(false)}
          >
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

            <TouchableOpacity
              style={styles.row}
              onPress={async () => {
                await AsyncStorage.removeItem("userData");
                await AsyncStorage.setItem("guest", "false");
                setProfileOpen(false);
                router.replace("/start");
              }}
            >
              <Feather
                name="log-out"
                size={20}
                color="red"
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.item, { color: "red" }]}>Logout</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.row}
              onPress={async () => {
                await AsyncStorage.removeItem("userData");
                await AsyncStorage.setItem("guest", "false");
                setProfileOpen(false);
                router.replace("/start");
              }}
            >
              <Feather
                name="trash-2"
                size={20}
                color="red"
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.item, { color: "red" }]}>
                Request Delete Account
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* Menu Overlay */}
      {menuOpen && (
        <View style={styles.overlay}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setMenuOpen(false)}
          >
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

      {/* Cart Overlay */}
      {isBooleanValue && (
        <View style={styles.overlay}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setBooleanValue(false)}
          >
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
 
