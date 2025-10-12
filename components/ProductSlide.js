import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
	ActivityIndicator,
	Dimensions,
	FlatList,
	Image,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = width / 3 - 12; // Show exactly 3 per row
const ITEM_HEIGHT = 155;

export default function DiscountCarousel({ refreshTrigger }) {
	const router = useRouter();
	const [discountedProducts, setDiscountedProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const flatListRef = useRef(null);
	const [currentIndex, setCurrentIndex] = useState(0);

	const fetchDiscountProducts = async () => {
		try {
			const res = await fetch(
				"https://frischlyshop-server.onrender.com/api/products/discount"
			);
			const json = await res.json();
			const withDiscount = json.data.filter(
				(item) => item.discount && item.discount > 0
			);
			setDiscountedProducts(withDiscount.slice(0, 12));
		} catch (err) {
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchDiscountProducts();
	}, []);

	useEffect(() => {
		if (refreshTrigger > 0) {
			setLoading(true);
			fetchDiscountProducts();
		}
	}, [refreshTrigger]);

	// ✅ Auto Slider Effect
	useEffect(() => {
		if (!discountedProducts.length) return;
		const interval = setInterval(() => {
			let nextIndex = currentIndex + 1;
			if (nextIndex >= discountedProducts.length) nextIndex = 0;

			flatListRef.current?.scrollToOffset({
				offset: nextIndex * ITEM_WIDTH,
				animated: true,
			});

			setCurrentIndex(nextIndex);
		}, 2000);

		return () => clearInterval(interval);
	}, [currentIndex, discountedProducts]);

	if (loading) {
		return (
			<View
				style={{
					height: ITEM_HEIGHT,
					justifyContent: "center",
					alignItems: "center",
				}}
			>
				<ActivityIndicator size="large" color="#ffc300" />
				<Text>Loading discounted products...</Text>
			</View>
		);
	}

	const renderProduct = (product) => {
		const basePrice = product.price || 0;
		const discountPercent = product.discount || 0;
		const taxPercent = product.tax || 0;
		const bottleRefund = product.bottlerefund || 0;

		const discountAmount = (basePrice * discountPercent) / 100;
		const priceAfterDiscount = basePrice - discountAmount;
		const taxAmount = (priceAfterDiscount * taxPercent) / 100;
		const finalPrice = priceAfterDiscount + taxAmount + bottleRefund;

		return (
			<TouchableOpacity
				key={product._id}
				onPress={() => router.push(`/product/${product._id}`)}
				activeOpacity={0.8}
				style={styles.card}
			>
				<View style={styles.imageWrapper}>
					<Image
						source={{
							uri: product.picture || "https://via.placeholder.com/150",
						}}
						style={styles.image}
						resizeMode="contain"
					/>

					{product.stock === 0 && (
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
				<View style={styles.priceRow}>
					<Text style={styles.newPrice}>€{finalPrice.toFixed(2)}</Text>
				</View>
				<Text
					style={styles.name}
					numberOfLines={1}
					ellipsizeMode="tail" // ✅ Cut long titles with ...
				>
					{product.name}
				</Text>
			</TouchableOpacity>
		);
	};

	return (
		<View style={{ height: ITEM_HEIGHT + 50, backgroundColor: "#FFFFFF" }}>
			<View style={styles.header}>
				<Text style={styles.headerText}>Hot Sales</Text>
				<View style={styles.headerRight}>
					<TouchableOpacity
						style={styles.allButton}
						onPress={() => router.push("/shop?discount=true")}
					>
						<Text style={styles.allText}>All</Text>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => router.push("/shop?discount=true")}>
						<Feather name="chevron-right" size={24} color="#000000" />
					</TouchableOpacity>
				</View>
			</View>

			<FlatList
				ref={flatListRef}
				data={discountedProducts}
				horizontal
				showsHorizontalScrollIndicator={false}
				keyExtractor={(item) => item._id}
				renderItem={({ item }) => renderProduct(item)}
				onScroll={(e) => {
					const index = Math.round(e.nativeEvent.contentOffset.x / ITEM_WIDTH);
					setCurrentIndex(index);
				}}
				scrollEventThrottle={16}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		width: ITEM_WIDTH,
		marginHorizontal: 4,
		backgroundColor: "#FFFFFF",
		padding: 8,
		height: 160,
		position: "relative", // ✅ Required for absolute positioning inside
		overflow: "hidden",
	},

	imageWrapper: {
		position: "relative",
		width: "100%",
		height: 100,
		marginBottom: 6,
		backgroundColor: "#f9f9f9",
		justifyContent: "center",
		alignItems: "center",
	},
	image: { width: "100%", height: "100%" },
	overlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: "rgba(0,0,0,0.4)",
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 8,
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
	name: { fontSize: 14, fontWeight: "400", marginBottom: 4, color: "#777" },

	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 5,
		paddingHorizontal: 12,
		paddingVertical: 5,
	},
	headerText: { fontSize: 20, fontWeight: "700", color: "#000000" },
	headerRight: { flexDirection: "row", alignItems: "center" },
	allButton: {
		marginRight: 8,
		paddingHorizontal: 12,
		paddingVertical: 6,
	},
	allText: { fontSize: 18, fontWeight: "500", color: "#777" },
	priceRow: {
		position: "absolute",
		bottom: 8,
		left: 8,
	},
	newPrice: {
		fontSize: 13,
		fontWeight: "500",
		color: "#000000",
	},
});
