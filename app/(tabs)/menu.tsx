import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
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

const { width } = Dimensions.get("window");
const NUM_COLUMNS = 2; // ✅ Set your number of columns here
const ITEM_WIDTH = width / NUM_COLUMNS - 20;
const ITEM_HEIGHT = 130;

export default function CategoriesGrid() {
	const router = useRouter();
	const [categories, setCategories] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchCategories = async () => {
			try {
				const res = await fetch(
					"https://frischlyshop-server.onrender.com/api/categories?limit=1000"
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
 
	const renderCategory = ({ item: category }) => (
		<TouchableOpacity
			key={category._id}
			onPress={() => router.push(`/shop1?category=${encodeURIComponent(category.name)}`)}
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
		<View style={{ backgroundColor: "#fff", paddingBottom: 20 }}>
			<FlatList
				key={`grid-${NUM_COLUMNS}`} // ✅ Force re-render when numColumns changes
				data={categories}
				renderItem={renderCategory}
				keyExtractor={(item) => item._id}
				numColumns={NUM_COLUMNS} // ✅ 2 columns
				contentContainerStyle={styles.gridContainer}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	gridContainer: {
		paddingHorizontal: 8,
	},
	card: {
		width: ITEM_WIDTH,
		margin: 8,
		backgroundColor: "transparent",
		alignItems: "center",
	},
	imageWrapper: {
		width: "100%",
		height: 100,
		backgroundColor: "#f9f9f9",
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 8,
		marginBottom: 6,
	},
	image: { width: "100%", height: "100%", borderRadius: 8 },
	name: {
		fontSize: 14,
		fontWeight: "500",
		color: "#333",
		textAlign: "center",
	},
});
