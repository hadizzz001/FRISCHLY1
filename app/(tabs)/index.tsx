import CatSlider from "@/components/CatSlider";
import Footer from "@/components/Footer";
import ProductList from "@/components/ProductList";
import ProductSlide from "@/components/ProductSlide";
import { useCallback, useState } from "react";
import { RefreshControl, ScrollView } from "react-native";

export default function HomeScreen() {
	const [refreshing, setRefreshing] = useState(false);
	const [refreshTrigger, setRefreshTrigger] = useState(0);

	const onRefresh = useCallback(() => {
		setRefreshing(true);
		setRefreshTrigger((prev) => prev + 1);
		setTimeout(() => setRefreshing(false), 1000); // Simulate refresh delay
	}, []);

	return (
		<>
			<ScrollView
				style={{ flex: 1, backgroundColor: "#FFFFFF" }}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
				}
			>
				<ProductSlide refreshTrigger={refreshTrigger} />
				<CatSlider refreshTrigger={refreshTrigger} />
				<ProductList refreshTrigger={refreshTrigger} />
				<Footer />
			</ScrollView>
		</>
	);
}
