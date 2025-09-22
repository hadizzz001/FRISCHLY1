import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const CATEGORIES_URL = "https://frischly-server.onrender.com/api/categories";
const PRODUCTS_URL = "https://frischly-server.onrender.com/api/products";

export default function App() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const [loading, setLoading] = useState(false);

  // pagination & filters
  const [page, setPage] = useState(2);
  const [limit] = useState(1000); // you can change 
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState(null);
  const [maxPrice, setMaxPrice] = useState(null);
  const [inStock, setInStock] = useState(null);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
    fetchProducts(); // initial load
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(CATEGORIES_URL);
      const json = await res.json();
      if (json.success) {
        setCategories(json.data);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchProducts = async (catName = selectedCat) => { // ✅ using name not _id
    try {
      setLoading(true);

      // Build query params
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        sortBy,
        sortOrder,
      });

      if (catName) params.append("category", catName); // ✅ send category name
      if (search) params.append("search", search);
      if (minPrice !== null) params.append("minPrice", String(minPrice));
      if (maxPrice !== null) params.append("maxPrice", String(maxPrice));
      if (inStock !== null) params.append("inStock", String(inStock));

      console.log("Fetching products with params:", params.toString()); // ✅ debug

      const res = await fetch(`${PRODUCTS_URL}?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        setProducts(json.data);
        console.log("Products after filter:", json.data);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryPress = (cat) => {
    setSelectedCat(cat.name); // ✅ store category name
    setPage(1); // reset page on category change
    fetchProducts(cat.name); // ✅ fetch with category name
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Categories</Text>

      {/* Categories scrollable buttons */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat._id}
            style={[
              styles.categoryBtn,
              selectedCat === cat.name && styles.categoryBtnActive, // ✅ highlight by name
            ]}
            onPress={() => handleCategoryPress(cat)} 
          >
            <Text style={styles.catText}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.header}>Products</Text>

      {loading ? (
        <ActivityIndicator size="large" color="green" />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.productCard}>
              <Image source={{ uri: item.picture }} style={styles.productImage} />
              <Text numberOfLines={1} style={styles.productName}>
                {item.name}
              </Text>
              <Text style={styles.productPrice}>€ {item.price}</Text>
            </View>
          )}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          ListEmptyComponent={<Text>No products found</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: "#fff" },
  header: { fontSize: 18, fontWeight: "bold", marginVertical: 8 },
  scroll: { marginBottom: 12 },
  categoryBtn: {
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f9f9f9",
    width: 100,
  },
  categoryBtnActive: { 
    borderColor: "green",
    backgroundColor: "#e6ffe6",
  },
  catText: { fontSize: 12, textAlign: "center" },
  productCard: {
    flex: 1,
    marginBottom: 15,
    backgroundColor: "#f2f2f2",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  productImage: { width: 80, height: 80, marginBottom: 5 },
  productName: { fontSize: 12, fontWeight: "500", textAlign: "center" },
  productPrice: { marginTop: 4, fontWeight: "bold", color: "green" },
});
