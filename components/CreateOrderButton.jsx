'use client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from "react-native";

export default function OrderComponent({ items, customer }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePayNow = async () => {
    console.log("Pay Now button clicked");

    if (!items || !customer) {
      console.log("No items or customer provided, exiting...");
      return;
    }

    console.log("Received items:", items);
    console.log("Received customer:", customer);

    // Filter out any null or undefined items
    const validItems = items.filter(item => item && item._id);

    const orderItems = validItems.map(item => {
      const transformedItem = {
        product: item._id,
        quantity: item.quantity,
      };
      console.log("Transformed item:", transformedItem);
      return transformedItem;
    });

    if (orderItems.length === 0) {
      console.log("No valid items to order, exiting...");
      return;
    }

    // Transform customer to only include id
    const orderPayload = {
      customer: { id: customer._id },
      items: orderItems,
      paymentMethod: "card",
      notes: "Order placed from mobile app",
    };

    console.log("Order payload ready to send:", orderPayload);

    try {
      setLoading(true);

      const userData = await AsyncStorage.getItem('userData');
      const parsedUser = userData ? JSON.parse(userData) : null;
      const token = parsedUser?.token;

      if (!token) {
        console.log("No token found, cannot create order.");
        return;
      }

      const res = await fetch("https://frischly-server.onrender.com/api/orders", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderPayload),
      });

      console.log("Request sent, awaiting response...");

      if (!res.ok) {
        throw new Error(`Failed to create order: ${res.status}`);
      }

      const data = await res.json();
      console.log("Order created successfully:", data);

      // ✅ Navigate to "done" page after success
      router.push("/done");

    } catch (error) {
      console.error("Error creating order:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handlePayNow}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.buttonText}>Pay Now</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#ffc300",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
});
