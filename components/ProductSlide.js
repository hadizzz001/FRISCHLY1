import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import Feather from 'react-native-vector-icons/Feather';

const { width } = Dimensions.get("window");
const ITEM_WIDTH = width / 2 - 20;
const ITEM_HEIGHT = 280;

export default function DiscountCarousel() {
  const router = useRouter();
  const [discountedProducts, setDiscountedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDiscountProducts = async () => {
      try {
        const res = await fetch("https://frischly-server.onrender.com/api/products?limit=1000");
        const json = await res.json();
        const withDiscount = json.data.filter(item => item.discount && item.discount > 0);
        setDiscountedProducts(withDiscount.slice(0, 6));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDiscountProducts();
  }, []);

  if (loading) {
    return (
      <View style={{ height: ITEM_HEIGHT, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#ffc300" />
        <Text>Loading discounted products...</Text>
      </View>
    );
  }

  // Group 2 items per slide
  const groupedData = [];
  for (let i = 0; i < discountedProducts.length; i += 2) {
    groupedData.push(discountedProducts.slice(i, i + 2));
  }

  // Render each product with full price calculation
  const renderProduct = (product) => {
    const basePrice = product.price || 0;
    const discountPercent = product.discount || 0;
    const taxPercent = product.tax || 0;
    const bottleRefund = product.bottlerefund || 0;

    const discountAmount = (basePrice * discountPercent) / 100;
    const priceAfterDiscount = basePrice - discountAmount;
    const taxAmount = (priceAfterDiscount * taxPercent) / 100;
    const finalPrice = priceAfterDiscount + taxAmount + bottleRefund;

    return (
      <TouchableOpacity
        key={product._id}
        onPress={() => router.push(`/product/${product._id}`)}
        activeOpacity={0.8}
        style={styles.card}
      >
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: product.picture.replace("/upload/", "/upload/q_1/") }}
            style={styles.image}
            resizeMode="cover"
          />
          {product.stock === 0 && (
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

        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>

        <View style={styles.priceRow}>
          <Text style={styles.newPrice}>€{finalPrice.toFixed(2)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ height: ITEM_HEIGHT, backgroundColor: '#fff'  }}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Hot Sales</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.allButton} onPress={() => router.push("/shop?discount=true")}>
            <Text style={styles.allText}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/shop?discount=true")}>
            <Feather name="chevron-right" size={24} color="#777" />
          </TouchableOpacity>
        </View>
      </View>

      <Carousel
        loop
        autoPlay
        autoPlayInterval={2000}
        width={ITEM_WIDTH * 2 + 10}
        height={ITEM_HEIGHT}
        data={groupedData}
        scrollAnimationDuration={800}
        renderItem={({ item }) => (
          <View style={{ flexDirection: "row" }}>
            {item.map(renderProduct)}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { width: ITEM_WIDTH, margin: 5, backgroundColor: "#fff", padding: 8 },
  imageWrapper: { position: 'relative', width: '100%', height: 150, marginBottom: 6 },
  image: { width: '100%', height: '100%' },
  overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#00000066", justifyContent: "center", alignItems: "center", borderRadius: 8 },
  outOfStockText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  discountBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: 'red', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  discountText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  name: { fontSize: 13, fontWeight: '500', marginBottom: 4, color: '#777' },
  priceRow: { flexDirection: 'row', alignItems: 'center' },
  oldPrice: { textDecorationLine: 'line-through', color: '#777', marginRight: 6, fontSize: 13 },
  newPrice: { fontSize: 15, fontWeight: '700', color: '#333' },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8, paddingHorizontal: 12, paddingVertical: 8 },
  headerText: { fontSize: 20, fontWeight: "700", color: "#000" },
  headerRight: { flexDirection: "row", alignItems: "center" },
  allButton: { marginRight: 8, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  allText: { fontSize: 18, fontWeight: "500", color: "#777" },
});
