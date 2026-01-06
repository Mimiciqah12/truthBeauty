import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

/* COMPONENTS */
import CommunityPreview from "../../components/communityPreview";
import IngredientQuickCheck from "../../components/IngredientQuickCheck";

/* FIREBASE */
import { auth, db } from "../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

const { width } = Dimensions.get("window");

/* ===== BANNER IMAGES ===== */
const cosmeticImages = [
  "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1400&q=60",
  "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1400&q=60",
  "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=1400&q=60",
];

export default function HomeScreen() {
  const [userProfile, setUserProfile] = useState<{
    name: string;
    photoURL: string | null;
  } | null>(null);

  const [bannerIndex, setBannerIndex] = useState(0);
  const bannerRef = useRef<FlatList<string>>(null);

  /* ===== FETCH USER PROFILE ===== */
  useEffect(() => {
    if (!auth.currentUser) return;

    const fetchUser = async () => {
      const snap = await getDoc(
        doc(db, "users", auth.currentUser!.uid)
      );

      if (snap.exists()) {
        setUserProfile({
          name: snap.data().name,
          photoURL: snap.data().photoURL,
        });
      }
    };

    fetchUser();
  }, []);

  /* ===== AUTO SLIDE BANNER ===== */
  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (bannerIndex + 1) % cosmeticImages.length;
      bannerRef.current?.scrollToOffset({
        offset: nextIndex * width,
        animated: true,
      });
      setBannerIndex(nextIndex);
    }, 3000);

    return () => clearInterval(timer);
  }, [bannerIndex]);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ===== HEADER ===== */}
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.welcomeSmall}>Welcome,</Text>
            <Text style={styles.welcomeText}>
              {userProfile?.name || "User"}!
            </Text>
          </View>

          <TouchableOpacity
            style={styles.profileWrapper}
            onPress={() => router.push("/tabs/profile")}
          >
            <Image
              source={{
                uri:
                  userProfile?.photoURL ||
                  `https://ui-avatars.com/api/?name=${userProfile?.name}`,
              }}
              style={styles.profilePic}
            />
          </TouchableOpacity>
        </View>

        {/* SEARCH BAR */}
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.searchBar}
          onPress={() => router.push("/search")}
        >
          <Ionicons name="search-outline" size={20} color="#9AA38F" />
          <Text style={styles.searchPlaceholder}>
            Search products...
          </Text>
        </TouchableOpacity>

        {/* ===== BANNER ===== */}
        <FlatList
          ref={bannerRef}
          horizontal
          data={cosmeticImages}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <Image source={{ uri: item }} style={styles.bannerImage} />
          )}
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 20 }}
        />

        {/* DOT INDICATOR */}
        <View style={styles.dotsRow}>
          {cosmeticImages.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                bannerIndex === index
                  ? styles.dotActive
                  : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        <IngredientQuickCheck />
        <CommunityPreview />

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

/* ===== STYLES ===== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8EC",
    paddingTop: 55,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  welcomeSmall: {
    fontSize: 19,
    color: "#7A7A7A",
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: "700",
  },
  profileWrapper: {
    backgroundColor: "#fff",
    borderRadius: 30,
    padding: 3,
    elevation: 4,
  },
  profilePic: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  searchPlaceholder: {
    marginLeft: 10,
    color: "#9AA38F",
    fontSize: 15,
  },
  bannerImage: {
    width,
    height: 180,
    borderRadius: 20,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 25,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 50,
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: "#FF7AA2",
  },
  dotInactive: {
    backgroundColor: "#FFD7E6",
  },
});
