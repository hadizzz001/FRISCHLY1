import Cart from "@/components/Cart";
import { View } from "react-native";

export default function CartScreen() {
	return (
		<View style={{ flex: 1, backgroundColor: "#FFFFFF", paddingTop: 60 }}>
			<Cart />
		</View>
	);
}
