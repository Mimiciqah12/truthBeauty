import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, View } from "react-native";
import { auth } from "../lib/firebase";

export default function Index() {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const splashTimer = setTimeout(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          router.replace("/tabs/home");
        } else {
          router.replace("/welcome");
        }
        setChecking(false);
      });

      // cleanup auth listener
      return () => unsubscribe();
    }, 2000);

    return () => clearTimeout(splashTimer);
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/truthbeauty-logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      {checking && (
        <ActivityIndicator
          size="large"
          color="#F73C8F"
          style={{ marginTop: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eaf7d5ff",
  },
  logo: {
    width: 390,
    height: 390,
  },
});
