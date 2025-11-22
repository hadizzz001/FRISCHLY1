import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, StyleSheet, View } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { useCart } from "@/contexts/CartContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function TabLayout() { 
	const { cart } = useCart();
	const [loading, setLoading] = useState(true);
	const router = useRouter();
	const [user, setUser] = useState(null);

	// Tabs to show
	const visibleTabs = ["index", "menu", "cart", "acc"];

	// Check login
	useEffect(() => {
		const checkLogin = async () => {
			const userData = await AsyncStorage.getItem("userData");
			const guest = await AsyncStorage.getItem("guest");

			if (!userData && !guest) {
				router.replace("/start");
			} else {
				try {
					// ✅ Parse userData and get token
					const parsedUser = userData ? JSON.parse(userData) : null;
					const token = parsedUser?.token;

					if (!token) {
						console.error("⚠️ No token found in userData");
						setLoading(false);
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
						setUser(data.data.user);
					} else {
						console.error("❌ Failed to fetch user:", res.status);
					}
				} catch (err) {
					console.error("🔥 Network/Fetch error:", err);
				}
				setLoading(false);
			}
		};
		checkLogin();
	}, [router]);

	if (loading) {
		return (
			<View style={styles.loader}>
				<ActivityIndicator size="large" color="#FFC300" />
			</View>
		);
	}

	return (
		<View style={{ flex: 1 }}>
			{/* Bottom Tabs */}
			<Tabs
				screenOptions={{
					tabBarShowLabel: false,
					tabBarActiveTintColor: "#000000",
					tabBarInactiveTintColor: "#FFC300",
					headerShown: false,
					tabBarButton: HapticTab,
					tabBarBackground: TabBarBackground,
					tabBarStyle: Platform.select({
						ios: { position: "absolute" },
						default: { backgroundColor: "#FFFFFF" },
					}),
				}}
			>
				{visibleTabs.includes("index") && (
					<Tabs.Screen
						name="index"
						options={{
							tabBarIcon: ({ color, size }) => (
								<Feather name="home" size={size} color={color} />
							),
						}}
					/>
				)}

				{visibleTabs.includes("menu") && (
					<Tabs.Screen
						name="menu"
						options={{
							tabBarIcon: ({ color, size }) => (
								<Feather name="menu" size={size} color={color} />
							),
						}}
					/>
				)}

				{visibleTabs.includes("cart") && (
					<Tabs.Screen
						name="cart"
						options={{
							tabBarIcon: ({ color, size }) => (
								<View>
									<Feather name="shopping-cart" size={size} color={color} />
									{cart && cart.length > 0 && <View style={styles.cartBadge} />}
								</View>
							),
						}}
					/>
				)}

				{visibleTabs.includes("acc") && (
					<Tabs.Screen
						name="acc"
						options={{
							tabBarIcon: ({ color, size }) => (
								<Feather name="user" size={size} color={color} />
							),
						}}
					/>
				)}
			</Tabs>
		</View>
	);
}

const styles = StyleSheet.create({
	loader: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#FFFFFF",
	},
	cartBadge: {
		position: "absolute",
		right: -6,
		top: -3,
		backgroundColor: "#FFC300",
		borderRadius: 8,
		width: 12,
		height: 12,
	},
});
