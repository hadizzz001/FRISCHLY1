import { useBooleanValue } from "@/contexts/CartBoolContext";
import { useCart } from "@/contexts/CartContext";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const Cart = () => {
  const { cart, removeFromCart, quantities, subtotal, addToCart } = useCart();
  const [localQuantities, setLocalQuantities] = useState(quantities);
  const { isBooleanValue, setBooleanValue } = useBooleanValue();
  const navigation = useNavigation();

  useEffect(() => {
    setLocalQuantities(quantities);
  }, [quantities]);

  const handleRemoveFromCart = (itemId) => {
    removeFromCart(itemId);
  };






  const goToCart = () => navigation.navigate('checkout');
 

  return ( 
    <View style={styles.container}>
      <Text style={styles.heading}>Your Shopping Bag</Text>

      <ScrollView style={styles.cartList}>
        {cart && cart.length > 0 ? (
          cart.map((obj) => (
            <View key={obj._id} style={styles.cartItem}>
              <Image source={{ uri: obj.picture }} style={styles.itemImage} />


              <View style={styles.details}>
                <Text style={styles.itemTitle}>{obj.name}</Text>

                <View style={styles.quantityRow}>
                  <Text style={styles.label}>Qty:{String(localQuantities[obj._id] || 1)}</Text>
             
                </View>

                <Text style={styles.price}>
                  €{(obj.finalPrice * (localQuantities[obj._id] || 1)).toFixed(2)}
                </Text>

              </View>

              {/* Close "X" Icon */}
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => handleRemoveFromCart(obj._id)}
              >
                <Ionicons name="trash" size={20} color="red" />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>
            You have no items in your shopping bag.
          </Text>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.total}>Total: €{subtotal.toFixed(2)} </Text>

        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={goToCart}
        >
          <Text style={styles.checkoutText}>Go to Checkout</Text>
        </TouchableOpacity>
      </View>
    </View> 
  );
};

export default Cart;


const styles = StyleSheet.create({ 
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff", 
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center", // center the heading
  },
  cartList: {
    flex: 1,
    marginBottom: 10,
  },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    position: "relative",
    overflow: "visible", // <-- make sure remove button is visible
  },

  removeBtn: {
    position: "absolute",
    top: 50,      // slightly above the item container
    right: 50,    // slightly outside the right edge
    width: 40,
    height: 40,
    backgroundColor: "transparent",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 99999999,   // <-- very high to be on top 
  },

  itemImage: {
    width: 80,
    height: 80,
    marginRight: 10,
    borderRadius: 6,
  },
  details: {
    flex: 1,
  },
  itemTitle: { 
    marginBottom: 4,
    fontSize: 16,
  },
  itemCategory: {
    fontSize: 12,
    color: "#555",
    marginBottom: 4,
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  label: {
    marginRight: 5,
  },
  qtyInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    width: 50,
    height: 50,
    textAlign: "center",
    borderRadius: 6,
  },
  price: {
    marginTop: 6,
    fontWeight: "bold",
    color: "#333",
  },

  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#777",
  },
  footer: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: "#ddd",
    marginBottom: 20,
  },
  total: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  checkoutBtn: {
    backgroundColor: "#ffc300",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  checkoutText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
