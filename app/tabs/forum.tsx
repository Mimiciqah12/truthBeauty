import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { collection, orderBy, query, onSnapshot } from "firebase/firestore"; 
import { db } from "@/lib/firebase";

type ForumPost = {
  id: string;
  title: string;
  description: string;
  authorName: string;
  likesCount: number;
  commentsCount: number;
  hasExpertReply: boolean;
  createdAt: any;
};

export default function ForumTab() {
  const [posts, setPosts] = useState<ForumPost[]>([]);

  useEffect(() => {
    
    const q = query(
      collection(db, "forumPosts"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as any),
      }));
      setPosts(data);
    });

    return () => unsubscribe();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F8EC" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Forum</Text>
        
        <View style={{ width: 24 }} /> 
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.section}>Trending Discussions</Text>

        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/forum/${item.id}`)}
            >
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>

              <View style={styles.metaRow}>
                <Text style={styles.metaText}>{item.authorName || "User"}</Text>

                {item.hasExpertReply && (
                  <View style={styles.expertBadge}>
                    <Text style={styles.expertText}>Expert</Text>
                  </View>
                )}
              </View>

              <View style={styles.actionRow}>
                <View style={styles.iconRow}>
                  <Ionicons name="heart-outline" size={16} color="#555" />
                  <Text style={styles.iconText}>{item.likesCount || 0}</Text>
                </View>

                <View style={styles.iconRow}>
                  <Ionicons name="chatbubble-outline" size={16} color="#555" />
                  <Text style={styles.iconText}>{item.commentsCount || 0}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/forum/create")}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8EC", 
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: Platform.OS === 'android' ? 30 : 0,
    backgroundColor: "#F7F8EC",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2D2D2D",
  },
  iconBtn: {
    padding: 5,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20, 
  },
  section: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 15,
    marginTop: 5,
    color: "#1A1A1A",
  },
  card: {
    backgroundColor: "#fce6edff", 
    padding: 18,
    borderRadius: 18,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  cardDesc: {
    color: "#484747ff",
    marginTop: 6,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 8,
  },
  metaText: {
    color: "#837676ff",
    fontSize: 13,
  },
  expertBadge: {
    backgroundColor: "#E6F2FF",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  expertText: {
    fontSize: 11,
    color: "#2F80ED",
    fontWeight: "600",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 16,
    marginTop: -15, 
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  iconText: {
    fontSize: 13,
    color: "#555",
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#FF7AA2",
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});