import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function EditProfile() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  const [zones, setZones] = useState([]); // <-- ZIP zones

  const [form, setForm] = useState({
    name: "",
    phoneNumber: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });

  console.log("user data in EditProfile:", user);

  useEffect(() => {
    const checkLogin = async () => {
      const userData = await AsyncStorage.getItem("userData");
      const guest = await AsyncStorage.getItem("guest");

      if (!userData && !guest) {
        router.replace("/start");
      } else {
        try {
          const parsedUser = userData ? JSON.parse(userData) : null;
          const token = parsedUser?.token;

          if (!token) {
            console.error("⚠️ No token found in userData");
            return;
          }

          const res = await fetch("https://frischly-server.onrender.com/api/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          if (res.ok) {
            const data = await res.json();
            setUser(data.data.user);

            setForm({
              name: data.data.user.name || "",
              phoneNumber: data.data.user.phoneNumber || "",
              street: data.data.user.address?.street || "",
              city: data.data.user.address?.city || "",
              state: data.data.user.address?.state || "",
              zipCode: data.data.user.address?.zipCode || "",
              country: data.data.user.address?.country || "",
            });
          } else {
            console.error("❌ Failed to fetch user:", res.status);
          }
        } catch (err) {
          console.error("🔥 Network/Fetch error:", err);
        }
      }
    };

    const fetchZones = async () => {
      try {
        const res = await fetch("https://frischly-server.onrender.com/api/zones");
        const data = await res.json();
        if (res.ok) setZones(data.data || []);
      } catch (err) {
        console.error("⚠️ Failed to fetch zones:", err);
      }
    };

    checkLogin();
    fetchZones();
  }, [router]);

  const handleUpdate = async () => {
    try {
      const stored = await AsyncStorage.getItem("userData");
      if (!stored) {
        Alert.alert("Warning!", "⚠️ No user data found");
        return;
      }

      const { token } = JSON.parse(stored);

      const payload = {
        name: form.name,
        phoneNumber: form.phoneNumber,
        address: {
          street: form.street,
          city: form.city,
          state: form.state,
          zipCode: form.zipCode,
          country: form.country, // ✅ still included but read-only
        },
      };

      const res = await fetch("https://frischly-server.onrender.com/api/auth/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        Alert.alert("Success!", "✅ Profile updated!");
        router.back();
      } else {
        Alert.alert("Error!", "❌ Update failed: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("🔥 Unexpected error:", err);
      alert("⚠️ Something went wrong! Check console logs.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Feather name="chevron-left" size={24} color="#000000" />
      </TouchableOpacity>

      {["name", "phoneNumber"].map((key) => (
        <View key={key} style={{ marginBottom: 12 }}>
          <Text style={styles.label}>{key === "phoneNumber" ? "Phone Number" : "Name"}</Text>
          <TextInput
            style={styles.input}
            value={form[key]}
            onChangeText={(val) => setForm({ ...form, [key]: val })}
          />
        </View>
      ))}

      {["street", "city", "state"].map((key) => (
        <View key={key} style={{ marginBottom: 12 }}>
          <Text style={styles.label}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
          <TextInput
            style={styles.input}
            value={form[key]}
            onChangeText={(val) => setForm({ ...form, [key]: val })}
          />
        </View>
      ))}

      {/* ZIP Code Dropdown */}
      <View
        style={{
          marginBottom: 12,
          width: "100%",
          minHeight: 55,
          borderWidth: 1,
          borderColor: "#000000",
          borderRadius: 12,
          backgroundColor: "#FFFFFF",
          justifyContent: "center",
        }}
      >
        <Text style={[styles.label, { marginLeft: 10 }]}>ZIP Code</Text>
        <Picker
          selectedValue={form.zipCode}
          onValueChange={(itemValue) => setForm({ ...form, zipCode: itemValue })}
          style={{ color: "#000" }}
        >
          <Picker.Item label="Select Zip Code" value="" />
          {zones.map((zone) => (
            <Picker.Item
              key={zone._id}
              label={`${zone.zipCode} — ${zone.zoneName}`}
              value={zone.zipCode}
            />
          ))}
        </Picker>
      </View>

      {/* Country - Read Only */}
      <View style={{ marginBottom: 12 }}>
        <Text style={styles.label}>Country</Text>
        <TextInput
          style={[styles.input, { backgroundColor: "#f4f4f4" }]}
          value={form.country}
          editable={false}
        />
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate}>
        <Text style={styles.saveText}>Save Changes</Text>
      </TouchableOpacity>

      <View style={{ height: 220 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff" },
  label: { marginBottom: 4, color: "#555" },
  input: { borderWidth: 1, padding: 12, borderRadius: 15, borderColor: "#ccc" },
  saveBtn: { backgroundColor: "#FFC300", padding: 16, borderRadius: 12, marginTop: 16 },
  saveText: { textAlign: "center", fontWeight: "600" },
  backButton: { marginBottom: 20 },
});
