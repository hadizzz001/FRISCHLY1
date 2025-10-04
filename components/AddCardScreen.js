import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

const PaymentForm = ({ onValidate }) => {
  const router = useRouter();

  const [holderName, setHolderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardType, setCardType] = useState("");

  // ✅ Auto-fill card details if user is logged in
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        const guest = await AsyncStorage.getItem("guest");

        if (!userData && !guest) {
          router.replace("/start");
          return;
        }

        if (userData) { 
          const parsedUser = JSON.parse(userData);
          const token = parsedUser?.token;
          if (!token) return; 

          const res = await fetch("https://frischly-server.onrender.com/api/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

if (res.ok) {
  const data = await res.json();
  console.log("Fetched user card:", data);

  const card = data?.data?.user?.creditCard; // ✅ FIXED PATH

  if (card) {
    setHolderName(card.holderName || "");
    setCardNumber(card.cardNumber || "");
    setExpiryMonth(card.expiryMonth || "");
    setExpiryYear(card.expiryYear || "");
    setCvv(card.cvv || "");
    setCardType(card.cardType || "");
  }
}

        }
      } catch (err) {
        console.error("🔥 Error fetching card:", err);
      }
    };

    checkLogin();
  }, []);

  // ✅ Validation function
  const validate = () => {
    const errors = {};

    if (!holderName || holderName.length < 1 || holderName.length > 100)
      errors.holderName = "Cardholder name must be less than 100 characters";

    if (!/^\d{13,19}$/.test(cardNumber))
      errors.cardNumber = "Card number must be between 13 and 19 digits";

    if (!["01","02","03","04","05","06","07","08","09","10","11","12"].includes(expiryMonth))
      errors.expiryMonth = "Expiry month must be between 01-12";

    if (!/^\d{4}$/.test(expiryYear))
      errors.expiryYear = "Expiry year must be a 4-digit year";

    if (!/^\d{3,4}$/.test(cvv))
      errors.cvv = "CVV must be 3 or 4 digits";

    if (!["visa","mastercard","amex","discover","other"].includes(cardType.toLowerCase()))
      errors.cardType = "Invalid card type";

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      values: { holderName, cardNumber, expiryMonth, expiryYear, cvv, cardType },
    };
  };

  // ✅ Allow parent to trigger validation via onValidate
  useEffect(() => {
    if (onValidate) onValidate(validate);
  }, [holderName, cardNumber, expiryMonth, expiryYear, cvv, cardType]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment Information</Text>

      <Text>Card Holder Name</Text>
      <TextInput style={styles.input} value={holderName} onChangeText={setHolderName} />

      <Text>Card Number</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={cardNumber} onChangeText={setCardNumber} />

      <Text>Expiry Month</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={expiryMonth} onChangeText={setExpiryMonth} />

      <Text>Expiry Year</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={expiryYear} onChangeText={setExpiryYear} />

      <Text>CVV</Text>
      <TextInput style={styles.input} keyboardType="numeric" secureTextEntry value={cvv} onChangeText={setCvv} />

      <Text>Card Type</Text>
      <TextInput style={styles.input} value={cardType} onChangeText={setCardType} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 20, marginBottom: 15, fontWeight: "bold" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
});

export default PaymentForm;
