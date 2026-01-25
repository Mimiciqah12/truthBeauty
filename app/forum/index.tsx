import { router } from "expo-router";
import { collection, orderBy, query, onSnapshot } from "firebase/firestore"; 
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "@/lib/firebase";

type Post = {
  id: string;
  title: string;
  description: string;
  authorName: string;
  likesCount: number;    
  commentsCount: number;
};

export default function Forum() {
  const [posts, setPosts] = useState<Post[]>([]);

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
    <View style={styles.container}>
      <Text style={styles.title}>Forum</Text>

      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => router.push("/forum/create")}
      >
        <Text style={styles.addText}>＋</Text>
      </TouchableOpacity>

      <ScrollView>
        <Text style={styles.section}>Trending Discussions</Text>

        {posts.map((p) => (
          <TouchableOpacity
            key={p.id}
            style={styles.card}
            onPress={() => router.push(`/forum/${p.id}`)}
          >
            <Text style={styles.cardTitle}>{p.title}</Text>
            <Text style={styles.cardDesc}>{p.description}</Text>

            <View style={styles.row}>
              <Text style={styles.meta}>{p.authorName}</Text>
              <Text style={styles.meta}>❤️ {p.likesCount || 0}</Text>
              <Text style={styles.meta}>💬 {p.commentsCount || 0}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8EC",
    paddingTop: 50,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
  },
  section: {
    fontSize: 18,
    fontWeight: "700",
    margin: 20,
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 14,
    padding: 16,
    borderRadius: 18,
  },
  cardTitle: {
    fontWeight: "700",
    fontSize: 16,
  },
  cardDesc: {
    color: "#666",
    marginVertical: 6,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  meta: {
    color: "#888",
  },
  addBtn: {
    position: "absolute",
    right: 20,
    bottom: 30,
    backgroundColor: "#FF7AA2",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 99,
  },
  addText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "700",
  },
});