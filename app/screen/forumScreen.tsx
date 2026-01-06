import { Ionicons } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";
import React from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

/* ===== MOCK DISCUSSIONS ===== */
const DISCUSSIONS = [
  {
    id: "1",
    title: "Is COSRX Snail 96 suitable for sensitive skin?",
    desc: "I've been seeing the COSRX Snail 96 Mucin... any experiences?",
    user: "Nannaaa",
    time: "1h",
    likes: 14,
    comments: 20,
  },
  {
    id: "2",
    title: "Best affordable sunscreen?",
    desc: "Looking for a non-sticky sunscreen under RM50...",
    user: "Faizal",
    time: "6h",
    likes: 30,
    comments: 8,
  },
  {
    id: "3",
    title: "How to layer actives safely",
    desc: "I've been using niacinamide + AHA, should I separate them?",
    user: "SitiA",
    time: "1d",
    likes: 25,
    comments: 12,
  },
];

export default function ForumScreen() {
  return (
    <View style={styles.container}>
      {/* ===== Header ===== */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Forum</Text>
        <TouchableOpacity style={styles.addBtn}>
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* ===== Trending Video ===== */}
      <Text style={styles.sectionTitle}>Trending Video</Text>
      <Text style={styles.sectionDesc}>
        Watch a quick review on trending products
      </Text>

      <View style={styles.videoCard}>
        <Video
          source={{
            uri: "https://www.w3schools.com/html/mov_bbb.mp4", // demo video
          }}
          style={styles.video}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}

          isLooping
        />
      </View>

      {/* ===== Ask Question ===== */}
      <TouchableOpacity style={styles.askBtn}>
        <Text style={styles.askText}>+ Ask a Question</Text>
      </TouchableOpacity>

      {/* ===== Trending Discussions ===== */}
      <Text style={styles.sectionTitle}>Trending Discussions</Text>

      <FlatList
        data={DISCUSSIONS}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDesc}>{item.desc}</Text>

            <View style={styles.metaRow}>
              <Text style={styles.metaText}>
                {item.user} · {item.time}
              </Text>

              <View style={styles.iconRow}>
                <Ionicons name="heart-outline" size={16} color="#999" />
                <Text style={styles.count}>{item.likes}</Text>

                <Ionicons
                  name="chatbubble-outline"
                  size={16}
                  color="#999"
                  style={{ marginLeft: 10 }}
                />
                <Text style={styles.count}>{item.comments}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

/* ===== STYLES ===== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F8E9",
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
  },
  addBtn: {
    backgroundColor: "#F48FB1",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
  },
  sectionDesc: {
    fontSize: 13,
    color: "#777",
    marginBottom: 10,
  },
  videoCard: {
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  video: {
    width: "100%",
    height: 180,
  },
  askBtn: {
    backgroundColor: "#F48FB1",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 16,
  },
  askText: {
    color: "#fff",
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginTop: 14,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  cardDesc: {
    fontSize: 13,
    color: "#666",
    marginVertical: 6,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaText: {
    fontSize: 12,
    color: "#999",
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  count: {
    fontSize: 12,
    color: "#999",
    marginLeft: 4,
  },
});
