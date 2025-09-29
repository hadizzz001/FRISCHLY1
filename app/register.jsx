"use client";

import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
	Alert,
	Dimensions,
	Image,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	useColorScheme,
	View,
} from "react-native";

// -------------------------
// InputBox moved outside component to prevent focus loss
// -------------------------
const InputBox = ({
	placeholder,
	value,
	onChangeText,
	secureTextEntry,
	keyboardType,
	inputBg,
	inputText,
	placeholderColor,
}) => (
	<View
		style={{
			marginBottom: 12,
			width: "100%",
			minHeight: 55,
			borderWidth: 1,
			borderColor: "#d1d5db",
			borderRadius: 12,
			backgroundColor: inputBg,
			justifyContent: "center",
		}}
	>
		<TextInput
			placeholder={placeholder}
			value={value}
			onChangeText={onChangeText}
			secureTextEntry={secureTextEntry}
			keyboardType={keyboardType}
			style={{ padding: 15, color: inputText }}
			placeholderTextColor={placeholderColor}
		/>
	</View>
);

export default function Register() {
	const router = useRouter();
	const colorScheme = useColorScheme();
	const screenHeight = Dimensions.get("window").height;
	const [zones, setZones] = useState([]);
	const [zipCode, setZipCode] = useState("");

	// -------------------------
	// States
	// -------------------------
	const [name, setName] = useState("");
	const [phone, setPhone] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [street, setStreet] = useState("");
	const [city, setCity] = useState("");
	const [stateVal, setStateVal] = useState("");
	const [country, setCountry] = useState("");
	const [countryData, setCountryData] = useState(null);

	// -------------------------
	// Fetch country and check login
	// -------------------------
	useEffect(() => {
		fetchCountry();
		checkLogin();
	}, []);

	useEffect(() => {
		const fetchZones = async () => {
			try {
				const res = await axios.get(
					"https://frischly-server.onrender.com/api/zones?isActive=true"
				);
				if (res.data.success) {
					setZones(res.data.data); // store the array of zones
				}
			} catch (error) {
				console.log("Error fetching zones:", error.message);
			}
		};
		fetchZones();
	}, []);

	const fetchCountry = async () => {
		try {
			const res = await axios.get("https://ipwho.is/");
			setCountryData({
				code: res.data.country_code,
				flag: `https://flagcdn.com/24x18/${res.data.country_code.toLowerCase()}.png`,
				dial: `+${res.data.calling_code}`,
			});
			setCountry(res.data.country);
		} catch (e) {
			console.log("Country fetch error", e);
		}
	};

	const checkLogin = async () => {
		const userData = await AsyncStorage.getItem("userData");
		if (userData) router.replace("/tabs");
	};

	// -------------------------
	// Register handler
	// -------------------------
	const handleRegister = async () => {
		if (!name || !phone || !password || !zipCode) {
			Alert.alert("Error", "Name, phone, zip code and password are required");
			return;
		}

		const sanitizedPhone = phone.replace(/\D/g, "");

		const userData = {
			name,
			phoneNumber: sanitizedPhone,
			email,
			password,
			address: { street, city, state: stateVal, zipCode, country },
		};

		try {
			const res = await axios.post(
				"https://frischly-server.onrender.com/api/auth/register",
				userData,
				{ headers: { "Content-Type": "application/json" } }
			);
			if (res.data) {
				console.log("Registration response", res.data);

				await AsyncStorage.setItem("userData", JSON.stringify(res.data.data));
				Alert.alert("Success", "Registration successful!");
				router.replace("/start");
			}
		} catch (error) {
			console.log("Registration error:", error.errors?.data || error.message);
			Alert.alert(
				"Error",
				error.response?.data?.message || "Registration failed"
			);
		}
	};

	// -------------------------
	// Dark mode colors
	// -------------------------
	const inputBg = colorScheme === "dark" ? "#000000" : "#FFFFFF";
	const inputText = colorScheme === "dark" ? "#FFFFFF" : "#000000";
	const placeholderColor = colorScheme === "dark" ? "#000000" : "#000000";

	return (
		<KeyboardAvoidingView
			style={{ flex: 1, backgroundColor: "#FFFFFF" }}
			behavior={Platform.OS === "ios" ? "padding" : undefined}
		>
			<ScrollView
				keyboardShouldPersistTaps="handled"
				contentContainerStyle={{ paddingBottom: 50 }}
			>
				{/* Top Yellow Section */}
				<View
					style={{
						height: screenHeight * 0.4,
						justifyContent: "center",
						alignItems: "center",
						backgroundColor: "#ffc300",
						borderBottomLeftRadius: 60,
						borderBottomRightRadius: 60,
						overflow: "hidden",
					}}
				>
					<Image
						source={{
							uri: "https://res.cloudinary.com/dtzuor7no/image/upload/v1757763354/logo1z_phciva.webp",
						}}
						style={{ width: 200, height: 200 }}
						resizeMode="contain"
					/>
				</View>

				{/* Bottom Inputs */}
				<View style={{ paddingHorizontal: 24, marginTop: 20 }}>
					<InputBox
						placeholder="Full Name"
						value={name}
						onChangeText={setName}
						inputBg={inputBg}
						inputText={inputText}
						placeholderColor={placeholderColor}
					/>

					{/* Phone input */}
					<View
						style={{
							flexDirection: "row",
							alignItems: "center",
							marginBottom: 12,
							width: "100%",
							borderWidth: 1,
							borderColor: "#000000",
							borderRadius: 12,
							backgroundColor: inputBg,
							minHeight: 55,
							paddingHorizontal: 10,
						}}
					>
						{countryData && (
							<>
								<Image
									source={{ uri: countryData.flag }}
									style={{ width: 24, height: 18 }}
								/>
								<Text style={{ marginHorizontal: 8 }}>{countryData.dial}</Text>
							</>
						)}
						<TextInput
							placeholder="Phone Number"
							keyboardType="phone-pad"
							value={phone}
							onChangeText={setPhone}
							style={{ flex: 1, paddingVertical: 15, color: inputText }}
							placeholderTextColor={placeholderColor}
						/>
					</View>

					<InputBox
						placeholder="Email"
						value={email}
						onChangeText={setEmail}
						keyboardType="email-address"
						inputBg={inputBg}
						inputText={inputText}
						placeholderColor={placeholderColor}
					/>

					{/* Password */}
					<View
						style={{
							flexDirection: "row",
							alignItems: "center",
							marginBottom: 12,
							width: "100%",
							borderWidth: 1,
							borderColor: "#000000",
							borderRadius: 12,
							backgroundColor: inputBg,
						}}
					>
						<TextInput
							placeholder="Password"
							secureTextEntry={!showPassword}
							value={password}
							onChangeText={setPassword}
							style={{ flex: 1, padding: 15, color: inputText }}
							placeholderTextColor={placeholderColor}
						/>
						<TouchableOpacity
							onPress={() => setShowPassword(!showPassword)}
							style={{ paddingHorizontal: 10 }}
						>
							<Ionicons
								name={showPassword ? "eye-off" : "eye"}
								size={22}
								color={placeholderColor}
							/>
						</TouchableOpacity>
					</View>

					{/* Address Fields */}
					<InputBox
						placeholder="Street"
						value={street}
						onChangeText={setStreet}
						inputBg={inputBg}
						inputText={inputText}
						placeholderColor={placeholderColor}
					/>
					<InputBox
						placeholder="City"
						value={city}
						onChangeText={setCity}
						inputBg={inputBg}
						inputText={inputText}
						placeholderColor={placeholderColor}
					/>
					<InputBox
						placeholder="State"
						value={stateVal}
						onChangeText={setStateVal}
						inputBg={inputBg}
						inputText={inputText}
						placeholderColor={placeholderColor}
					/>
					<View
						style={{
							marginBottom: 12,
							width: "100%",
							minHeight: 55,
							borderWidth: 1,
							borderColor: "#000000",
							borderRadius: 12,
							backgroundColor: inputBg,
							justifyContent: "center",
						}}
					>
						<Picker
							selectedValue={zipCode}
							onValueChange={(itemValue) => setZipCode(itemValue)}
							style={{ color: inputText }}
						>
							<Picker.Item label="Select Zip Code" value="" />
							{zones.map((zone) => (
								<Picker.Item
									key={zone._id}
									// display both zipCode and zoneName
									label={`${zone.zipCode} — ${zone.zoneName}`}
									value={zone.zipCode} // only save zipCode
								/>
							))}
						</Picker>
					</View>

					<InputBox
						placeholder="Country"
						value={country}
						onChangeText={setCountry}
						inputBg={inputBg}
						inputText={inputText}
						placeholderColor={placeholderColor}
					/>

					{/* Register Button */}
					<TouchableOpacity
						onPress={handleRegister}
						style={{
							backgroundColor: "#ffc300",
							borderRadius: 15,
							paddingVertical: 15,
							width: "100%",
							alignItems: "center",
							marginBottom: 12,
						}}
					>
						<Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>
							Register
						</Text>
					</TouchableOpacity>

					<View
						style={{ alignItems: "center", marginTop: 10, marginBottom: 200 }}
					>
						<TouchableOpacity onPress={() => router.push("/start")}>
							<Text style={{ color: "#000", fontSize: 16 }}>
								Already have an account? Login
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}
