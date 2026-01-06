import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  /* ===== EMAIL VALIDATION ===== */
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  /* ===== HANDLE RESET ===== */
  const handleReset = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email");
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      setSuccessModal(true);
    } catch (error: any) {
      Alert.alert(
        "Reset Failed",
        error.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Back */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={26} color="#F73C8F" />
      </TouchableOpacity>

      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.subtitle}>
        Enter your registered email and we’ll send you a reset link 💌
      </Text>

      {/* Email */}
      <View style={styles.inputBox}>
        <Ionicons name="mail-outline" size={20} color="#555" />
        <TextInput
          placeholder="Email address"
          placeholderTextColor="#777"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      {/* Button */}
      <TouchableOpacity
        style={styles.resetBtn}
        onPress={handleReset}
        disabled={loading}
      >
        <Text style={styles.resetText}>
          {loading ? "Sending..." : "Send Reset Link"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>
        Remember your password?
        <Text
          style={styles.loginText}
          onPress={() => router.replace("/login")}
        >
          {" "}Log in
        </Text>
      </Text>

      {/* ===== SUCCESS MODAL ===== */}
      <Modal transparent visible={successModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Ionicons
              name="checkmark-circle"
              size={70}
              color="#F73C8F"
            />
            <Text style={styles.modalTitle}>Email Sent!</Text>
            <Text style={styles.modalText}>
              We’ve sent a password reset link to:
            </Text>
            <Text style={styles.emailText}>{email}</Text>

            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => {
                setSuccessModal(false);
                router.replace("/login");
              }}
            >
              <Text style={styles.modalBtnText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eaf7d5ff",
    paddingHorizontal: 30,
    justifyContent: "center",
  },

  backBtn: {
    position: "absolute",
    top: 60,
    left: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#F73C8F",
    textAlign: "center",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginBottom: 35,
  },

  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFEFEF",
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 25,
    gap: 10,
  },

  input: {
    flex: 1,
    fontSize: 16,
  },

  resetBtn: {
    backgroundColor: "#F73C8F",
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 25,
  },

  resetText: {
    color: "white",
    fontSize: 17,
    fontWeight: "600",
  },

  footerText: {
    textAlign: "center",
    fontSize: 14,
    color: "#333",
  },

  loginText: {
    color: "#F73C8F",
    fontWeight: "700",
  },

  /* ===== MODAL ===== */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    backgroundColor: "#fff",
    width: "85%",
    borderRadius: 25,
    padding: 30,
    alignItems: "center",
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 15,
    color: "#F73C8F",
  },

  modalText: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
    color: "#555",
  },

  emailText: {
    marginTop: 8,
    fontWeight: "600",
    color: "#333",
  },

  modalBtn: {
    marginTop: 25,
    backgroundColor: "#F73C8F",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },

  modalBtnText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});
