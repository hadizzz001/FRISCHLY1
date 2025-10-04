"use client";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import Constants from "expo-constants";
import { useLocalSearchParams, useRouter } from "expo-router";

import { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Dimensions,
	FlatList,
	Image,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

import { useBooleanValue } from "@/contexts/CartBoolContext";
import { useCart } from "@/contexts/CartContext";
import { useColorScheme } from "@/hooks/useColorScheme";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = width / 2 - 20;

export default function ShopPage() {
	const colorScheme = useColorScheme();
	const router = useRouter();
	const searchParams = useLocalSearchParams();

	// ✅ discount & category from query params
	const discountParam = searchParams.discount ?? "";
	const categoryParam = searchParams.category ?? "";

	const [menuOpen, setMenuOpen] = useState(false);
	const [profileOpen, setProfileOpen] = useState(false);
	const [categories, setCategories] = useState([]);
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const { cart } = useCart();
	const { isBooleanValue, setBooleanValue } = useBooleanValue();
	const [user, setUser] = useState(null);
	const [filterOpen, setFilterOpen] = useState(false);
	const [subcategories, setSubcategories] = useState([]);
	const searchParam = searchParams.search ?? "";
	const [page, setPage] = useState(1);
const [hasNextPage, setHasNextPage] = useState(true);
const [isFetchingMore, setIsFetchingMore] = useState(false);

	const [filters, setFilters] = useState({
		search: searchParam,
		subcategory: "",
		shelfNumber: "",
		sortBy: "price",
		sortOrder: "asc",
		priceRange: "1-20",
		stockLevel: "",
		discount: false,
		minDiscount: 5,
	});

	const token =
		Constants.expoConfig?.extra?.jwtToken || process.env.EXPO_PUBLIC_JWT_TOKEN;

	const toggleCart = () => setBooleanValue(!isBooleanValue);

	// ✅ Fetch categories
	useEffect(() => {
		fetch("https://frischly-server.onrender.com/api/categories")
			.then((res) => res.json())
			.then((json) => setCategories(json.data || []))
			.catch((err) => console.error(err));
	}, []);

	useEffect(() => {
		const getSubcategories = async () => {
			try {
				const res = await fetch(
					"https://frischly-server.onrender.com/api/subcategories"
				);
				const json = await res.json();
				if (json.success) {
					setSubcategories(json.data); // <-- only use the "data" array
				}
			} catch (err) {
				console.error("Failed to fetch subcategories:", err);
			}
		};

		getSubcategories();
	}, []);

	const fetchProducts = async (nextPage = 1) => {
		try {
			let url = `https://frischly-server.onrender.com/api/products?page=${nextPage}&limit=12`;

			if (filters.search) url += `&search=${filters.search}`;
			if (filters.subcategory) url += `&subcategory=${filters.subcategory}`;
			if (filters.sortBy)
				url += `&sortBy=${filters.sortBy}&sortOrder=${filters.sortOrder}`;
			if (filters.priceRange) url += `&priceRange=${filters.priceRange}`;
			if (filters.stockLevel) url += `&stockLevel=${filters.stockLevel}`;
			if (filters.discount)
				url += `&discount=true&minDiscount=${filters.minDiscount}`;

			if (categoryParam) {
				url = `https://frischly-server.onrender.com/api/products/category?categoryName=${categoryParam}`;
			}

			const res = await fetch(url);
			const json = await res.json();

			// 👇 Append instead of replace
			setProducts((prev) =>
				nextPage === 1 ? json.data : [...prev, ...json.data]
			);
			setHasNextPage(json.pagination.hasNextPage);
		} catch (err) {
			console.error(err);
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchProducts();
	}, [discountParam, categoryParam]);

	// ✅ Check login & fetch user
	useEffect(() => {
		const checkLogin = async () => {
			const userData = await AsyncStorage.getItem("userData");
			const guest = await AsyncStorage.getItem("guest");

			if (!userData && !guest) {
				router.replace("/start");
			} else {
				try {
					const res = await fetch(
						"https://frischly-server.onrender.com/api/auth/me",
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
	}, []);

	const loadMore = () => {
  if (!hasNextPage || isFetchingMore) return; // prevent double fetching
  setIsFetchingMore(true);
  const nextPage = page + 1;

  fetchProducts(nextPage).then(() => {
    setPage(nextPage);
    setIsFetchingMore(false);
  });
};


	const renderProduct = ({ item }) => {
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

					<View style={styles.priceDetails}>
						<Text style={styles.finalPrice}>€{finalPrice.toFixed(2)}</Text>
					</View>
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
		<View style={styles.container}>
			{/* Back arrow + Categories */}
			<View style={styles.categoryHeader}>
				<TouchableOpacity
					onPress={() => router.back()}
					style={styles.backButton}
				>
					<Feather name="chevron-left" size={24} color="#000000" />
				</TouchableOpacity>

				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					style={styles.categoryBar}
					contentContainerStyle={{ alignItems: "center" }}
				>
					{/* All button */}
					<TouchableOpacity
						style={[
							styles.categoryBtn,
							!categoryParam &&
								discountParam !== "true" && {
									backgroundColor: "#ffc300",
								},
						]}
						onPress={() => router.push("/shop")}
					>
						<Text
							style={[
								styles.categoryText,
								!categoryParam &&
									discountParam !== "true" && {
										color: "#000",
										fontWeight: "700",
									},
							]}
						>
							All
						</Text>
					</TouchableOpacity>

					{/* Dynamic categories */}
					{categories.map((cat) => {
						const isSelected = categoryParam === cat.name;
						return (
							<TouchableOpacity
								key={cat._id}
								style={[
									styles.categoryBtn,
									isSelected && { backgroundColor: "#ffc300" },
								]}
								onPress={() => router.push(`/shop?category=${cat.name}`)}
							>
								<Text
									style={[
										styles.categoryText,
										isSelected && { color: "#000", fontWeight: "700" },
									]}
								>
									{cat.name}
								</Text>
							</TouchableOpacity>
						);
					})}
				</ScrollView>

				<TouchableOpacity
					style={[styles.categoryBtn, { backgroundColor: "#ddd" }]}
					onPress={() => setFilterOpen(true)}
				>
					<Feather name="sliders" size={18} color="#000" />
				</TouchableOpacity>
			</View>

			{/* Products Grid */}
			<FlatList
				data={products}
				keyExtractor={(item) => item._id}
				renderItem={renderProduct}
				numColumns={2}
				onEndReached={loadMore}
				onEndReachedThreshold={0.3}
				ListFooterComponent={
					isFetchingMore ? (
						<ActivityIndicator size="small" color="#ffc300" />
					) : null
				}
			/>

			{/* ✅ Filter Overlay */}
			{filterOpen && (
				<View style={[styles.overlay, { left: width * 0.3 }]}>
					{/* Close button */}
					<TouchableOpacity
						style={styles.closeBtn}
						onPress={() => setFilterOpen(false)}
					>
						<Feather name="x" size={28} color="#000" />
					</TouchableOpacity>

					<ScrollView contentContainerStyle={{ padding: 20 }}>
						<Text style={styles.title}>Filter Products</Text>

						{/* Search Field */}
						<TextInput
							placeholder="Search..."
							value={filters.search}
							onChangeText={(v) => setFilters((p) => ({ ...p, search: v }))}
							style={styles.input}
						/>

						{/* Subcategory Picker */}
						<Text style={{ marginTop: 20, marginBottom: 5 }}>Subcategory</Text>
						<View style={styles.input}>
							<Picker
								selectedValue={filters.subcategory}
								onValueChange={(v) =>
									setFilters((p) => ({ ...p, subcategory: v }))
								}
							>
								<Picker.Item label="All Subcategories" value="" />
								{subcategories.map((sub) => (
									<Picker.Item
										key={sub._id}
										label={sub.name}
										value={sub.name}
									/>
								))}
							</Picker>
						</View>

						{/* Sort Order */}
						<TouchableOpacity
							onPress={() =>
								setFilters((p) => ({
									...p,
									sortOrder: p.sortOrder === "asc" ? "desc" : "asc",
								}))
							}
							style={styles.button}
						>
							<Text style={styles.buttonText}>Sort: {filters.sortOrder}</Text>
						</TouchableOpacity>

						{/* Discount Toggle */}
						<TouchableOpacity
							onPress={() =>
								setFilters((p) => ({ ...p, discount: !p.discount }))
							}
							style={styles.checkboxRow}
						>
							<Text style={{ color: "#000" }}>Only Discounted</Text>
							<View
								style={[
									styles.checkbox,
									filters.discount && styles.checkboxActive,
								]}
							/>
						</TouchableOpacity>

						{/* Price Range Picker */}
						<Text style={{ marginTop: 20, marginBottom: 5 }}>
							Price Range (€)
						</Text>
						<View style={styles.input}>
							<Picker
								selectedValue={filters.priceRange}
								onValueChange={(v) =>
									setFilters((p) => ({ ...p, priceRange: v }))
								}
							>
								<Picker.Item label="All Prices" value="" />
								<Picker.Item label="€1 - €20" value="1-20" />
								<Picker.Item label="€21 - €50" value="21-50" />
								<Picker.Item label="€51 - €100" value="51-100" />
								<Picker.Item label="€101 - €200" value="101-200" />
								<Picker.Item label="€201+" value="201-10000" />
							</Picker>
						</View>

						{/* Apply Filters Button */}
						<TouchableOpacity
							style={styles.button}
							onPress={() => {
								setFilterOpen(false);
								setPage(1);
								fetchProducts(1);
							}}
						>
							<Text style={styles.buttonText}>Apply Filters</Text>
						</TouchableOpacity>
					</ScrollView>
				</View>
			)}
		</View>
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
	categoryHeader: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 8,
		paddingVertical: 6,
	},
	backButton: { marginRight: 6, padding: 4 },
	categoryBar: { flex: 1 },
	categoryBtn: {
		paddingVertical: 6,
		paddingHorizontal: 14,
		borderRadius: 20,
		marginRight: 10,
	},
	categoryText: { fontSize: 14, fontWeight: "500", color: "#000000" },
	grid: { padding: 10 },
	card: {
		width: ITEM_WIDTH,
		margin: 5,
		backgroundColor: "#FFFFFF",
		padding: 8,
	},
	imageWrapper: {
		position: "relative",
		width: "100%",
		height: 150,
		marginBottom: 6,
	},
	image: { width: "100%", height: "100%" },
	overlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: "#FFFFFF",
		zIndex: 100,
		paddingTop: 60,
	},
	outOfStockText: { color: "#FFFFFF", fontWeight: "700", fontSize: 16 },
	discountBadge: {
		position: "absolute",
		top: 8,
		right: 8,
		backgroundColor: "#FFC300",
		paddingHorizontal: 6,
		paddingVertical: 2,
		borderRadius: 4,
	},
	discountText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
	name: { fontSize: 13, fontWeight: "500", marginBottom: 4, color: "#000000" },
	priceRow: { flexDirection: "row", alignItems: "center" },
	oldPrice: {
		textDecorationLine: "line-through",
		color: "#000000",
		marginRight: 6,
		fontSize: 13,
	},
	newPrice: { fontSize: 15, fontWeight: "700", color: "#000000" },
	pagination: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		paddingVertical: 10,
		backgroundColor: "#FFFFFF",
	},
	arrowButton: { padding: 6 },

	// Tabs
	tabBar: {
		flexDirection: "row",
		justifyContent: "space-around",
		paddingVertical: 12,
		backgroundColor: "#FFFFFF",
	},
	arrowButton: { padding: 6 },

	// Tabs
	tabBar: {
		flexDirection: "row",
		justifyContent: "space-around",
		paddingVertical: 12,
		backgroundColor: "#FFFFFF",
	},
	tabButton: { alignItems: "center", justifyContent: "center" },
	cartBadge: {
		position: "absolute",
		right: -6,
		top: -3,
		backgroundColor: "red",
		borderRadius: 8,
		width: 12,
		height: 12,
	},
	closeBtn: {
		position: "absolute",
		top: 40,
		right: 20,
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: "center",
		alignItems: "center",
		zIndex: 200,
	},

	// Overlay contents
	overlayContentProfile: {
		paddingTop: 100,
		paddingHorizontal: 20,
		alignItems: "flex-start",
	},
	overlayContentMenu: {
		flexGrow: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 20,
	},

	title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, color: "#000" },

	tabBar: {
		flexDirection: "row",
		justifyContent: "space-around",
		paddingVertical: 12,
		backgroundColor: "#FFFFFF",
	},
	tabButton: { alignItems: "center", justifyContent: "center" },
	cartBadge: {
		position: "absolute",
		right: -6,
		top: -3,
		backgroundColor: "red",
		borderRadius: 8,
		width: 12,
		height: 12,
	},
	overlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: "rgba(255,255,255,1)",
		zIndex: 100,
		paddingTop: 50,
	},
	closeBtn: {
		position: "absolute",
		top: 40,
		right: 20,
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: "center",
		alignItems: "center",
		zIndex: 200,
	},
	overlayContentProfile: {
		paddingTop: 100,
		paddingHorizontal: 20,
		alignItems: "flex-start",
	},
	overlayContentMenu: {
		flexGrow: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 20,
	},
	item: { fontSize: 16, marginVertical: 10, color: "#000" },
	row: { flexDirection: "row", alignItems: "center", marginVertical: 8 },
	title: { fontSize: 20, fontWeight: "bold", marginBottom: 8 },
	button: {
		backgroundColor: "#ffc300",
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderRadius: 8,
		marginTop: 10,
		alignItems: "center",
	},
	buttonText: {
		color: "#000",
		fontWeight: "bold",
		fontSize: 16,
	},
	checkboxRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#ccc",
		marginTop: 10,
	},
	checkbox: {
		width: 20,
		height: 20,
		borderRadius: 4,
		borderWidth: 2,
		borderColor: "#000",
	},
	checkboxActive: {
		backgroundColor: "#ffc300",
		borderColor: "#ffc300",
	},
});
