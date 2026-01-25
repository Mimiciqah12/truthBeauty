import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { loginUser } from "@/lib/auth"; 

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      await loginUser(email, password);
      router.replace("/tabs/home");
    } catch (error: any) {
  Alert.alert("Login Failed", error.message);
} finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
   
      <View style={styles.header}>
        <Text style={styles.hello}>HELLO !</Text>
        <Text style={styles.subtitle}>Welcome to Truth Beauty</Text>

        <Image
          source={require("../assets/images/flower.png")}
          style={styles.floral}
        />
      </View>

      <View style={styles.box}>
        <Text style={styles.loginTitle}>Log in</Text>

        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#555" style={styles.icon} />
          <TextInput
            placeholder="Email"
            placeholderTextColor="#777"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color="#555"
            style={styles.icon}
          />

          <TextInput
            placeholder="Password"
            placeholderTextColor="#777"
            secureTextEntry={!showPassword}
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#555"
              style={styles.eye}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
  style={styles.forgotBtn}
  onPress={() => router.push("/forgot-password")}
>
  <Text style={styles.forgotText}>Forgot Password</Text>
</TouchableOpacity>

        <TouchableOpacity
          style={styles.loginBtn}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.loginText}>
            {loading ? "Logging in..." : "Log in"}
          </Text>
        </TouchableOpacity>

        {/* Sign Up */}
        <Text style={styles.signupText}>
          Don’t have an account?{" "}
          <Text
            style={styles.signupLink}
            onPress={() => router.push("/signup")}
          >
            Sign Up
          </Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FFF5",
  },
  header: {
    backgroundColor: "#F73C8F",
    height: 230,
    paddingTop: 100,
    paddingLeft: 30,
  },
  hello: {
    color: "white",
    fontSize: 38,
    fontWeight: "700",
  },
  subtitle: {
    color: "white",
    fontSize: 20,
    marginTop: 4,
  },
  floral: {
    width: 220,
    height: 230,
    position: "absolute",
    right: -55,
    top: 75,
    opacity: 1.9,
    zIndex: 10,
  },
  box: {
    marginTop: -25,
    backgroundColor: "#f6ffe7ff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 45,
    flex: 1,
  },
  loginTitle: {
    fontSize: 25,
    fontWeight: "700",
    color: "#F73C8F",
    marginBottom: 55,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f6f2f2ff",
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 20,
    height: 50,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#333",
  },
  eye: {
    paddingHorizontal: 6,
  },
  forgotBtn: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotText: {
    color: "#F73C8F",
    fontSize: 12,
  },
  loginBtn: {
    backgroundColor: "#F73C8F",
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 10,
  },
  loginText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  signupText: {
    textAlign: "center",
    marginTop: 20,
    color: "#555",
  },
  signupLink: {
    color: "#F73C8F",
    fontWeight: "700",
  },
});
