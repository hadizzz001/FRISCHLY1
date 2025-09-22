import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
    Dimensions,
    FlatList,
    Image,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const screenWidth = Dimensions.get("window").width;

const ResponsiveVideo = () => {
  const [categories, setCategories] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("https://diablocar.netlify.app/api/sub"); // Replace with your actual API
        const data = await response.json();
        setCategories(data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (name) => {
    navigation.navigate("Search", { brnd: name });
  };

  const renderItem = ({ item }) => (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        marginHorizontal: 5,
        marginBottom: 20,
      }}
    >
      <TouchableOpacity
        style={{
          width: screenWidth / 2 - 30,
          aspectRatio: 1,
          backgroundColor: "#fff",
          borderWidth: 1,
          borderColor: "#ddd",
          padding: 10,
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
        }}
        onPress={() => handleCategoryClick(item.name)}
      >
        <Image
          source={{ uri: item.img[0].replace("/upload/", "/upload/q_25/") }}
          style={{
            width: "100%",
            height: "100%",
          }}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => handleCategoryClick(item.name)}>
        <Text
          style={{
            marginTop: 8,
            backgroundColor: "#dc2626",
            color: "#fff",
            textAlign: "center",
            fontWeight: "bold",
            fontSize: 16,
            paddingVertical: 8,
            paddingHorizontal: 10,
            width: screenWidth / 2 - 30,
          }}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: 12,
        paddingTop: 20,
        backgroundColor: "#fff",
      }}
    >
      <FlatList
        data={categories}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        numColumns={2}
        columnWrapperStyle={{
          justifyContent: "space-between",
        }}
        contentContainerStyle={{
          paddingBottom: 40,
        }}
      />
    </View>
  );
};

export default ResponsiveVideo;
