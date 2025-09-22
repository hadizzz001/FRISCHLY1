import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useReducer, useState } from "react";

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case "ADD_TO_CART":
      return action.payload;
    case "UPDATE_CART":
      return action.payload;
    case "REMOVE_FROM_CART":
      return state.filter((item) => item._id !== action.payload);
    case "CLEAR_CART":
      return [];
    default:
      return state;
  }
};

const CartProvider = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, []);
  const [quantities, setQuantities] = useState({}); 
  const [subtotal, setSubtotal] = useState(0);

  // Load data from AsyncStorage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedCart = await AsyncStorage.getItem("cart");
        const storedQuantities = await AsyncStorage.getItem("quantities"); 

        if (storedCart)
          dispatch({ type: "ADD_TO_CART", payload: JSON.parse(storedCart || "[]") });
        if (storedQuantities)
          setQuantities(JSON.parse(storedQuantities || "{}"));

      } catch (error) {
        console.error("Error loading cart data:", error);
      }
    };

    loadData();
  }, []);

  // Save cart
  useEffect(() => {
    AsyncStorage.setItem("cart", JSON.stringify(cart)).catch(console.error);
  }, [cart]);

  // Save quantities
  useEffect(() => { 
    AsyncStorage.setItem("quantities", JSON.stringify(quantities)).catch(console.error);
  }, [quantities]);

  // Helper: Calculate price breakdown for one item 
const calculatePriceDetails = (item, quantity = 1) => {
  const basePrice = parseFloat(item.price) || 0;
  const discountPercent = parseFloat(item.discount) || 0;
  const taxPercent = parseFloat(item.tax) || 0;
  const bottleRefund = parseFloat(item.bottlerefund) || 0;

  // Step 1: discount
  const discountAmount = (basePrice * discountPercent) / 100;
  const afterDiscount = basePrice - discountAmount;

  // Step 2: tax
  const taxAmount = (afterDiscount * taxPercent) / 100;

  // Step 3: final price
  const finalPrice = (afterDiscount + taxAmount + bottleRefund) * quantity;

  // Log all details
  console.log(`Price Calculation for "${item.name || item._id}":`);
  console.log(`  Base Price: €${basePrice.toFixed(2)}`);
  console.log(`  Discount: ${discountPercent}% (-€${discountAmount.toFixed(2)})`);
  console.log(`  After Discount: €${afterDiscount.toFixed(2)}`);
  console.log(`  Tax: ${taxPercent}% (+€${taxAmount.toFixed(2)})`);
  console.log(`  Bottle Refund: +€${bottleRefund.toFixed(2)}`);
  console.log(`  Quantity: ${quantity}`);
  console.log(`  Final Price: €${finalPrice.toFixed(2)}`);
  console.log('-----------------------------------');

  return {
    basePrice,
    discountPercent,
    discountAmount,
    afterDiscount,
    taxPercent,
    taxAmount,
    bottleRefund,
    quantity,
    finalPrice,
  };
};


  // Calculate subtotal whenever cart or quantities change
  useEffect(() => {
    const newSubtotal = cart.reduce((acc, item) => {
      const quantity = quantities[item._id] || 1;
      const { finalPrice } = calculatePriceDetails(item, quantity);
      return acc + finalPrice;
    }, 0);

    setSubtotal(newSubtotal);
  }, [quantities, cart]);

  // Add to cart
  const addToCart = (item, quantity = 1) => {
    const existingCartItemIndex = cart.findIndex(
      (cartItem) => String(cartItem._id) === String(item._id)
    );

    if (existingCartItemIndex !== -1) {
      setQuantities((prev) => ({
        ...prev,
        [item._id]: quantity,
      }));

      dispatch({
        type: "UPDATE_CART",
        payload: cart.map((cartItem) =>
          String(cartItem._id) === String(item._id)
            ? { ...cartItem, quantity }
            : cartItem
        ),
      });
    } else {
      dispatch({
        type: "ADD_TO_CART",
        payload: [
          ...cart,
          { ...item, quantity },
        ],
      });

      setQuantities((prev) => ({ ...prev, [item._id]: quantity }));
    }
  };

  // Remove from cart
  const removeFromCart = (itemId) => {
    dispatch({ type: "REMOVE_FROM_CART", payload: itemId });

    setQuantities((prev) => {
      const { [itemId]: removedItem, ...newQuantities } = prev;
      return newQuantities;
    });
  };

  // Clear cart
  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
    setQuantities({});
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        quantities,
        subtotal,
        calculatePriceDetails, // expose helper for UI
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};

export { CartProvider, useCart };

