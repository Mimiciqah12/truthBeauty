import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { registerUser } from "@/lib/auth"; // 🔥 FIREBASE REGISTER

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ===== HANDLE SIGN UP ===== */
  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await registerUser(email, password, name);
      Alert.alert("Success", "Account created successfully");
      router.replace("/tabs/home");
    } catch (error: any) {
      Alert.alert("Sign Up Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create an Account</Text>

      {/* Full Name */}
      <View style={styles.inputBox}>
        <Ionicons name="person-outline" size={18} color="#555" />
        <TextInput
          placeholder="Full Name"
          style={styles.input}
          placeholderTextColor="#777"
          value={name}
          onChangeText={setName}
        />
      </View>

      {/* Email */}
      <View style={styles.inputBox}>
        <Ionicons name="mail-outline" size={18} color="#555" />
        <TextInput
          placeholder="Email"
          keyboardType="email-address"
          style={styles.input}
          placeholderTextColor="#777"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      {/* Password */}
      <View style={styles.inputBox}>
        <Ionicons name="lock-closed-outline" size={18} color="#555" />
        <TextInput
          placeholder="Password"
          secureTextEntry={!showPassword}
          style={styles.input}
          placeholderTextColor="#777"
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            size={20}
            color="#555"
          />
        </TouchableOpacity>
      </View>

      {/* Confirm Password */}
      <View style={styles.inputBox}>
        <Ionicons name="lock-closed-outline" size={18} color="#555" />
        <TextInput
          placeholder="Confirm Password"
          secureTextEntry={!showConfirmPassword}
          style={styles.input}
          placeholderTextColor="#777"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          <Ionicons
            name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
            size={20}
            color="#555"
          />
        </TouchableOpacity>
      </View>

      {/* Sign Up Button */}
      <TouchableOpacity
        style={styles.signupBtn}
        onPress={handleSignUp}
        disabled={loading}
      >
        <Text style={styles.signupBtnText}>
          {loading ? "Creating..." : "Sign Up"}
        </Text>
      </TouchableOpacity>

      {/* Already have account */}
      <Text style={styles.footerText}>
        Already have an account?
        <Text
          style={styles.loginText}
          onPress={() => router.push("/login")}
        >
          {" "}Log in
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FFE9",
    paddingHorizontal: 30,
    justifyContent: "center",
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FF4FA3",
    textAlign: "center",
    marginBottom: 40,
  },

  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFEFEF",
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 15,
    gap: 10,
  },

  input: {
    flex: 1,
    fontSize: 16,
  },

  signupBtn: {
    backgroundColor: "#FF4FA3",
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },

  signupBtnText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },

  footerText: {
    textAlign: "center",
    fontSize: 14,
    color: "#333",
  },

  loginText: {
    color: "#FF4FA3",
    fontWeight: "700",
  },
});
