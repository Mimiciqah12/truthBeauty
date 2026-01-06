import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator
} from "react-native";

import { auth, db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

export default function HistoryScreen() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    if (!auth.currentUser) return;
    try {
      const q = query(
        collection(db, "users", auth.currentUser.uid, "history"),
        orderBy("savedAt", "desc")
      );
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHistory(data);
    } catch (error) {
      console.log("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "SAFE": return "#4CAF50";
      case "CAUTION": return "#FF9800";
      case "AVOID": return "#EF5350";
      default: return "#999";
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ingredient History</Text>
        <View style={{width: 40}} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#FF7AA2" style={{marginTop: 50}} />
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20 }}
          ListEmptyComponent={
            <Text style={styles.empty}>No saved history yet.</Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.card}
              onPress={() => {
                // Navigasi semula ke page result, tapi kali ini kita pass data terus
                // Supaya tak payah fetch AI lagi (JIMAT KUOTA)
                // Note: Anda mungkin perlu ubah sikit IngredientResult untuk terima 'data' direct
                // Tapi untuk sekarang, kita just search balik keyword dia
                router.push({
                    pathname: "/ingredient-result",
                    params: { q: item.ingredientName }
                } as any);
              }}
            >
              <View>
                <Text style={styles.name}>{item.ingredientName}</Text>
                <Text style={styles.date}>
                   {item.savedAt?.toDate().toLocaleDateString()}
                </Text>
              </View>
              
              <View style={[styles.badge, { backgroundColor: getLevelColor(item.overallLevel) }]}>
                <Text style={styles.badgeText}>{item.overallLevel}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8EC" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, paddingTop: 50, backgroundColor: "#fff" },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  backBtn: { padding: 5 },
  card: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#fff", padding: 16, borderRadius: 12, marginBottom: 10 },
  name: { fontSize: 16, fontWeight: "700", textTransform: "capitalize", marginBottom: 4 },
  date: { fontSize: 12, color: "#888" },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  empty: { textAlign: "center", marginTop: 50, color: "#888" }
});