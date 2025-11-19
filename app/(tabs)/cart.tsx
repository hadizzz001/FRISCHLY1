import Cart from "@/components/Cart";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CartScreen() {
  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={{ flex: 1, backgroundColor: "#FFFFFF" }}
    >
      <View style={{ flex: 1, paddingTop: 20, paddingBottom: 80 }}>
        <Cart />
      </View>
    </SafeAreaView>
  );
}
