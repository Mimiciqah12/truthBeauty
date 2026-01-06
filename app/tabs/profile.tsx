import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Platform,
  Switch // <--- Import Switch
} from "react-native";
import { signOut } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore"; // <--- Import updateDoc
import { auth, db } from "@/lib/firebase";

export default function Profile() {
  const [userData, setUserData] = useState<any>(null);
  const [isNotifEnabled, setIsNotifEnabled] = useState(false); // State untuk switch

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    if (auth.currentUser) {
      const docRef = doc(db, "users", auth.currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserData(data);
        // Set switch ikut database, kalau tak ada default false
        setIsNotifEnabled(data.notificationsEnabled ?? false);
      }
    }
  };

  // --- LOGIC SWITCH NOTIFICATION ---
  const toggleSwitch = async (value: boolean) => {
    // 1. Ubah UI serta merta (Optimistic Update)
    setIsNotifEnabled(value);

    // 2. Simpan setting dalam Firebase
    if (auth.currentUser) {
        try {
            const userRef = doc(db, "users", auth.currentUser.uid);
            await updateDoc(userRef, {
                notificationsEnabled: value
            });
            console.log("Notification setting updated:", value);
        } catch (error) {
            console.error("Failed to update setting", error);
            // Kalau gagal, revert balik switch
            setIsNotifEnabled(!value);
            Alert.alert("Error", "Failed to update settings. Check your connection.");
        }
    }
  };

  // --- LOGIC LOGOUT ---
  const handleLogoutPress = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Log Out",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut(auth);
              router.replace("/login");
            } catch (error) {
              Alert.alert("Error", "Failed to log out");
            }
          },
        },
      ]
    );
  };

  // Kita asingkan Notification dari menu biasa sebab UI dia lain (ada Switch)
  const menuItems = [
    {
      label: "Edit Profile",
      icon: "person-outline",
      color: "#FF7AA2",
      bg: "#FFF0F5",
      action: () => router.push("/edit-profile" as any),
    },
    {
      label: "Ingredient History",
      icon: "time-outline",
      color: "#2196F3",
      bg: "#E3F2FD",
      action: () => router.push("/profile/history" as any),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Profile</Text>
        </View>

        {/* PROFILE CARD */}
        <View style={styles.profileCard}>
          <Image
            source={{
              uri: userData?.photoURL || auth.currentUser?.photoURL || "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png",
            }}
            style={styles.avatar}
          />
          <View style={styles.info}>
            <Text style={styles.name}>
              {userData?.username || userData?.name || auth.currentUser?.displayName || "User"}
            </Text>
            <Text style={styles.email}>{auth.currentUser?.email}</Text>
            {userData?.isExpert && (
                <View style={styles.expertBadge}>
                    <Ionicons name="checkmark-circle" size={14} color="#FFF" />
                    <Text style={styles.expertText}>Verified Expert</Text>
                </View>
            )}
          </View>
        </View>

        {/* MENU OPTIONS */}
        <View style={styles.menuContainer}>
          {/* Loop Menu Biasa (Link) */}
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.action}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.iconBox, { backgroundColor: item.bg }]}>
                  <Ionicons name={item.icon as any} size={22} color={item.color} />
                </View>
                <Text style={styles.menuText}>{item.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CCC" />
            </TouchableOpacity>
          ))}

          {/* Special Menu Item: NOTIFICATIONS (Dengan Switch) */}
          <View style={[styles.menuItem, { borderBottomWidth: 0 }]}>
              <View style={styles.menuLeft}>
                <View style={[styles.iconBox, { backgroundColor: "#F3E5F5" }]}>
                  <Ionicons name="notifications-outline" size={22} color="#9C27B0" />
                </View>
                <View>
                    <Text style={styles.menuText}>News & Updates</Text>
                    <Text style={styles.subText}>Get notified about latest trends</Text>
                </View>
              </View>
              
              {/* SWITCH COMPONENT */}
              <Switch
                trackColor={{ false: "#E0E0E0", true: "#FF7AA2" }}
                thumbColor={isNotifEnabled ? "#fff" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleSwitch}
                value={isNotifEnabled}
              />
          </View>
        </View>

        {/* LOGOUT BUTTON */}
        <View style={styles.logoutContainer}>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogoutPress}>
            <Ionicons name="log-out-outline" size={20} color="#FFF" />
            <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8EC" },
  header: { padding: 20, paddingTop: Platform.OS === 'android' ? 40 : 20 },
  headerTitle: { fontSize: 24, fontWeight: "800", color: "#333" },

  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  avatar: { width: 70, height: 70, borderRadius: 35, marginRight: 16, backgroundColor: '#EEE' },
  info: { flex: 1 },
  name: { fontSize: 18, fontWeight: "700", color: "#333", marginBottom: 4 },
  email: { fontSize: 14, color: "#888", marginBottom: 6 },
  expertBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#4CAF50', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, gap: 4 },
  expertText: { color: '#FFF', fontSize: 10, fontWeight: '700' },

  menuContainer: { backgroundColor: "#FFF", marginHorizontal: 20, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, elevation: 2 },
  menuItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 16, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: "#F5F5F5" },
  menuLeft: { flexDirection: "row", alignItems: "center" },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center", marginRight: 14 },
  menuText: { fontSize: 16, fontWeight: "600", color: "#333" },
  subText: { fontSize: 11, color: "#999", marginTop: 2 },

  logoutContainer: { padding: 20, marginTop: 10 },
  logoutBtn: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center", 
    backgroundColor: "#FF4D4D", 
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: "#FF4D4D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutText: { fontSize: 16, fontWeight: "700", color: "#FFF" },
});