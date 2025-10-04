import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

export default function AccScreen() {
	const [user, setUser] = useState<any>(null);
	const router = useRouter(); 


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

					const res = await fetch(
						"https://frischly-server.onrender.com/api/auth/me",
						{
							headers: {
								Authorization: `Bearer ${token}`,
								"Content-Type": "application/json",
							},
						}
					);

					if (res.ok) {
						const data = await res.json();
						setUser(data.data.user);
					} else {
						console.error("❌ Failed to fetch user:", res.status);
					}
				} catch (err) {
					console.error("🔥 Network/Fetch error:", err);
				}
			}
		};
		checkLogin();
	}, [router]);

	return (
		<ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
			{/* Header Section */}
			<View style={styles.header}>
				<View style={styles.avatarContainer}>
					<View style={styles.avatar}>
						<Feather name="user" size={40} color="#FFC300" />
					</View>
				</View>
				<Text style={styles.title}>My Profile</Text>
				<Text style={styles.subtitle}>
					{user ? "Manage your account" : "Welcome, Guest"}
				</Text>
			</View>

			{/* User Info Card */}
			{user ? (
				<View style={styles.infoCard}>
					<Text style={styles.cardTitle}>Account Information</Text>

					{/* Basic Information Section */}
					<View style={styles.infoRow}>
						<View style={styles.iconContainer}>
							<Feather name="user" size={20} color="#FFC300" />
						</View>
						<View style={styles.infoContent}>
							<Text style={styles.infoLabel}>Name</Text>
							<Text style={styles.infoValue}>{user.name}</Text>
						</View>
					</View>

					<View style={styles.infoRow}>
						<View style={styles.iconContainer}>
							<Feather name="mail" size={20} color="#FFC300" />
						</View>
						<View style={styles.infoContent}>
							<Text style={styles.infoLabel}>Email</Text>
							<Text style={styles.infoValue}>{user.email}</Text>
						</View>
					</View>

					<View style={styles.infoRow}>
						<View style={styles.iconContainer}>
							<Feather name="phone" size={20} color="#FFC300" />
						</View>
						<View style={styles.infoContent}>
							<Text style={styles.infoLabel}>Phone</Text>
							<Text style={styles.infoValue}>{user.phoneNumber}</Text>
						</View>
					</View>

					{/* Address Section */}
					<View style={styles.addressSection}>
						<Text style={styles.sectionTitle}>Address</Text>

						<View style={styles.infoRow}>
							<View style={styles.iconContainer}>
								<Feather name="map-pin" size={20} color="#FFC300" />
							</View>
							<View style={styles.infoContent}>
								<Text style={styles.infoLabel}>Street</Text>
								<Text style={styles.infoValue}>
									{user.address?.street || "Not provided"}
								</Text>
							</View>
						</View>

						<View style={styles.infoRow}>
							<View style={styles.iconContainer}>
								<Feather name="map" size={20} color="#FFC300" />
							</View>
							<View style={styles.infoContent}>
								<Text style={styles.infoLabel}>City</Text>
								<Text style={styles.infoValue}>
									{user.address?.city || "Not provided"}
								</Text>
							</View>
						</View>

						<View style={styles.infoRow}>
							<View style={styles.iconContainer}>
								<Feather name="navigation" size={20} color="#FFC300" />
							</View>
							<View style={styles.infoContent}>
								<Text style={styles.infoLabel}>State</Text>
								<Text style={styles.infoValue}>
									{user.address?.state || "Not provided"}
								</Text>
							</View>
						</View>

						<View style={styles.infoRow}>
							<View style={styles.iconContainer}>
								<Feather name="hash" size={20} color="#FFC300" />
							</View>
							<View style={styles.infoContent}>
								<Text style={styles.infoLabel}>Zip Code</Text>
								<Text style={styles.infoValue}>
									{user.address?.zipCode || "Not provided"}
								</Text>
							</View>
						</View>

						<View style={styles.infoRow}>
							<View style={styles.iconContainer}>
								<Feather name="globe" size={20} color="#FFC300" />
							</View>
							<View style={styles.infoContent}>
								<Text style={styles.infoLabel}>Country</Text>
								<Text style={styles.infoValue}>
									{user.address?.country || "Not provided"}
								</Text>
							</View>
						</View>
					</View>
				</View>
			) : (
				<View style={styles.guestCard}>
					<Feather name="user-x" size={48} color="#FFC300" />
					<Text style={styles.guestText}>You're browsing as a guest</Text>
					<Text style={styles.guestSubtext}>
						Sign in to access your account
					</Text>
				</View>
			)}

{/* Action Buttons */}
<View style={styles.actionsContainer}>

	{user && (
	<>
		{/* Row with Edit & Change Password */}
		<View style={{ flexDirection: "row", justifyContent: "space-between" }}>
			<TouchableOpacity
				style={[styles.actionButton, styles.loginButton, { flex: 1, marginRight: 4 }]}
				onPress={() => router.push("/edit-profile")}
			>
				<Feather name="edit" size={20} color="#000" style={styles.buttonIcon} />
				<Text style={styles.actionButtonText}>Edit Profile</Text>
			</TouchableOpacity>

			<TouchableOpacity
				style={[styles.actionButton, styles.loginButton, { flex: 1, marginLeft: 4 }]}
				onPress={() => router.push("/changepass")}
			>
				<Feather name="lock" size={20} color="#000" style={styles.buttonIcon} />
				<Text style={styles.actionButtonText}>Change Password</Text>
			</TouchableOpacity>
		</View>
	</>
)}


	{user && (
 
	<TouchableOpacity
		style={[styles.actionButton, styles.loginButton]} // Same as login/logout
		onPress={() => router.push("/order")}
	>
		<Feather name="eye" size={20} color="#000" style={styles.buttonIcon} />
		<Text style={styles.actionButtonText}>View Orders</Text>
	</TouchableOpacity>
 

	)}

	{/* Logout / Login Button */}
	<TouchableOpacity
		style={[
			styles.actionButton,
			user ? styles.logoutButton : styles.loginButton,
		]}
		onPress={async () => {
			await AsyncStorage.removeItem("userData");
			router.replace("/start");
		}}
	>
		<Feather
			name={user ? "log-out" : "log-in"}
			size={20}
			color="#000"
			style={styles.buttonIcon}
		/>
		<Text style={[styles.actionButtonText, styles.logoutText]}>
			{user ? "Logout" : "Login"}
		</Text>
	</TouchableOpacity>

	{/* Delete Account */}
	{user && (
		<TouchableOpacity
			style={[styles.actionButton, styles.deleteButton]}
			onPress={async () => {
				await AsyncStorage.removeItem("userData");
				router.replace("/start");
			}}
		>
			<Feather name="trash-2" size={20} color="#fff" style={styles.buttonIcon} />
			<Text style={[styles.actionButtonText, styles.deleteText]}>
				Delete Account
			</Text>
		</TouchableOpacity>
	)}
</View>

		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#FFFFFF",
	},
	header: {
		alignItems: "center",
		paddingVertical: 40,
		paddingHorizontal: 20,
		backgroundColor: "#FFFFFF",
	},
	avatarContainer: {
		marginBottom: 16,
	},
	avatar: {
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: "#000000",
		justifyContent: "center",
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	title: {
		fontSize: 28,
		fontWeight: "bold",
		color: "#000000",
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 16,
		color: "#666666",
		textAlign: "center",
	},
	infoCard: {
		backgroundColor: "#FFFFFF",
		margin: 20,
		borderRadius: 16,
		padding: 20,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 4,
		borderWidth: 1,
		borderColor: "#F0F0F0",
	},
	guestCard: {
		backgroundColor: "#FFFFFF",
		margin: 20,
		borderRadius: 16,
		padding: 40,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 4,
		borderWidth: 1,
		borderColor: "#F0F0F0",
	},
	guestText: {
		fontSize: 18,
		fontWeight: "600",
		color: "#000000",
		marginTop: 16,
		textAlign: "center",
	},
	guestSubtext: {
		fontSize: 14,
		color: "#666666",
		marginTop: 8,
		textAlign: "center",
	},
	cardTitle: {
		fontSize: 20,
		fontWeight: "bold",
		color: "#000000",
		marginBottom: 20,
	},
	infoRow: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: "#F5F5F5",
	},
	iconContainer: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: "#FFF8E1",
		justifyContent: "center",
		alignItems: "center",
		marginRight: 16,
	},
	infoContent: {
		flex: 1,
	},
	infoLabel: {
		fontSize: 12,
		color: "#666666",
		textTransform: "uppercase",
		fontWeight: "600",
		letterSpacing: 0.5,
		textAlign: "center",
	},
	infoValue: {
		fontSize: 16,
		color: "#000000",
		fontWeight: "500",
		marginTop: 2,
		textAlign: "center",
	},
	addressSection: {
		marginTop: 20,
		paddingTop: 20,
		borderTopWidth: 1,
		borderTopColor: "#E0E0E0",
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "700",
		color: "#FFC300",
		textAlign: "center",
		marginBottom: 16,
		letterSpacing: 1,
	},
	actionsContainer: {
		paddingHorizontal: 20,
		paddingBottom: 40,
	},
	actionButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 16,
		paddingHorizontal: 24,
		borderRadius: 12,
		marginVertical: 8,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	loginButton: {
		backgroundColor: "#FFC300",
	},
	logoutButton: {
		backgroundColor: "#FFC300",
	},
	deleteButton: {
		backgroundColor: "#FF4444",
	},
	buttonIcon: {
		marginRight: 8,
	},
	actionButtonText: {
		fontSize: 16,
		fontWeight: "600",
	},
	loginText: {
		color: "#000000",
	},
	logoutText: {
		color: "#000000",
	},
	deleteText: {
		color: "#FFFFFF",
	},
	viewOrdersButton: {
		backgroundColor: "#FFC300", // example yellow or keep same style as others
	},

	viewOrdersText: {
		color: "#000",
	},

	rowActions: {
	flexDirection: "row",
	justifyContent: "space-between",
	marginBottom: 16,
},

actionButtonSmall: {
	flexDirection: "row",
	alignItems: "center",
	justifyContent: "center",
	paddingVertical: 12,
	paddingHorizontal: 14,
	borderRadius: 10,
	flex: 1,
	marginHorizontal: 4,
	backgroundColor: "#FFC300",
	shadowColor: "#000",
	shadowOffset: { width: 0, height: 2 },
	shadowOpacity: 0.1,
	shadowRadius: 4,
	elevation: 3,
},

actionButtonTextSmall: {
	fontSize: 14,
	fontWeight: "600",
},


});
