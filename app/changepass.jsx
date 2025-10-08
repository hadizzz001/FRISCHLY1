"use client";

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// Simple visible password input
function VisiblePasswordInput({ value, onChangeText, placeholder }) {
  return (
    <View style={styles.inputContainer}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        style={styles.input}
        autoCapitalize="none"
        placeholderTextColor="#888"
      />
    </View>
  );
}

export default function ChangePassword() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const screenHeight = Dimensions.get("window").height;

  useEffect(() => {
    const checkLogin = async () => {
      const userData = await AsyncStorage.getItem("userData");
      if (!userData) router.replace("/start");
    };
    checkLogin();
  }, []);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return Alert.alert("Error", "Please fill in all fields");
    }
    if (newPassword !== confirmPassword) {
      return Alert.alert("Error", "New password and confirm password do not match");
    }

    setLoading(true);
    try {
      const userData = await AsyncStorage.getItem("userData");
      const token = userData ? JSON.parse(userData)?.token : null;
      if (!token) return Alert.alert("Error", "User not authenticated");

      const res = await axios.put(
        "https://frischlyshop-server.onrender.com/api/auth/change-password",
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );

      if (res.data?.success) {
        Alert.alert("Success", res.data.message);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        Alert.alert("Error", res.data?.message || "Failed to update password");
      }
    } catch (error) {
      console.error("Change password error:", error.response?.data || error.message);
      Alert.alert("Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "#fff" }} behavior="padding">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View
          style={{
            height: screenHeight * 0.4,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#ffc300",
            borderBottomLeftRadius: 60,
            borderBottomRightRadius: 60,
            overflow: "hidden",
          }}
        >
          <Text style={{ fontSize: 28, fontWeight: "bold", color: "#000" }}>
            Change Password
          </Text>
        </View>

        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 24, backgroundColor: "#fff", marginTop: 30 }}>
          <VisiblePasswordInput
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Current Password"
          />
          <VisiblePasswordInput
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="New Password"
          />
          <VisiblePasswordInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm New Password"
          />

          <TouchableOpacity
            onPress={handleChangePassword}
            disabled={loading}
            style={{
              backgroundColor: loading ? "#cccccc" : "#ffc300",
              borderRadius: 15,
              paddingVertical: 15,
              width: "100%",
              alignItems: "center",
              marginTop: 20,
            }}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>
                Update Password
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ height: 200 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    backgroundColor: "#fff",
    marginBottom: 12,
  },
  input: {
    flex: 1,
    padding: 15,
    color: "#000",
  },
});
