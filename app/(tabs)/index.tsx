// @ts-ignore
import CatSlider from "@/components/CatSlider.js";
// @ts-ignore
import Footer from "@/components/Footer.js";
// @ts-ignore
import ProductList from "@/components/ProductList.js";
// @ts-ignore
import ProductSlide from "@/components/ProductSlide.js";
import { useState } from "react";
import { RefreshControl, ScrollView } from "react-native";

export default function HomeScreen() {
	const [refreshing, setRefreshing] = useState(false);
	const [refreshTrigger, setRefreshTrigger] = useState(0);

	const onRefresh = () => {
		setRefreshTrigger((prev) => prev + 1);
	};

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
				<ProductList
					refreshTrigger={refreshTrigger}
					setRefreshing={setRefreshing}
				/>
				<Footer />
			</ScrollView>
		</>
	);
}
