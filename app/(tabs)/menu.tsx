import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

export default function MenuScreen() {
	const [categories, setCategories] = useState<any[]>([]);
	const router = useRouter();

	// Fetch categories
	useEffect(() => {
		const fetchCategories = async () => {
			try {
				const res = await fetch(
					"https://frischly-server.onrender.com/api/categories"
				);
				const data = await res.json();
				setCategories(data.data);
			} catch (err) {
				console.error(err);
			}
		};
		fetchCategories();
	}, []);

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Categories</Text>
			<ScrollView contentContainerStyle={styles.content}>
				{categories.slice(0, 8).map((cat) => (
					<TouchableOpacity
						key={cat._id}
						onPress={() => {
							router.push(`/shop?category=${cat._id}`);
						}}
						style={styles.item}
					>
						<Text style={styles.itemText}>{cat.name}</Text>
					</TouchableOpacity>
				))}

				<TouchableOpacity
					onPress={() => {
						router.push("/shop");
					}}
					style={styles.item}
				>
					<Text style={styles.itemText}>All Categories</Text>
				</TouchableOpacity>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#FFFFFF",
		paddingTop: 60,
	},
	title: {
		fontSize: 22,
		fontWeight: "bold",
		color: "#000000",
		textAlign: "center",
		marginBottom: 20,
	},
	content: {
		paddingHorizontal: 20,
		alignItems: "center",
	},
	item: {
		marginVertical: 10,
	},
	itemText: {
		fontSize: 18,
		color: "#000000",
	},
});
