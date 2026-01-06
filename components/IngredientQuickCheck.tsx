import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

/* 🔥 ANALYSIS + FIREBASE */
import { auth, db } from "@/lib/firebase";
import { analyseIngredient } from "@/lib/ingredientRules";
import { addDoc, collection, Timestamp } from "firebase/firestore";

export default function IngredientQuickCheck() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  /* ===== HANDLE ANALYZE ===== */
  const handleAnalyze = async () => {
    if (!query.trim()) {
      Alert.alert("Empty Input", "Please enter ingredients to analyze");
      return;
    }

    try {
      setLoading(true);

      // ✅ ANALYSE INGREDIENT (LOGIC)
      const result = analyseIngredient(query);

      // ✅ SAVE AS HISTORY (OPTIONAL, SAFE)
      if (auth.currentUser) {
        await addDoc(collection(db, "ingredientAnalysis"), {
          userId: auth.currentUser.uid,
          input: query,
          overallLevel: result.overallLevel,
          ingredients: result.ingredients,
          createdAt: Timestamp.now(),
        });
      }

      // ✅ GO TO RESULT PAGE
      router.push({
        pathname: "/ingredient-result",
        params: { q: query },
      });
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to analyze ingredient");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Check Your Ingredients</Text>

      <Text style={styles.subtitle}>
        Paste ingredients or search to understand what you're putting on your skin.
      </Text>

      <View style={styles.inputRow}>
        <Ionicons name="search-outline" size={20} color="#9AA38F" />

        <TextInput
          placeholder="e.g. Retinol, Fragrance, Parabens..."
          placeholderTextColor="#A3A3A3"
          value={query}
          onChangeText={setQuery}
          style={styles.input}
        />

        <TouchableOpacity
          style={styles.analyzeBtn}
          onPress={handleAnalyze}
          disabled={loading}
        >
          <Text style={styles.analyzeText}>
            {loading ? "Analyzing..." : "Analyze"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tagsRow}>
        {["Retinol", "Sulfates", "Fragrance"].map((item) => (
          <TouchableOpacity
            key={item}
            style={styles.tag}
            onPress={() => setQuery(item)}
          >
            <Text style={styles.tagText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

/* ===== STYLES (UNCHANGED) ===== */
const styles = StyleSheet.create({
  card: {
    backgroundColor: "#e4ebc3",
    marginHorizontal: 20,
    borderRadius: 18,
    padding: 18,
    marginTop: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    textAlign: "center",
    color: "#777",
    fontSize: 14,
    marginBottom: 18,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f6f1f1f8",
    borderRadius: 30,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
  },
  analyzeBtn: {
    backgroundColor: "#80a537ff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  analyzeText: {
    color: "#fff",
    fontWeight: "600",
  },
  tagsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginTop: 15,
  },
  tag: {
    borderWidth: 1,
    borderColor: "#6a6e62ff",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: {
    color: "#35472bff",
    fontSize: 13,
    fontWeight: "500",
  },
});
