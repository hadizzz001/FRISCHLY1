import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Dimensions,
	Image,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import Feather from "react-native-vector-icons/Feather";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = width / 2 - 20;
const ITEM_HEIGHT = 200;

export default function CategoriesCarousel() {
	const router = useRouter();
	const [categories, setCategories] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchCategories = async () => {
			try {
				const res = await fetch(
					"https://frischly-server.onrender.com/api/categories?limit=1000"
				);
				const json = await res.json();
				setCategories(json.data || []);
			} catch (err) {
				console.error(err);
			} finally {
				setLoading(false);
			}
		};
		fetchCategories();
	}, []);

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
				<Text>Loading categories...</Text>
			</View>
		);
	}

	// Limit to 5 items
	const limitedCategories = categories.slice(0, 6);

	// Group 2 items per slide
	const groupedData = [];
	for (let i = 0; i < limitedCategories.length; i += 2) {
		groupedData.push(limitedCategories.slice(i, i + 2));
	}

	// Render each category
	const renderCategory = (category) => (
		<TouchableOpacity
			key={category._id}
			onPress={() => router.push(`/shop?category=${category.name}`)}
			activeOpacity={0.8}
			style={styles.card}
		>
			<View style={styles.imageWrapper}>
				<Image
					source={{ uri: category.image }}
					style={styles.image}
					resizeMode="contain"
				/>
			</View>
			<Text style={styles.name} numberOfLines={2}>
				{category.name}
			</Text>
		</TouchableOpacity>
	);

	return (
		<View
			style={{ height: ITEM_HEIGHT, marginTop: 30, backgroundColor: "#fff" }}
		>
			<View style={styles.header}>
				<Text style={styles.headerText}>Shop by Category</Text>
				<View style={styles.headerRight}>
					<TouchableOpacity
						style={styles.allButton}
						onPress={() => router.push("/shop")}
					>
						<Text style={styles.allText}>All</Text>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => router.push("/shop")}>
						<Feather name="chevron-right" size={24} color="#777" />
					</TouchableOpacity>
				</View>
			</View>

			<Carousel
				loop
				autoPlayInterval={2000}
				width={ITEM_WIDTH * 2 + 10}
				height={ITEM_HEIGHT}
				data={groupedData}
				scrollAnimationDuration={800}
				renderItem={({ item }) => (
					<View style={{ flexDirection: "row" }}>
						{item.map(renderCategory)}
					</View>
				)}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		width: ITEM_WIDTH,
		margin: 5,
		backgroundColor: "transparent",
		padding: 8,
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
	image: { width: "100%", height: "100%", borderRadius: 8 },
	name: { fontSize: 14, fontWeight: "500", color: "#333", textAlign: "center" },
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 8,
		paddingHorizontal: 12,
		paddingVertical: 8,
	},
	headerText: { fontSize: 20, fontWeight: "700", color: "#000" },
	headerRight: { flexDirection: "row", alignItems: "center" },
	allButton: {
		marginRight: 8,
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 6,
	},
	allText: { fontSize: 18, fontWeight: "500", color: "#777" },
});
