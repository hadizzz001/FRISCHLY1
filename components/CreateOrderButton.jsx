'use client';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from '@react-native-picker/picker';
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

// -------------------- CheckoutPage Component --------------------
const CheckoutPage = ({ items, customer }) => {
  const router = useRouter();

  // -------------------- Payment State --------------------
  const [holderName, setHolderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardType, setCardType] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasCard, setHasCard] = useState(false);
  const [showForm, setShowForm] = useState(true);

  // Dropdown options
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const years = Array.from({ length: 15 }, (_, i) => String(new Date().getFullYear() + i));
  const allowedCardTypes = ["visa", "mastercard", "amex", "discover", "other"];

  // -------------------- Fetch saved card --------------------
  useEffect(() => {
    const fetchCard = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        const guest = await AsyncStorage.getItem("guest");

        if (!userData && !guest) {
          router.replace("/start");
          return;
        }

        if (userData) {
          const { token } = JSON.parse(userData);
          const res = await fetch("https://frischlyshop-server.onrender.com/api/auth/me", {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          });

          if (res.ok) {
            const data = await res.json();
            const card = data?.data?.user?.creditCard;

            console.log("Saved: ", card);
            

            if (card && card.cardNumber) {
              setHolderName(card.holderName || "");
              setCardNumber(card.cardNumber || "");
              setExpiryMonth(card.expiryMonth || "");
              setExpiryYear(card.expiryYear || "");
              setCardType(card.cardType || "other");
              setHasCard(true);
              setShowForm(false);
            }
          }
        }
      } catch (err) {
        console.error("🔥 Error fetching card:", err);
      }
    };

    fetchCard();
  }, []);

  // -------------------- Validation --------------------
  const validateCard = () => {
    const errors = {};
    const name = holderName.trim();
    if (!name || name.length > 100)
      errors.holderName = "Cardholder name is required and cannot exceed 100 characters.";

    const number = cardNumber.trim();
    if (!/^\d{13,19}$/.test(number))
      errors.cardNumber = "Card number must be between 13 and 19 digits.";

    const month = expiryMonth.trim();
    if (!month || month.length > 2 || !months.includes(month))
      errors.expiryMonth = "Expiry month must be valid and 2 digits (01–12).";

    const year = expiryYear.trim();
    if (!year || year.length > 4 || !years.includes(year))
      errors.expiryYear = "Expiry year must be valid and 4 digits.";

    const type = cardType.trim().toLowerCase();
    if (!allowedCardTypes.includes(type))
      errors.cardType = "Card type must be Visa, MasterCard, Amex, Discover, or Other.";

    if (!/^\d{3,4}$/.test(cvv))
      errors.cvv = "CVV must be 3–4 digits.";

    return { isValid: Object.keys(errors).length === 0, errors };
  };

  // -------------------- Pay Now (Save card + Place order) --------------------
  const handlePayNow = async () => {
    if (!items || !customer) return;

    const { isValid, errors } = validateCard();
    if (!isValid) {
      Alert.alert("Validation Error", Object.values(errors).join("\n"));
      return;
    }

    try {
      setLoading(true);

      // Save/Update card
      const stored = await AsyncStorage.getItem("userData");
      if (!stored) return;
      const { token } = JSON.parse(stored);

      const cardValues = {
        holderName: holderName.trim(),
        cardNumber: cardNumber.trim(),
        expiryMonth: expiryMonth.trim(),
        expiryYear: expiryYear.trim(),
        cardType: cardType.trim().toLowerCase(),
        // cvv: cvv.trim(),
      };

      const cardRes = await fetch("https://frischlyshop-server.onrender.com/api/auth/profile", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ creditCard: cardValues }),
      });

      if (!cardRes.ok) throw new Error("Failed to update credit card");

      setHasCard(true);
      setShowForm(false);

      // Place order
      const validItems = items.filter(item => item && item._id);
      const orderItems = validItems.map(item => ({ product: item._id, quantity: item.quantity }));
      if (orderItems.length === 0) return;

      const orderPayload = {
        customer: { id: customer._id },
        items: orderItems,
        paymentMethod: "card",
        notes: "Order placed from mobile app",
      };

      const orderRes = await fetch("https://frischlyshop-server.onrender.com/api/orders", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      if (!orderRes.ok) throw new Error("Failed to create order");

      router.push("/done");
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
    
 

    <Text style={styles.title}>Payment Information</Text>

    <Text>Card Holder Name</Text>
    <TextInput style={styles.input} value={holderName} onChangeText={setHolderName} maxLength={100} />

    <Text>Card Number</Text>
    <TextInput
      style={styles.input}
      keyboardType="numeric"
      value={cardNumber}
      onChangeText={(text) => setCardNumber(text.replace(/\D/g, ""))}
      maxLength={19}
    />

    <Text>Expiry Month</Text>
    <View style={styles.pickerContainer}>
      <Picker selectedValue={expiryMonth} onValueChange={setExpiryMonth}>
        <Picker.Item label="Select Month" value="" />
        {months.map(m => <Picker.Item key={m} label={m} value={m} />)}
      </Picker>
    </View>

    <Text>Expiry Year</Text>
    <View style={styles.pickerContainer}>
      <Picker selectedValue={expiryYear} onValueChange={setExpiryYear}>
        <Picker.Item label="Select Year" value="" />
        {years.map(y => <Picker.Item key={y} label={y} value={y} />)}
      </Picker>
    </View>

    <Text>CVV</Text>
    <TextInput
      style={styles.input}
      keyboardType="numeric"
      secureTextEntry
      value={cvv}
      onChangeText={(text) => setCvv(text.replace(/\D/g, ""))}
      maxLength={4}
    />

    <Text>Card Type</Text>
    <View style={styles.pickerContainer}>
      <Picker selectedValue={cardType} onValueChange={setCardType}>
        <Picker.Item label="Select Card Type" value="" />
        {allowedCardTypes.map(type => (
          <Picker.Item key={type} label={type.charAt(0).toUpperCase() + type.slice(1)} value={type} />
        ))}
      </Picker>
    </View>

    {/* Pay Now Button */}
    <View style={{ marginBottom: 40 }}>
      <TouchableOpacity style={styles.button} onPress={handlePayNow} disabled={loading}>
        {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.buttonText}>Pay Now</Text>}
      </TouchableOpacity>
    </View>
  </ScrollView>
);

};

// -------------------- Styles --------------------
const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 20, marginBottom: 15, fontWeight: "bold" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 12 },
  pickerContainer: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, marginBottom: 12 },
  button: { backgroundColor: "#ffc300", padding: 15, borderRadius: 8, alignItems: "center", marginTop: 10 },
  buttonText: { color: "#000", fontWeight: "bold", fontSize: 16 },
});

export default CheckoutPage;
