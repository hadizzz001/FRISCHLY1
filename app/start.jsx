"use client";

import { useTranslation } from "@/contexts/TranslationContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import { useState } from "react";

import {
	ActivityIndicator,
	Alert,
	Dimensions,
	Image,
	KeyboardAvoidingView,
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from "react-native";

export default function Start() {
	const { t } = useTranslation();

	const router = useRouter(); 
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);

	const screenHeight = Dimensions.get("window").height;



	const handleLogin = async () => {
		if (!email || !password) {
			Alert.alert("Error", "Email and password are required");
			return;
		}

		setLoading(true);
		try {
			const res = await axios.post(
				"https://frischlyshop-server.onrender.com/api/auth/login-profile",
				{ email, password }
			);

			console.log("Login response:", res.data.data.user.emailConfirmed);

			const userData = res.data?.data;

			// ✅ Check if user data exists and email is confirmed
			if (userData) {
				if (userData.user.emailConfirmed === true) {
					// ✅ Save user data and redirect
					await AsyncStorage.setItem("userData", JSON.stringify(userData));
					router.replace("/(tabs)");
				} else {
					Alert.alert(
						"Email Not Verified",
						"Please verify your email before logging in."
					);
				}
			} else {
				Alert.alert("Login Failed", "Invalid email or password");
			}
		} catch (error) {
    console.log("Login error:", error.response?.data || error.message);

    // Extract exact backend message
    const backendMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Unknown error occurred";

    Alert.alert(
        "Login Failed",
        backendMessage
    );
} finally {
    setLoading(false);
}

	};



	const inputBg = "#FFFFFF";
	const inputText = "#000000";
	const placeholderColor = "#666666";


	return (
		<KeyboardAvoidingView
			style={{ flex: 1, backgroundColor: "#FFFFFF" }}
			behavior="padding"
		>
			<ScrollView
				contentContainerStyle={{ flexGrow: 1 }}
				keyboardShouldPersistTaps="handled"
			>
				{/* Top 40% yellow background */}
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
							uri: "https://res.cloudinary.com/dtzuor7no/image/upload/v1762515371/LOGO_frischly2_page-0002-removebg-preview_achbk6.png",
						}}
						style={{ width: 200, height: 200 }}
						resizeMode="contain"
					/>
				</View>

				{/* Bottom 60% content */}
				<View
					style={{
						flex: 1,
						justifyContent: "center",
						alignItems: "center",
						paddingHorizontal: 24,
						backgroundColor: "#ffffff",
					}}
				>
					{/* Email input */}
					<View
						style={{
							flexDirection: "row",
							alignItems: "center",
							marginBottom: 12,
							width: "100%",
							borderWidth: 1,
							borderColor: "#d1d5db",
							borderRadius: 12,
							backgroundColor: inputBg,
						}}
					>
						<TextInput
							placeholder={t("email")}
							keyboardType="email-address"
							value={email}
							onChangeText={setEmail}
							style={{
								flex: 1,
								padding: 15,
								color: inputText,
							}}
							placeholderTextColor={placeholderColor}
							autoCapitalize="none"
						/>
					</View>

					{/* Password input with eye icon */}
					<View
						style={{
							flexDirection: "row",
							alignItems: "center",
							marginBottom: 24,
							width: "100%",
							borderWidth: 1,
							borderColor: "#d1d5db",
							borderRadius: 12,
							backgroundColor: inputBg,
						}}
					>
						<TextInput
							placeholder={t("password")}
							secureTextEntry={!showPassword}
							value={password}
							onChangeText={setPassword}
							style={{
								flex: 1,
								padding: 15,
								color: inputText,
							}}
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

					{/* Login Button */}
					<TouchableOpacity
						onPress={handleLogin}
						disabled={loading}
						style={{
							backgroundColor: loading ? "#cccccc" : "#ffc300",
							borderRadius: 15,
							paddingVertical: 15,
							width: "100%",
							alignItems: "center",
							marginBottom: 12,
						}}
					>
						{loading ? (
							<ActivityIndicator size="small" color="#000000" />
						) : (
							<Text
								style={{ color: "#ffffff", fontWeight: "bold", fontSize: 18 }}
							>
								{t("login")}
							</Text>
						)}
					</TouchableOpacity>

					<TouchableOpacity onPress={() => router.push("/register")}>
						<Text style={{ color: "#000", fontSize: 16 }}>
							{t("noAccount")}{" "}
							<Text style={{ color: "#ffc300" }}>{t("register")}</Text>
						</Text>
					</TouchableOpacity>
					<TouchableOpacity
						onPress={async () => { 
							router.push("https://frischlyshop-server.onrender.com/forgot-password.html");
						}}
					>
						<Text style={{ fontSize: 16, textAlign: "center" }}>
							<Text style={{ color: "#000" }}> 
								<Text style={{ color: "#ffc300" }}>{t("forget")}</Text>
							</Text>
						</Text>


					</TouchableOpacity>


					<TouchableOpacity
						onPress={async () => {
							await AsyncStorage.setItem("guest", "true"); // 👈 mark as guest
							router.replace("/(tabs)");
						}}
					>
						<Text style={{ fontSize: 16, textAlign: "center" }}>
							<Text style={{ color: "#000" }}>
								{t("continue")}{" "}
								<Text style={{ color: "#ffc300" }}>{t("asGuest")}</Text>
							</Text>
						</Text>


					</TouchableOpacity>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}
