import { useCart } from "@/contexts/CartContext";
import { Feather, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
	Image,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import OrderComponent from "../components/CreateOrderButton";

const CheckoutScreen = () => {
	const { cart, removeFromCart,  subtotal, calculatePriceDetails } =
		useCart(); 
	const [deliveryFee, setDeliveryFee] = useState(0);
	const [total, setTotal] = useState((subtotal + deliveryFee).toFixed(2));
	const [zones, setZones] = useState([]);

	const [country, setCountry] = useState("");
	const [cities, setCities] = useState([]);
	const [countryData, setCountryData] = useState({
		code: "",
		flag: "",
		dial: "",
	});

	const router = useRouter();
	const token =
		Constants.expoConfig?.extra?.jwtToken || process.env.EXPO_PUBLIC_JWT_TOKEN;

	// ✅ Unified state
	const [state, setState] = useState({
		loading: true,
		user: null,
		inputs: {
			name: "",
			email: "",
			phone: "",
			country: "",
			state: "",
			city: "",
			zipCode: "",
			street: "",
		},
		country: "",
	});

	useEffect(() => {
		const fetchZones = async () => {
			try {
				const res = await axios.get(
					"https://frischlyshop-server.onrender.com/api/zones?isActive=true"
				);
				if (res.data.success) {
					setZones(res.data.data); // store array of zones
				}
			} catch (error) {
				console.log("Error fetching zones:", error.message);
			}
		};
		fetchZones();
	}, []);

	// Check login and fetch user
	useEffect(() => {
		const checkLogin = async () => {
			try {
				const userData = await AsyncStorage.getItem("userData");
				const guest = await AsyncStorage.getItem("guest");

				if (!userData) {
					router.replace("/start");
					return;
				}

				if (userData) {
					const parsedUser = JSON.parse(userData);
					const token = parsedUser?.token;

					if (!token) {
						console.log("⚠️ No token, treating as guest");
						setState((prev) => ({ ...prev, loading: false }));
						return;
					}

					const res = await fetch(
						"https://frischlyshop-server.onrender.com/api/auth/me",
						{
							headers: {
								Authorization: `Bearer ${token}`,
								"Content-Type": "application/json",
							},
						}
					);

					if (res.ok) {
						const data = await res.json();
						const user = data.data.user;

						setState((prev) => ({
							...prev,
							user,
							inputs: {
								name: user.name || "",
								email: user.email || "",
								phone: user.phoneNumber || "",
								country: user.address?.country || "",
								state: user.address?.state || "",
								city: user.address?.city || "",
								zipCode: user.address?.zipCode || "",
								street: user.address?.street || "",
							},
							country: user.address?.country || "",
							loading: false,
						}));
					} else {
						console.log("⚠️ Failed to fetch user, treating as guest");
						setState((prev) => ({ ...prev, loading: false }));
					}
				} else if (guest) {
					console.log("Guest mode enabled");
					setState((prev) => ({ ...prev, loading: false }));
				}
			} catch (err) {
				console.error("🔥 Error checking login:", err);
				setState((prev) => ({ ...prev, loading: false }));
			}
		};

		checkLogin();
	}, [router]);

	// Fetch country info
	useEffect(() => {
		const fetchCountry = async () => {
			try {
				const res = await axios.get("https://ipwho.is/");
				setCountry(res.data.country);
				setCountryData({
					code: res.data.country_code,
					flag: `https://flagcdn.com/24x18/${res.data.country_code.toLowerCase()}.png`,
					dial: `+${res.data.calling_code}`,
				});
			} catch (e) { }
		};
		fetchCountry();
	}, []);

	// Fetch cities for country
	useEffect(() => {
		if (state.country) {
			const fetchCities = async () => {
				try {
					const res = await axios.post(
						"https://countriesnow.space/api/v0.1/countries/cities",
						{
							country: state.country,
						}
					);
					setCities(res.data?.data || []);
				} catch (e) {
					setCities([]);
				}
			};
			fetchCities();
		}
	}, [state.country]);

	// Delivery fee fetch
	useEffect(() => {
		const fetchPrice = async () => {
			if (!state.inputs.zipCode || state.inputs.zipCode.length < 4) {
				setDeliveryFee(0);
				return;
			}
			try {
				const response = await fetch(
					"https://frischlyshop-server.onrender.com/api/zones/calculate-delivery",
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ zipCode: state.inputs.zipCode }),
					}
				);
				const data = await response.json();
				if (data.success) {
					setDeliveryFee(data.data.deliveryFee);
				} else {
					setDeliveryFee(0);
				}
			} catch (error) {
				console.error("Delivery fetch error:", error);
				setDeliveryFee(0);
			}
		};
		fetchPrice();
	}, [state.inputs.zipCode]);

	// Update total
	useEffect(() => {
		setTotal((subtotal + deliveryFee).toFixed(2));
	}, [subtotal, deliveryFee]);

	const handleInput = (name, value) => {
		setState((prev) => ({
			...prev,
			inputs: { ...prev.inputs, [name]: value },
		}));
	};

	const handleRemoveFromCart = (id) => removeFromCart(id);

	if (state.loading) {
		return (
			<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<Text>Loading user info...</Text>
			</View>
		);
	}


	if (!cart || cart.length === 0) {
		return (
			<View style={styles.emptyContainer}>
				<Text style={styles.emptyText}>
					You have no items in your shopping bag.
				</Text>
				<TouchableOpacity
					style={styles.button}
					onPress={() => router.push("/shop")}
				>
					<Text style={styles.buttonText}>Continue shopping</Text>
				</TouchableOpacity>
			</View>
		);
	}

	return (
		<ScrollView
			style={styles.container}
			contentContainerStyle={{ paddingBottom: 100 }}
		>
			<TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
				<Feather name="chevron-left" size={24} color="#000000" />
			</TouchableOpacity>

			<Text style={styles.heading}>Shipping Information</Text>

			<TextInput
				style={styles.input}
				placeholder="Email (optional)"
				value={state.inputs.email}
				onChangeText={(v) => handleInput("email", v)}
				keyboardType="email-address"
			/>

			<TextInput
				style={styles.input}
				placeholder="Full Name *"
				value={state.inputs.name}
				onChangeText={(v) => handleInput("name", v)}
			/>

			<TextInput
				style={styles.input}
				placeholder="Country *"
				value={state.inputs.country}
				editable={false}
			/>

			<TextInput
				style={styles.input}
				placeholder="City *"
				value={state.inputs.city}
				onChangeText={(v) => handleInput("city", v)}
			/>

			<TextInput
				style={styles.input}
				placeholder="State / Region *"
				value={state.inputs.state}
				onChangeText={(v) => handleInput("state", v)}
			/>

			<View
				style={{
					marginBottom: 12,
					width: "100%",
					minHeight: 55,
					borderWidth: 1,
					borderColor: "#000000",
					borderRadius: 12,
					backgroundColor: "#FFFFFF",
					justifyContent: "center",
				}}
			>
				<Picker
					selectedValue={state.inputs.zipCode}
					onValueChange={(itemValue) => handleInput("zipCode", itemValue)}
					style={{ color: "#000" }}
				>
					<Picker.Item label="Select Zip Code" value="" />
					{zones.map((zone) => (
						<Picker.Item
							key={zone._id}
							label={`${zone.zipCode} — ${zone.zoneName}`} // display both
							value={zone.zipCode} // only store zipCode
						/>
					))}
				</Picker>
			</View>

			<View style={styles.row}>
				{countryData.flag ? (
					<Image
						source={{ uri: countryData.flag }}
						style={{ width: 24, height: 18, marginRight: 8 }}
					/>
				) : null}
				<Text style={{ alignSelf: "center", marginRight: 8 }}>
					{countryData.dial}
				</Text>
				<TextInput
					style={[styles.input, { flex: 1 }]}
					placeholder="Phone *"
					value={state.inputs.phone}
					keyboardType="phone-pad"
					onChangeText={(v) => handleInput("phone", v)}
				/>
			</View>

			<TextInput
				style={styles.input}
				placeholder="Street *"
				value={state.inputs.street}
				onChangeText={(v) => handleInput("street", v)}
			/>

			<Text style={styles.heading}>Order Summary</Text>

			<View>
{cart.map((item, index) => {
  const quantity = item.quantity || 1;
  const priceDetails = calculatePriceDetails(item, quantity);

  return (
    <View key={`${item._id}-${index}`} style={styles.cartItem}>
      <Image
        source={{ uri: item.picture.replace("/upload/", "/upload/") }}
        style={styles.cartImage}
        resizeMode="contain"
      />
      <View style={{ flex: 1 }}>
        <Text>{item.title}</Text>
        <Text>Qty: {quantity}</Text>
        <Text style={styles.price}>€{priceDetails.finalPrice.toFixed(2)}</Text>
      </View>
      <TouchableOpacity onPress={() => handleRemoveFromCart(item._id)}>
        <Ionicons name="trash" size={20} color="red" />
      </TouchableOpacity>
    </View>
  );
})} 
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
				<Text style={{ fontWeight: "bold" }}>Total</Text>
				<Text style={{ fontWeight: "bold" }}>€{total}</Text>
			</View>

			<OrderComponent items={cart} customer={state.user} />
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		backgroundColor: "#FFFFFF",
		paddingTop: 50,
	},
	heading: { fontSize: 20, fontWeight: "bold", marginVertical: 12 },
	input: {
		borderWidth: 1,
		borderColor: "#000000",
		borderRadius: 6,
		padding: 10,
		marginVertical: 6,
	},
	row: { flexDirection: "row", alignItems: "center" },
	cartItem: {
		flexDirection: "row",
		alignItems: "center",
		marginVertical: 8,
		borderBottomWidth: 1,
		borderColor: "#000000",
		paddingBottom: 8,
	},
	cartImage: { width: 60, height: 60, marginRight: 12, borderRadius: 6 },
	summaryRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginVertical: 4,
	},
	button: {
		backgroundColor: "#FFC300",
		padding: 12,
		borderRadius: 6,
		alignItems: "center",
	},
	buttonText: { color: "#FFFFFF", fontWeight: "bold" },
	emptyContainer: {
		backgroundColor: "#fff",
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		marginTop: 60,
	},
	emptyText: { fontSize: 18, marginBottom: 20 },
});

export default CheckoutScreen;
