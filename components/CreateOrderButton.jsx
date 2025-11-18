'use client';
import { useTranslation } from "@/contexts/TranslationContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
// -------------------- CheckoutPage Component --------------------
const CheckoutPage = ({ items, customer }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
	const { t } = useTranslation();

  // -------------------- Check user or guest --------------------
  useEffect(() => {
    const checkUser = async () => {
      const userData = await AsyncStorage.getItem("userData");
      const guest = await AsyncStorage.getItem("guest");

      if (!userData && !guest) {
        router.replace("/start");
      }
    };

    checkUser();
  }, []);

  // -------------------- Place Order --------------------
const handlePlaceOrder = async () => {
  console.log("🛒 handlePlaceOrder triggered");

  if (!items || !customer) {
    console.log("⚠️ Missing items or customer:", { items, customer });
    return;
  }

  try {
    setLoading(true);
    console.log("⏳ Starting order process...");

    const stored = await AsyncStorage.getItem("userData");
    console.log("📦 Stored userData:", stored);

    if (!stored) {
      console.log("❌ No stored userData found in AsyncStorage");
      return;
    }

    const { token } = JSON.parse(stored);
    console.log("🔑 Token found:", token ? "Yes" : "No");

    const validItems = items.filter(item => item && item._id);
    console.log("✅ Valid items:", validItems);

    const orderItems = validItems.map(item => ({
      product: item._id,
      quantity: item.quantity,
    }));

    if (orderItems.length === 0) {
      console.log("⚠️ No valid order items found");
      return;
    }

    const orderPayload = {
      customer: { id: customer._id },
      items: orderItems,
      paymentMethod: "card",
      notes: "Order placed from mobile app",
    };

    console.log("📤 Sending order payload:", JSON.stringify(orderPayload, null, 2));

    const orderRes = await fetch("https://frischlyshop-server.onrender.com/api/orders", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderPayload),
    });

    console.log("📡 Response status:", orderRes.status);

    const data = await orderRes.json();
    console.log("📥 Response data:", data);

    if (!orderRes.ok || !data.success) {
      console.log("❌ Order creation failed:", data.message || "Unknown error");
      Alert.alert("Error", data.message || "Failed to create order");
      return;
    }

    console.log("✅ Order successfully created:", data);
    router.push(`/done`);

  } catch (err) {
    console.error("❌ Exception occurred:", err);
    Alert.alert("Error", err.message || "An error occurred");
  } finally {
    console.log("🏁 Order process finished");
    setLoading(false);
  }
};


  // -------------------- Render --------------------
  return (
    <ScrollView style={styles.container}>  

      {/* Place Order Button */}
      <View style={{ marginTop: 20, marginBottom: 40 }}>
        <TouchableOpacity style={styles.button} onPress={handlePlaceOrder} disabled={loading}>
          {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.buttonText}>{t("placeOrder")}</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// -------------------- Styles --------------------
const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 20, marginBottom: 15, fontWeight: "bold" },
  button: { backgroundColor: "#ffc300", padding: 15, borderRadius: 8, alignItems: "center" },
  buttonText: { color: "#000", fontWeight: "bold", fontSize: 16 },
});

export default CheckoutPage;
