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

export default function IngredientQuickCheck() {
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState<'en' | 'ms'>('en'); 

  const handleAnalyze = () => {
    if (!query.trim()) {
      Alert.alert(language === 'ms' ? "Input Kosong" : "Empty Input");
      return;
    }

    router.push({
      pathname: "/ingredient-result",
      params: { q: query, lang: language }, 
    });
  };

  return (
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 6 }}>
          <Text style={styles.title}>
            {language === 'en' ? "Check Your Ingredients" : "Semak Bahan Anda"}
          </Text>

          <TouchableOpacity 
            style={styles.langBtn} 
            onPress={() => setLanguage(prev => prev === 'en' ? 'ms' : 'en')}
          >
            <Text style={styles.langText}>{language === 'en' ? "EN" : "BM"}</Text>
            <Ionicons name="globe-outline" size={12} color="#333" style={{marginLeft:2}}/>
          </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>
        {language === 'en' 
           ? "Paste ingredients to understand what's on your skin."
           : "Tampal bahan untuk fahami apa yang ada pada kulit anda."}
      </Text>

      <View style={styles.inputRow}>
        <Ionicons name="search-outline" size={20} color="#9AA38F" />

        <TextInput
          placeholder={language === 'en' ? "e.g. Retinol, Fragrance..." : "cth. Retinol, Pewangi..."}
          placeholderTextColor="#A3A3A3"
          value={query}
          onChangeText={setQuery}
          style={styles.input}
        />

        <TouchableOpacity style={styles.analyzeBtn} onPress={handleAnalyze}>
          <Text style={styles.analyzeText}>
            {language === 'en' ? "Analyze" : "Analisis"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tagsRow}>
        {["Retinol", "Sulfates", "Fragrance"].map((item) => (
          <TouchableOpacity key={item} style={styles.tag} onPress={() => setQuery(item)}>
            <Text style={styles.tagText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#d0dd91ff",
    marginHorizontal: 20,
    borderRadius: 18,
    padding: 18,
    marginTop: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    color: "#2D2D2D",
  },
  subtitle: {
    textAlign: "center",
    color: "#555",
    fontSize: 14,
    marginBottom: 18,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
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
    backgroundColor: "#FFF",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  tagText: {
    color: "#35472bff",
    fontSize: 13,
    fontWeight: "600",
  },
  langBtn: {
    position: 'absolute',
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  langText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#333',
  },
});