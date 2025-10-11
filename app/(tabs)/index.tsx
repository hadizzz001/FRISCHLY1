import CatSlider from "@/components/CatSlider";
import Footer from "@/components/Footer";
import ProductList from "@/components/ProductList";
import ProductSlide from "@/components/ProductSlide";
import { ScrollView } from "react-native";

export default function HomeScreen() {
	return (
		<>
			<ScrollView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
				<ProductSlide />
				<CatSlider />
				<ProductList />
				<Footer/>
			</ScrollView>
		</>
	);
}
