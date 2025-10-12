"use client";
import { useBooleanValue } from "@/contexts/CartBoolContext";
import { useCart } from "@/contexts/CartContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Dimensions,
	Image,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = width / 2 - 20;

export default function ShopPage() {
	const colorScheme = useColorScheme();
	const router = useRouter();
	const { category } = useLocalSearchParams();
	const { cart } = useCart();
	const { isBooleanValue, setBooleanValue } = useBooleanValue();

	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [groupedProducts, setGroupedProducts] = useState({});

	const token =
		Constants.expoConfig?.extra?.jwtToken || process.env.EXPO_PUBLIC_JWT_TOKEN;

	// ✅ Fetch products by category
	const fetchProducts = async () => {
		try {
			setLoading(true);
			const res = await fetch(
				`https://frischlyshop-server.onrender.com/api/products?limit=200&category=${encodeURIComponent(
					category
				)}`
			);
			const json = await res.json();
			if (json?.success && json?.data) {
				const grouped = {};
				json.data.forEach((item) => {
					const sub = item?.subcategory?.name || "Other";
					if (!grouped[sub]) grouped[sub] = [];
					grouped[sub].push(item);
				});
				setGroupedProducts(grouped);
			}
		} catch (err) {
			console.error("fetchProducts error:", err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (category) {
			fetchProducts();
		}
	}, [category]);

	// ✅ Check login
	useEffect(() => {
		const checkLogin = async () => {
			const userData = await AsyncStorage.getItem("userData");
			const guest = await AsyncStorage.getItem("guest");

			if (!userData && !guest) {
				router.replace("/start");
			} else {
				try {
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
					}
				} catch (err) {
					console.error("🔥 Network/Fetch error:", err);
				}
			}
		};
		checkLogin();
	}, []);

	const renderProduct = (item) => {
		const basePrice = item.price || 0;
		const discountPercent = item.discount || 0;
		const taxPercent = item.tax || 0;
		const bottleRefund = item.bottlerefund || 0;

		const discountAmount = (basePrice * discountPercent) / 100;
		const priceAfterDiscount = basePrice - discountAmount;
		const taxAmount = (priceAfterDiscount * taxPercent) / 100;
		const finalPrice = priceAfterDiscount + taxAmount + bottleRefund;

		return (
			<TouchableOpacity
				key={item._id}
				onPress={() => router.push(`/product/${item._id}`)}
				activeOpacity={0.8}
			>
				<View style={styles.card}>
					<View style={styles.imageWrapper}>
						<Image
							source={{
								uri: item.picture || "https://via.placeholder.com/150",
							}}
							style={styles.image}
							resizeMode="contain"
						/>
						{item.stock === 0 && (
							<View style={styles.overlay}>
								<Text style={styles.outOfStockText}>Out of Stock</Text>
							</View>
						)}
						{discountPercent > 0 && (
							<View style={styles.discountBadge}>
								<Text style={styles.discountText}>-{discountPercent}%</Text>
							</View>
						)}
					</View>
					<Text style={styles.name} numberOfLines={2}>
						{item.name}
					</Text>
					<Text style={styles.finalPrice}>€{finalPrice.toFixed(2)}</Text>
				</View>
			</TouchableOpacity>
		);
	};

	if (loading) {
		return (
			<View style={styles.loader}>
				<ActivityIndicator size="large" color="#ffc300" />
			</View>
		);
	}

	return (
		<ScrollView style={styles.container}>
			{/* Back Button */}
			<View style={styles.header}>
				<TouchableOpacity
					onPress={() => router.back()}
					style={styles.backButton}
				>
					<Feather name="chevron-left" size={24} color="#000" />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>{category}</Text>
			</View>

			{/* Grouped Products */}
			{Object.keys(groupedProducts).map((subName) => (
				<View key={subName} style={{ marginBottom: 20 }}>
					<Text style={styles.subcategoryTitle}>{subName}</Text>
					<View style={styles.grid}>
						{groupedProducts[subName].map((item) => renderProduct(item))}
					</View>
				</View>
			))}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#FFFFFF" },
	loader: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#FFFFFF",
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		padding: 10,
		borderBottomWidth: 1,
		borderBottomColor: "#eee",
	},
	backButton: { marginRight: 10 },
	headerTitle: { fontSize: 18, fontWeight: "bold", color: "#000" },
	subcategoryTitle: {
		fontSize: 22,
		fontWeight: "700",
		color: "#000",
		marginHorizontal: 10,
		marginTop: 10,
		marginBottom: 10,
	},
	grid: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
		paddingHorizontal: 10,
	},
	card: {
		width: ITEM_WIDTH,
		marginBottom: 10,
		padding: 4, // minimal padding
		// ✅ Removed all background, border, and shadow
		backgroundColor: "transparent",
		elevation: 0,
		shadowColor: "transparent",
	},
	imageWrapper: {
		position: "relative",
		width: "100%",
		height: 150,
		marginBottom: 6,
	},
	image: { width: "100%", height: "100%", borderRadius: 0 },
	overlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: "rgba(0,0,0,0.4)",
		justifyContent: "center",
		alignItems: "center",
	},
	outOfStockText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
	discountBadge: {
		position: "absolute",
		top: 8,
		right: 8,
		backgroundColor: "#FFC300",
		paddingHorizontal: 6,
		paddingVertical: 2,
		borderRadius: 4,
	},
	discountText: { color: "#000", fontSize: 12, fontWeight: "700" },
	name: {
		fontSize: 13,
		fontWeight: "500",
		marginBottom: 4,
		color: "#000000",
		textAlign: "center",
	},
	finalPrice: {
		fontSize: 15,
		fontWeight: "700",
		color: "#000",
		textAlign: "center",
	},
});
