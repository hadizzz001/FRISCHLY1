'use client';
import { useCart } from '@/contexts/CartContext';
import { Feather } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function TestOrder() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [productImages, setProductImages] = useState({}); // ✅ Cache for product images
	const router = useRouter();
  const { cart } = useCart();

  useEffect(() => {
    const checkLoginAndFetchOrders = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        const guest = await AsyncStorage.getItem('guest');

        if (!userData && !guest) return;

        const parsedUser = userData ? JSON.parse(userData) : null;
        const token = parsedUser?.token;
        if (!token) return;

        // Fetch user info
        const meRes = await fetch("https://frischly-server.onrender.com/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (meRes.ok) {
          const meData = await meRes.json();
          setUser(meData.data.user);
        }

        // Fetch orders
        const ordersRes = await fetch("https://frischly-server.onrender.com/api/orders", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          console.log("Fetched Orders:", ordersData);
          setOrders(ordersData.data || []);
        } else {
          console.error('Failed to fetch orders');
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    checkLoginAndFetchOrders();
  }, []);

  const fetchProductImage = async (productId) => {
    if (productImages[productId]) return productImages[productId]; // ✅ Cached version

    try {
      const res = await fetch(`https://frischly-server.onrender.com/api/products/${productId}`);
      const data = await res.json();
      const img = data?.data?.picture || null;

      setProductImages(prev => ({ ...prev, [productId]: img }));
      return img;
    } catch (e) {
      console.error("Error fetching product image", e);
      return null;
    }
  };

  const ProductRow = ({ item }) => {
    const [image, setImage] = useState(item.product.picture || null);

    useEffect(() => {
      if (!image) {
        fetchProductImage(item.product._id).then(setImage);
      }
    }, []);

    return (
      <View style={styles.itemRow}>
        <Image
          source={ image ? { uri: image } : '' }
          style={styles.itemImage}
        />
        <Text style={styles.itemText}>{item.product.name}</Text>
        <Text style={styles.itemText}>Qty: {item.quantity}</Text>
        <Text style={styles.itemText}>Price: ${item.totalPrice.toFixed(2)}</Text>
      </View>
    );
  };

  const renderOrderItem = (item) => (
    <View style={styles.itemsContainer}>
      {item.items.map((i) => (
        <ProductRow key={i._id} item={i} />
      ))}
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  if (!orders.length) {
    return (
      <View style={styles.container}>
        <Text>No orders found.</Text>
      </View>
    );
  }

  const toggleExpand = (id) => {
    setExpandedOrders(prev => ({ ...prev, [id]: !prev[id] }));
  };

const renderItem = ({ item }) => (
  <View style={styles.orderRow}>
    <TouchableOpacity style={styles.orderHeader} onPress={() => toggleExpand(item._id)}>
      <View style={{ flex: 2 }}>
        <Text style={styles.orderId}>{item.orderNumber}</Text>
      </View>

      <View style={{ flex: 2 }}>
        <Text>Subtotal: ${item.subtotal.toFixed(2)}</Text>
        <Text>Delivery: ${item.delivery?.toFixed(2) || "0.00"}</Text>
        <Text style={{ fontWeight: 'bold' }}>Total: ${(item.total).toFixed(2)}</Text>
      </View>

      <Feather
        name={expandedOrders[item._id] ? "chevron-up" : "chevron-down"}
        size={20}
        color="#000"
        style={{ flex: 0.5, textAlign: 'center' }}
      />
    </TouchableOpacity>

    {expandedOrders[item._id] && renderOrderItem(item)}
  </View>
);


  return (
    <View style={styles.container}>
            <TouchableOpacity onPress={() => router.back()} style={{marginBottom: 15}}>
              <Feather name="chevron-left" size={24} color="#000000" />
            </TouchableOpacity>
      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  orderRow: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#f2f2f2',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  orderId: {
    flex: 2,
    fontWeight: 'bold',
  },
  orderTotal: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  arrow: {
    flex: 0.5,
    textAlign: 'center',
  },
  itemsContainer: {
    padding: 10,
    backgroundColor: '#fff',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  itemImage: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  itemText: {
    flex: 1,
  },
});
