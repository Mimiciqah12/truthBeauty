import { router } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function SignedOut() {
  return (
    <View style={styles.container}>
      {/* PINK HEADER */}
      <View style={styles.header}>
        <Image
          source={require("../assets/images/flower.png")}
          style={styles.floral}
        />
      </View>

      {/* CARD */}
      <View style={styles.card}>
        <Text style={styles.title}>You’ve successfully{"\n"}signed out.</Text>

        <Text style={styles.message}>
          Thank you for using{"\n"}
          <Text style={styles.appName}>Truth Beauty.</Text>{"\n"}
          We hope to see you again soon!
        </Text>

        <TouchableOpacity
          style={styles.loginBtn}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.loginText}>Log in</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8EC",
  },

  header: {
    backgroundColor: "#FF7AA2",
    height: 200,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    position: "relative",
  },

  floral: {
    width: 220,
    height: 220,
    position: "absolute",
    right: -40,
    top: 25,
    zIndex: 10,
  },

  card: {
    marginTop: -80,
    marginHorizontal: 20,
    backgroundColor: "#f6fff5",
    padding: 40,
    borderRadius: 30,
    alignItems: "center",
    flex: 1,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 20,
    color: "#FF7AA2",
  },

  message: {
    fontSize: 15,
    color: "#FF7AA2",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },

  appName: {
    fontWeight: "700",
    color: "#FF7AA2",
  },

  loginBtn: {
    width: "70%",
    backgroundColor: "#FF7AA2",
    paddingVertical: 12,
    borderRadius: 30,
    marginTop: 10,
    alignItems: "center",
  },

  loginText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});