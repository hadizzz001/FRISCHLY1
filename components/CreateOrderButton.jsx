'use client';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// -------------------- CheckoutPage Component --------------------
const CheckoutPage = ({ items, customer }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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
    if (!items || !customer) return;

    try {
      setLoading(true);

      const stored = await AsyncStorage.getItem("userData");
      if (!stored) return;
      const { token } = JSON.parse(stored);

      const validItems = items.filter(item => item && item._id);
      const orderItems = validItems.map(item => ({ product: item._id, quantity: item.quantity }));
      if (orderItems.length === 0) return;

      const orderPayload = {
        customer: { id: customer._id },
        items: orderItems,
        paymentMethod: "card", // or "card" if needed
        notes: "Order placed from mobile app",
      };

      const orderRes = await fetch("https://frischlyshop-server.onrender.com/api/orders", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await orderRes.json(); 

      if (!orderRes.ok || !data.success) {
        Alert.alert("Error", data.message || "Failed to create order");
        return;
      }
 
      
router.push(`/done`);

      
    } catch (err) {
      console.error("❌ Error:", err);
      Alert.alert("Error", err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // -------------------- Render --------------------
  return (
    <ScrollView style={styles.container}>  

      {/* Place Order Button */}
      <View style={{ marginTop: 20, marginBottom: 40 }}>
        <TouchableOpacity style={styles.button} onPress={handlePlaceOrder} disabled={loading}>
          {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.buttonText}>Place Order</Text>}
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
