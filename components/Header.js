import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

export default function Header() {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");

  const handleSearchSubmit = () => {
    if (searchText.trim() !== "") {
      router.push(`/shop?search=${encodeURIComponent(searchText)}`);
    }
  };

  return (
    <View style={styles.topNav}>
      <TouchableOpacity onPress={() => router.push("/")}>
      {/* <TouchableOpacity onPress={() => router.push("/(tabs)")}> */}
        <Image
          source={{
            uri: "https://res.cloudinary.com/dtzuor7no/image/upload/v1757762617/logo1_qjt9ff.webp",
          }}
          style={styles.logo}
          resizeMode="contain"
        />
      </TouchableOpacity>
      <TextInput
        style={styles.searchBox}
        placeholder="Search..."
        placeholderTextColor="#555"
        value={searchText}
        onChangeText={setSearchText}
        returnKeyType="search"
        onSubmitEditing={handleSearchSubmit} // ✅ navigate on submit
      />
    </View>
  );
}

const styles = StyleSheet.create({
  topNav: {
    height: 80,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    zIndex: 10,
    marginTop: 30,
  },
  logo: {
    width: 60,
    height: 60,
  },
  searchBox: {
    flex: 1,
    height: 50,
    marginLeft: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    color: "#000",
  },
});
