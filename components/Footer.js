import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router"; // or next/navigation / @react-navigation/native
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Footer() {
  const [categories, setCategories] = useState([]);
  const [showPolicies, setShowPolicies] = useState(false);
  const [showCustomerCare, setShowCustomerCare] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("https://frischlyshop-server.onrender.com/api/categories");
        const data = await res.json();
        setCategories(data.data || []);
      } catch (e) {
        console.error("Error fetching categories:", e);
      }
    };
    fetchCategories();
  }, []);

  const sections = [
    {
      label: "Policies",
      isOpen: showPolicies,
      toggle: () => setShowPolicies(!showPolicies),
      items: [
        { text: "Privacy Policy", action: () => router.push("privacy") }, 
        { text: "Terms of Service", action: () => router.push("term") },
      ],
    },
    { 
      label: "Customer Care",
      isOpen: showCustomerCare,
      toggle: () => setShowCustomerCare(!showCustomerCare),
      items: [{ text: "Contact Us", action: () => router.push("https://wa.me/ ") }],
    },
    {
      label: "Categories",
      isOpen: showCategories,
      toggle: () => setShowCategories(!showCategories),
      items: categories.map((cat) => ({
        text: cat.name,
        action: () => router.push(`shop1?category=${encodeURIComponent(cat.name)}`),
      })),
    },
  ];

  return (
  <View style={styles.footer}>
 
      {/* Sections */}
      {sections.map((sec, i) => (
        <View key={i} style={styles.section}>
          <TouchableOpacity onPress={sec.toggle} style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{sec.label}</Text>
            <AntDesign name={sec.isOpen ? "up" : "down"} size={16} color="black" />
          </TouchableOpacity>
          {sec.isOpen && (
            <View style={styles.sectionItems}>
              {sec.items.map((item, j) => (
                <TouchableOpacity key={j} onPress={item.action}>
                  <Text style={styles.linkText}>{item.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      ))}

      {/* Social Icons */}
      {/* <View style={styles.socialRow}>
        <TouchableOpacity onPress={() => Linking.openURL("https://www.instagram.com/diablo.hobbyshop/?hl=en")}>
          <View style={[styles.circle, { backgroundColor: "#E1306C" }]}><FontAwesome name="instagram" size={24} color="white" /></View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Linking.openURL("https://www.facebook.com/p/Diablo-Hobby-Shop-61558014394197/")}>
          <View style={[styles.circle, { backgroundColor: "#1877F2" }]}><FontAwesome name="facebook" size={24} color="white" /></View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Linking.openURL("https://wa.me/96181820902")}>
          <View style={[styles.circle, { backgroundColor: "#25D366" }]}><FontAwesome name="whatsapp" size={24} color="white" /></View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Linking.openURL("https://www.tiktok.com/@diablohobbyshop.lb")}>
          <View style={[styles.circle, { backgroundColor: "black" }]}><FontAwesome5 name="tiktok" size={20} color="white" /></View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Linking.openURL("tel:+96181820902")}>
          <View style={[styles.circle, { backgroundColor: "red" }]}><Feather name="phone" size={20} color="white" /></View>
        </TouchableOpacity>
      </View> */}

      {/* Bottom text */}
      <Text style={styles.bottomText}>
        © Frischly Shop {new Date().getFullYear()} ALL RIGHTS RESERVED
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: { backgroundColor: "#f8f8f8", padding: 20 },
  iconRow: { flexDirection: "row", justifyContent: "center", flexWrap: "wrap", marginBottom: 20 },
  payIcon: { width: 60, height: 40, margin: 5, resizeMode: "contain" },
  section: { marginVertical: 10, borderBottomWidth: 1, borderColor: "#ccc", paddingBottom: 10 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontSize: 16, fontWeight: "bold" },
  sectionItems: { marginTop: 10 },
  linkText: { fontSize: 14, color: "#444", marginVertical: 4 },
  socialRow: { flexDirection: "row", justifyContent: "center", gap: 12, marginVertical: 20 },
  circle: { width: 40, height: 40, borderRadius: 30, justifyContent: "center", alignItems: "center" },
  bottomText: { textAlign: "center", marginVertical: 20, fontSize: 12, color: "#666" },
});
