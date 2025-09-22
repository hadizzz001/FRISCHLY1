import { AntDesign, Feather, FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Footer() {
  const [categories, setCategories] = useState([]);
  const [showPolicies, setShowPolicies] = useState(false);
  const [showCustomerCare, setShowCustomerCare] = useState(false);
  const [showCategories, setShowCategories] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("https://diablocar.netlify.app/api/category");
        const data = await res.json();
        setCategories(data);
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
        { text: "Privacy Policy", link: "https://your-site.com/privacy" },
        { text: "Terms of Service", link: "https://your-site.com/term" },
      ],
    },
    {
      label: "Customer Care",
      isOpen: showCustomerCare,
      toggle: () => setShowCustomerCare(!showCustomerCare),
      items: [{ text: "Contact Us", link: "https://your-site.com/contact" }],
    },
    {
      label: "Category",
      isOpen: showCategories,
      toggle: () => setShowCategories(!showCategories),
      items: categories.map((cat) => ({
        text: cat.name,
        link: `https://your-site.com/search?cat=${encodeURIComponent(cat.name)}`,
      })),
    },
  ];

  return (
    <ScrollView style={styles.footer}>
      {/* Payment methods */}
<View style={styles.iconRow}>
  {/* Payment Icons */}
  <Image source={{ uri: "https://res.cloudinary.com/dlqj4aigl/image/upload/v1756231450/icon_visa_footer_ysxrzi.webp" }} style={styles.payIcon} />
  <Image source={{ uri: "https://res.cloudinary.com/dlqj4aigl/image/upload/v1756231450/icon_sofort_footer_ggbmjy.webp" }} style={styles.payIcon} />
  <Image source={{ uri: "https://res.cloudinary.com/dlqj4aigl/image/upload/v1756231450/icon_amazonpay_footer_tkdjol.webp" }} style={styles.payIcon} />
  <Image source={{ uri: "https://res.cloudinary.com/dlqj4aigl/image/upload/v1756231449/icon_mastercard_footer_cfsb4w.webp" }} style={styles.payIcon} />
  <Image source={{ uri: "https://res.cloudinary.com/dlqj4aigl/image/upload/v1756231449/download_q2d8zb.png" }} style={styles.payIcon} />
  <Image source={{ uri: "https://res.cloudinary.com/dlqj4aigl/image/upload/v1756231449/icon_paypal_footer_hjtb3i.webp" }} style={styles.payIcon} />
</View>

{/* Delivery Brands */}
<View style={[styles.iconRow, { borderBottomWidth: 1, borderColor: "#c5c5c5", paddingBottom: 12 }]}>
  <Image source={{ uri: "https://res.cloudinary.com/dlqj4aigl/image/upload/v1756231450/icon_nachnahme_footer_pqskg5.webp" }} style={styles.payIcon} />
  <Image source={{ uri: "https://res.cloudinary.com/dlqj4aigl/image/upload/v1756231449/icon_amex_footer_vttyqp.webp" }} style={styles.payIcon} />
  <Image source={{ uri: "https://res.cloudinary.com/dlqj4aigl/image/upload/v1756231449/icon_vorkasse_footer_ulluzy.webp" }} style={styles.payIcon} />
  <Image source={{ uri: "https://res.cloudinary.com/dlqj4aigl/image/upload/v1756231449/images_kamftn.jpg" }} style={styles.payIcon} />
</View>


      {/* Sections (accordion style for mobile) */}
      {sections.map((sec, i) => (
        <View key={i} style={styles.section}>
          <TouchableOpacity onPress={sec.toggle} style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{sec.label}</Text>
            <AntDesign
              name={sec.isOpen ? "up" : "down"}
              size={16}
              color="black"
            />
          </TouchableOpacity>
          {sec.isOpen && (
            <View style={styles.sectionItems}>
              {sec.items.map((item, j) => (
                <TouchableOpacity key={j} onPress={() => Linking.openURL(item.link)}>
                  <Text style={styles.linkText}>{item.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      ))}

      {/* Social Icons */}
<View style={styles.socialRow}>
  <TouchableOpacity onPress={() => Linking.openURL("https://www.instagram.com/diablo.hobbyshop/?hl=en")}>
    <View style={[styles.circle, { backgroundColor: "#E1306C" }]}>
      <FontAwesome name="instagram" size={24} color="white" />
    </View>
  </TouchableOpacity>

  <TouchableOpacity onPress={() => Linking.openURL("https://www.facebook.com/p/Diablo-Hobby-Shop-61558014394197/")}>
    <View style={[styles.circle, { backgroundColor: "#1877F2" }]}>
      <FontAwesome name="facebook" size={24} color="white" />
    </View>
  </TouchableOpacity>

  <TouchableOpacity onPress={() => Linking.openURL("https://wa.me/96181820902")}>
    <View style={[styles.circle, { backgroundColor: "#25D366" }]}>
      <FontAwesome name="whatsapp" size={24} color="white" />
    </View>
  </TouchableOpacity>

  <TouchableOpacity onPress={() => Linking.openURL("https://www.tiktok.com/@diablohobbyshop.lb")}>
    <View style={[styles.circle, { backgroundColor: "black" }]}>
      <FontAwesome5 name="tiktok" size={20} color="white" />
    </View>
  </TouchableOpacity>

  <TouchableOpacity onPress={() => Linking.openURL("tel:+96181820902")}>
    <View style={[styles.circle, { backgroundColor: "red" }]}>
      <Feather name="phone" size={20} color="white" />
    </View>
  </TouchableOpacity>
</View>


      {/* Bottom text */}
      <Text style={styles.bottomText}>
        © Diablo Hobby Shop {new Date().getFullYear()} ALL RIGHTS RESERVED
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: "#f8f8f8",
    padding: 20,
  },
  iconRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  payIcon: {
    width: 60,
    height: 40,
    margin: 5,
    resizeMode: "contain",
  },
  section: {
    marginVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    paddingBottom: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  sectionItems: {
    marginTop: 10,
  },
  linkText: {
    fontSize: 14,
    color: "#444",
    marginVertical: 4,
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 20,
    gap: 15,
  },
  socialIcon: {
    padding: 10,
    borderRadius: 50,
    marginHorizontal: 5,
    textAlign: "center",
    overflow: "hidden",
  },
  bottomText: {
    textAlign: "center",
    marginVertical: 20,
    fontSize: 12,
    color: "#666",
  },

    socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12, // for spacing (React Native 0.71+), otherwise use marginRight
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 30, // half of width/height → perfect circle
    justifyContent: "center",
    alignItems: "center",
  },
});

 