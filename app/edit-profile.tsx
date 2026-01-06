import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function EditProfile() {
  const user = auth.currentUser;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState<"female" | "male" | "">("");

  /* ===== FETCH USER DATA ===== */
  useEffect(() => {
    if (!user) return;

    setEmail(user.email || "");

    const fetchData = async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        const data = snap.data();
        setName(data.name || "");
        setGender(data.gender || "");
      }
    };

    fetchData();
  }, []);

  /* ===== SAVE PROFILE ===== */
  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Username cannot be empty");
      return;
    }

    if (!gender) {
      Alert.alert("Error", "Please select gender");
      return;
    }

    try {
      await updateDoc(doc(db, "users", user!.uid), {
        name,
        gender,
      });

      Alert.alert("Success", "Profile updated");
      router.back();
    } catch (e) {
      Alert.alert("Error", "Failed to save profile");
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>‹ Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Edit Profile</Text>

      <ScrollView contentContainerStyle={styles.content}>
        {/* USERNAME */}
        <Text style={styles.label}>Username</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Enter your username"
          style={styles.input}
        />

        {/* EMAIL (READ ONLY) */}
        <Text style={styles.label}>Email</Text>
        <TextInput value={email} editable={false} style={styles.inputDisabled} />

        {/* GENDER */}
        <Text style={styles.label}>Gender</Text>

        <View style={styles.genderRow}>
          <TouchableOpacity
            style={[
              styles.genderOption,
              gender === "female" && styles.genderSelected,
            ]}
            onPress={() => setGender("female")}
          >
            <Text
              style={[
                styles.genderText,
                gender === "female" && styles.genderTextSelected,
              ]}
            >
              Female
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.genderOption,
              gender === "male" && styles.genderSelected,
            ]}
            onPress={() => setGender("male")}
          >
            <Text
              style={[
                styles.genderText,
                gender === "male" && styles.genderTextSelected,
              ]}
            >
              Male
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* SAVE BUTTON FIXED BOTTOM */}
      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ===== STYLES ===== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8EC",
    paddingHorizontal: 16,
  },

  back: {
    color: "#FF7AA2",
    fontSize: 16,
    marginTop: 40,
    marginBottom: 10,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 25,
  },

  content: {
    paddingBottom: 120,
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333030ff",
    marginBottom: 6,
    marginLeft: 4,
  },

  input: {
    backgroundColor: "#FFD7E6",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },

  inputDisabled: {
    backgroundColor: "#F0F0F0",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    color: "#999",
  },

  genderRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 6,
  },

  genderOption: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#FFD7E6",
    alignItems: "center",
  },

  genderSelected: {
    backgroundColor: "#FF7AA2",
  },

  genderText: {
    color: "#555",
    fontWeight: "600",
  },

  genderTextSelected: {
    color: "#fff",
  },

  saveBtn: {
    position: "absolute",
    bottom: 30,
    left: 16,
    right: 16,
    backgroundColor: "#FF3D7F",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
  },

  saveText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
