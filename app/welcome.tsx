import { router } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Welcome() {
  return (
    <View style={styles.container}>

      <Image
        source={require("../assets/images/truthbeauty-logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <View style={styles.buttonContainer}>

        <TouchableOpacity
          style={styles.signUpBtn}
          onPress={() => router.push("/signup")}
        >
          <Text style={styles.signUpText}>Sign Up</Text>
        </TouchableOpacity> 

        <TouchableOpacity
          style={styles.loginBtn}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.loginText}>Login</Text>
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
  signUpBtn: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#FF4FA3",
    alignItems: "center",
  },
  signUpText: {
    fontSize: 18,
    color: "#FF4FA3",
    fontWeight: "600",
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
