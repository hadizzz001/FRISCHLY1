import { useCart } from '@/contexts/CartContext';
import { Feather, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Constants from "expo-constants";
import { useRouter } from 'expo-router';
import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const CheckoutScreen = () => {
  const { cart, removeFromCart, quantities, subtotal } = useCart();
  const [localQuantities, setLocalQuantities] = useState(quantities);

  const [deliveryFee, setDeliveryFee] = useState(subtotal > 50 ? 0 : 5);
  const [total, setTotal] = useState((subtotal + deliveryFee).toFixed(2));

  const [country, setCountry] = useState('');
  const [cities, setCities] = useState([]);
  const [countryData, setCountryData] = useState({ code: '', flag: '', dial: '' });

  const router = useRouter();
  const token = Constants.expoConfig?.extra?.jwtToken || process.env.EXPO_PUBLIC_JWT_TOKEN;

  const [inputs, setInputs] = useState({
    name: "",
    phone: "",
    email: "",
    country: "",
    state: "",
    city: "",
    zipCode: "",
    street: "",
  });

  const [loading, setLoading] = useState(true);

  // Fetch user info
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
  console.log("Entered 2 with data: " + userData);
  const parsed = JSON.parse(userData);   // ✅ parse string
  const user = parsed.user;              // ✅ extract actual user

  setInputs({
    name: user.name || "",
    email: user.email || "",
    phone: user.phoneNumber || "",
    country: user.address?.country || "",
    state: user.address?.state || "",
    city: user.address?.city || "",
    zipCode: user.address?.zipCode || "",
    street: user.address?.street || "",
  });

  if (user.address?.country) {
    setCountry(user.address.country);
  }
}


        else if (guest) {
          console.log("Entered");

          // Guest → empty form
          setInputs({
            name: "",
            email: "",
            phone: "",
            country: "",
            state: "",
            city: "",
            zipCode: "",
            street: "",
          });
        }

      } catch (err) {
        console.error("🔥 AsyncStorage error:", err);
      } finally {
        setLoading(false);
      }
    };

    checkLogin();
  }, []);


  // Fetch country info
  useEffect(() => {
    fetchCountry();
  }, []);

  useEffect(() => {
    setDeliveryFee(subtotal > 50 ? 0 : 5);
  }, [subtotal]);

  useEffect(() => {
    setTotal((subtotal + deliveryFee).toFixed(2));
  }, [subtotal, deliveryFee]);

  useEffect(() => {
    if (country) {
      fetchCities(country);
      setInputs((prev) => ({ ...prev, country }));
    }
  }, [country]);

  useEffect(() => {
    if (subtotal > 50) setDeliveryFee(0);
    else if (inputs.city?.trim().toLowerCase() === 'beirut') setDeliveryFee(3);
    else setDeliveryFee(5);
  }, [subtotal, inputs.city]);

  const fetchCountry = async () => {
    try {
      const res = await axios.get('https://ipwho.is/');
      setCountry(res.data.country);
      setCountryData({
        code: res.data.country_code,
        flag: `https://flagcdn.com/24x18/${res.data.country_code.toLowerCase()}.png`,
        dial: `+${res.data.calling_code}`,
      });
    } catch (e) { }
  };

  const fetchCities = async (country) => {
    try {
      const res = await axios.post('https://countriesnow.space/api/v0.1/countries/cities', { country });
      setCities(res.data?.data || []);
    } catch (e) {
      setCities([]);
    }
  };

  const handleInput = (name, value) => {
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleRemoveFromCart = (id) => removeFromCart(id);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading user info...</Text>
      </View>
    );
  }

  if (!cart || cart.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>You have no items in your shopping bag.</Text>
        <TouchableOpacity style={styles.button} onPress={() => { }}>
          <Text style={styles.buttonText}>Continue shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Feather name="chevron-left" size={24} color="#777" />
      </TouchableOpacity>

      <Text style={styles.heading}>Shipping Information</Text>

      <TextInput
        style={styles.input}
        placeholder="Email (optional)"
        value={inputs.email}
        onChangeText={(v) => handleInput('email', v)}
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Full Name *"
        value={inputs.name}
        onChangeText={(v) => handleInput('name', v)}
      />

      <TextInput
        style={styles.input}
        placeholder="Country *"
        value={inputs.country}
        editable={false}
      />

      <TextInput
        style={styles.input}
        placeholder="City *"
        value={inputs.city}
        onChangeText={(v) => handleInput('city', v)}
      />

      <TextInput
        style={styles.input}
        placeholder="State / Region *"
        value={inputs.state}
        onChangeText={(v) => handleInput('state', v)}
      />

      <TextInput
        style={styles.input}
        placeholder="ZIP Code *"
        value={inputs.zipCode}
        onChangeText={(v) => handleInput('zipCode', v)}
      />

      <View style={styles.row}>
        {countryData.flag ? (
          <Image source={{ uri: countryData.flag }} style={{ width: 24, height: 18, marginRight: 8 }} />
        ) : null}
        <Text style={{ alignSelf: 'center', marginRight: 8 }}>{countryData.dial}</Text>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Phone *"
          value={inputs.phone}
          keyboardType="phone-pad"
          onChangeText={(v) => handleInput('phone', v)}
        />
      </View>

      <TextInput
        style={styles.input}
        placeholder="Street *"
        value={inputs.street}
        onChangeText={(v) => handleInput('street', v)}
      />


      <Text style={styles.heading}>Order Summary</Text>

      <View>
        {cart.map((item) => (
          <View key={item._id} style={styles.cartItem}>
            <Image
              source={{
                uri: item.picture.replace("/upload/", "/upload/q_50/"),
              }}
              style={styles.cartImage}
              resizeMode="cover"
            />
            <View style={{ flex: 1 }}>
              <Text>{item.title}</Text>
              <Text>Qty: {localQuantities[item._id]}</Text>
              <Text style={styles.price}>
                €{(item.finalPrice * (localQuantities[item._id] || 1)).toFixed(2)}
              </Text>
            </View>
            <TouchableOpacity onPress={() => handleRemoveFromCart(item._id)}>
              <Ionicons name="trash" size={20} color="red" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={styles.summaryRow}>
        <Text>Subtotal</Text>
        <Text>€{subtotal.toFixed(2)}</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text>Delivery</Text>
        <Text>€{deliveryFee.toFixed(2)}</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={{ fontWeight: 'bold' }}>Total</Text>
        <Text style={{ fontWeight: 'bold' }}>€{total}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff", paddingTop: 50 },
  heading: { fontSize: 20, fontWeight: "bold", marginVertical: 12 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 6, padding: 10, marginVertical: 6 },
  row: { flexDirection: "row", alignItems: "center" },
  cartItem: { flexDirection: "row", alignItems: "center", marginVertical: 8, borderBottomWidth: 1, borderColor: "#eee", paddingBottom: 8 },
  cartImage: { width: 60, height: 60, marginRight: 12, borderRadius: 6 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 4 },
  button: { backgroundColor: "#222", padding: 12, borderRadius: 6, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 60 },
  emptyText: { fontSize: 18, marginBottom: 20 },
});

export default CheckoutScreen;
