import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  Modal,
  Switch,
  Linking 
} from "react-native";
import { auth, db } from "@/lib/firebase"; 
import { signOut, updateProfile } from "firebase/auth";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as Notifications from 'expo-notifications';
import { doc, getDoc } from "firebase/firestore"; 

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function ProfileScreen() {
  const user = auth.currentUser;
  const [image, setImage] = useState(user?.photoURL || null);
  const [name, setName] = useState(user?.displayName || "User");
  const [isEditing, setIsEditing] = useState(false);
  const [isNotifOn, setIsNotifOn] = useState(false);
  const [isExpert, setIsExpert] = useState(false);
  const defaultImage = `https://ui-avatars.com/api/?name=${name}&background=FF7AA2&color=fff&size=256`;

  useEffect(() => {
    (async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        await Notifications.requestPermissionsAsync();
      }
    })();

    const checkExpertStatus = async () => {
        if (user?.uid) {
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists() && docSnap.data().isExpert === true) {
                setIsExpert(true);
            }
        }
    };
    checkExpertStatus();

  }, [user]);

  const handleRequestExpert = async () => {
      if (isExpert) {
          Alert.alert("Verified", "You are already a verified Expert! 👨‍⚕️");
          return;
      }

      Alert.alert(
          "Apply as Expert",
          "To become a verified expert, you need to email us your credentials (Certificate/Medical ID).\n\nWe will open your email app now.",
          [
              { text: "Cancel", style: "cancel" },
              { 
                  text: "Proceed to Email", 
                  onPress: () => {
                      const subject = `Expert Verification Request - ${name}`;
                      const body = `Hi Truth Beauty Admin,\n\nI would like to apply as an Expert.\n\nMy User ID: ${user?.uid}\n\n(Please attach your medical certificate or student ID below for verification)`;
                      const mailUrl = `mailto:admin@truthbeauty.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                      
                      Linking.openURL(mailUrl).catch(err => 
                          Alert.alert("Error", "Could not open email app. Please email admin@truthbeauty.com manually.")
                      );
                  } 
              }
          ]
      );
  };

  const handleToggleSwitch = async (value: boolean) => {
    setIsNotifOn(value);
    if (value === true) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Truth Beauty 💖",
          body: "Notifications are now active! You will receive latest updates.",
        },
        trigger: null,
      });
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission needed", "Please allow access to your gallery to change photo.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      const newUri = result.assets[0].uri;
      setImage(newUri);
      if (user) await updateProfile(user, { photoURL: newUri });
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Sign Out",
      "Do you want to sign out from Truth Beauty?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Sign Out",
          style: "destructive",
          onPress: async () => {
            await signOut(auth);
            router.replace("/");
          },
        },
      ]
    );
  };

  const handleSaveName = async () => {
      if(user && name.trim()) {
          await updateProfile(user, { displayName: name });
          setIsEditing(false);
          Alert.alert("Success", "Name updated!");
      }
  };

  return (
    <ScrollView style={styles.container}>
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
            <Image source={{ uri: image || defaultImage }} style={styles.avatar} />
            <TouchableOpacity style={styles.camIcon} onPress={pickImage}>
                <Text style={{fontSize: 16}}>📷</Text>
            </TouchableOpacity>
        </View>

        <Text style={styles.name}>
            {name} 
            {isExpert && <Text style={{fontSize: 18}}> ✅</Text>}
        </Text>
        
        {isExpert ? (
             <Text style={styles.expertLabel}>Verified Expert</Text>
        ) : (
             <Text style={styles.email}>{user?.email}</Text>
        )}

        <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditing(true)}>
            <Text style={styles.editBtnText}>Edit Name</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.menuContainer}>
       
        {!isExpert && (
            <TouchableOpacity 
                style={[styles.menuItem, { backgroundColor: '#F0F8FF' }]}
                onPress={handleRequestExpert}
            >
                <Text style={[styles.menuText, { color: '#007AFF' }]}>👨‍⚕️  Apply to be an Expert</Text>
                <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => router.push("/favourite")}
        >
            <Text style={styles.menuText}>💖  My Favorites</Text>
            <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push("/profile/history")} 
        >
            <Text style={styles.menuText}>🧪  Ingredient History</Text>
            <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <View style={styles.menuItemNoClick}>
            <Text style={styles.menuText}>🔔  Notifications</Text>
            <Switch 
                value={isNotifOn}
                onValueChange={handleToggleSwitch} 
                trackColor={{ false: "#e0e0e0", true: "#FFB6C1" }}
                thumbColor={isNotifOn ? "#FF7AA2" : "#f4f3f4"}
            />
        </View>

      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <Modal visible={isEditing} transparent animationType="fade">
          <View style={styles.modalOverlay}>
              <View style={styles.modalCard}>
                  <Text style={styles.modalTitle}>Change Name</Text>
                  <TextInput 
                    value={name} 
                    onChangeText={setName} 
                    style={styles.input} 
                    autoFocus
                  />
                  <View style={styles.modalBtnRow}>
                      <TouchableOpacity onPress={() => setIsEditing(false)}>
                          <Text style={styles.cancelText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={handleSaveName}>
                          <Text style={styles.saveText}>Save</Text>
                      </TouchableOpacity>
                  </View>
              </View>
          </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAF4",
  },
  header: {
    padding: 20,
    paddingTop: 60,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  profileCard: {
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 25,
    padding: 30,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    elevation: 3,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f0f0f0",
  },
  camIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 2,
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
    marginBottom: 2,
  },
  email: {
    fontSize: 14,
    color: "#888",
    marginBottom: 16,
  },
  expertLabel: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: '700',
    marginBottom: 16,
  },
  editBtn: {
    backgroundColor: "#FFF0F5",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editBtnText: {
    color: "#FF7AA2",
    fontWeight: "600",
    fontSize: 13,
  },
  menuContainer: {
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 18,
    marginBottom: 12,
    borderRadius: 18,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    elevation: 1,
  },
  menuItemNoClick: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 18,
    marginBottom: 12,
    borderRadius: 18,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    elevation: 1,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#444',
  },
  arrow: {
    fontSize: 20,
    color: '#ccc',
  },
  logoutBtn: {
    margin: 20,
    marginTop: 10,
    backgroundColor: "#FFE5E5",
    padding: 18,
    borderRadius: 18,
    alignItems: "center",
  },
  logoutText: {
    color: "#D92D20",
    fontWeight: "700",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 24,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#f9f9f9',
    width: '100%',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 40,
  },
  cancelText: {
    color: '#999',
    fontSize: 16,
    fontWeight: '600',
  },
  saveText: {
    color: '#FF7AA2',
    fontSize: 16,
    fontWeight: '700',
  },
});