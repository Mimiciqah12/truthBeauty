import { router } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function GetStarted() {
  return (
    <View style={styles.container}>

      {/* Logo */}
      <Image
        source={require("../assets/images/truthbeauty-logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Buttons */}
      <View style={styles.buttonContainer}>

        <TouchableOpacity
          style={styles.loginBtn}
          onPress={() => router.push("/tabs/home")}
        >
          <Text style={styles.loginText}>Get Started</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eaf7d5ff",
    justifyContent: "center",
    alignItems: "center",
  },

  logo: {
    width: 370,
    height: 240,
    marginBottom: 40,
  },

  buttonContainer: {
    width: "80%",
    alignItems: "center",
    gap: 20,
  },

  loginBtn: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 30,
    backgroundColor: "#FF4FA3",
    alignItems: "center",
  },

  loginText: {
    fontSize: 18,
    color: "white",
    fontWeight: "600",
  },
});
