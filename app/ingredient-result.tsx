import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState, useRef } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Easing,
  SafeAreaView,
  StatusBar,
  Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// FIREBASE
import { auth, db } from "@/lib/firebase";
import { addDoc, collection, Timestamp, doc, getDoc } from "firebase/firestore";
import { analyzeIngredientWithAI } from "@/lib/aiService";

export default function IngredientResult() {
  const { q } = useLocalSearchParams<{ q: string }>();
  
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // === ANIMASI LOADING ===
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [loadingText, setLoadingText] = useState("Connecting to AI...");

  useEffect(() => {
    if (!q) return;

    // Animasi Pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.1, duration: 800, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 800, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      ])
    ).start();

    // Teks Bertukar
    const messages = [
        `Scanning "${q}"...`,
        "Analyzing chemical structure...",
        "Checking safety database...",
        "Generating safety report...",
    ];
    let msgIndex = 0;
    const textInterval = setInterval(() => {
        msgIndex = (msgIndex + 1) % messages.length;
        setLoadingText(messages[msgIndex]);
    }, 1500);

    // Call AI
    const fetchAnalysis = async () => {
      const aiData = await analyzeIngredientWithAI(q);
      setResult(aiData);
      setLoading(false);
      clearInterval(textInterval);
    };
    fetchAnalysis();

    return () => clearInterval(textInterval);
  }, [q]);

  // === UI LOADING ===
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <View style={styles.loadingCircle}>
                    <Ionicons name="sparkles" size={40} color="#FFF" />
                </View>
            </Animated.View>
            <Text style={styles.loadingTitle}>AI Analysis in Progress</Text>
            <Text style={styles.loadingSubtitle}>{loadingText}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!result || !q) return null;

  // Warna Tema
  const themeColor = {
    SAFE: "#4CAF50",
    CAUTION: "#FF9800",
    AVOID: "#EF5350",
  }[result.overallLevel as "SAFE" | "CAUTION" | "AVOID"] || "#FF9800";

  // === FUNGSI SAVE TO HISTORY (Ubah dari Share) ===
  const handleSave = async () => {
    try {
      if (!auth.currentUser) {
        Alert.alert("Login required", "Please login to save history");
        return;
      }

      // Simpan ke sub-collection user
      await addDoc(collection(db, "users", auth.currentUser.uid, "history"), {
        ingredientName: q,
        resultData: result, // Simpan full result supaya tak perlu fetch AI lagi nanti
        savedAt: Timestamp.now(),
        summary: result.summary,
        overallLevel: result.overallLevel
      });
      
      Alert.alert("Saved", "Analysis saved to your history! 📝");
      // Kita tak redirect, biar user baca dulu
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to save");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F8EC" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analysis Result</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* HERO CARD (VERDICT) */}
        <View style={[styles.verdictCard, { backgroundColor: themeColor }]}>
            <View style={styles.verdictHeader}>
                <View style={styles.iconCircle}>
                    <Ionicons 
                        name={result.overallLevel === "SAFE" ? "shield-checkmark" : result.overallLevel === "AVOID" ? "warning" : "alert"} 
                        size={32} color={themeColor} 
                    />
                </View>
                <View>
                    <Text style={styles.verdictLabel}>Safety Verdict</Text>
                    <Text style={styles.verdictValue}>{result.overallLevel}</Text>
                </View>
            </View>
            <View style={styles.verdictDivider} />
            <Text style={styles.verdictSummary}>"{result.summary}"</Text>
        </View>

        {/* DETAILED BREAKDOWN */}
        <View style={styles.detailsContainer}>
            <Text style={styles.sectionHeader}>Detailed Breakdown</Text>
            
            {result.ingredients && result.ingredients.map((item: any, index: number) => (
                <View key={index} style={styles.detailCard}>
                    <View style={styles.detailHeader}>
                        <Text style={styles.ingName}>{item.name}</Text>
                        <View style={[styles.badge, { backgroundColor: themeColor }]}>
                            <Text style={styles.badgeText}>{item.level}</Text>
                        </View>
                    </View>

                    <View style={styles.row}>
                        <Ionicons name="flask-outline" size={18} color="#666" style={styles.icon} />
                        <View style={{flex: 1}}>
                            <Text style={styles.label}>Function</Text>
                            <Text style={styles.value}>{item.function}</Text>
                        </View>
                    </View>

                    <View style={styles.row}>
                        <Ionicons name="bulb-outline" size={18} color="#666" style={styles.icon} />
                        <View style={{flex: 1}}>
                            <Text style={styles.label}>AI Explanation</Text>
                            <Text style={styles.value}>{item.explanation}</Text>
                        </View>
                    </View>

                    <View style={[styles.row, {borderBottomWidth: 0}]}>
                        <Ionicons name="happy-outline" size={18} color="#666" style={styles.icon} />
                        <View style={{flex: 1}}>
                            <Text style={styles.label}>Best For</Text>
                            <Text style={styles.value}>
                                {item.suitableFor ? item.suitableFor.join(", ") : "General Use"}
                            </Text>
                        </View>
                    </View>
                </View>
            ))}
        </View>

        {/* SAVE BUTTON (Ganti Share) */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Ionicons name="bookmark" size={20} color="#FFF" />
            <Text style={styles.saveText}>Save to History</Text>
        </TouchableOpacity>

        <View style={{height: 40}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8EC" },
  scrollContent: { padding: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, marginTop: Platform.OS === 'android' ? 30 : 0 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#2D2D2D" },
  backBtn: { padding: 8, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.03)' },
  
  // Loading
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FF7AA2', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  loadingTitle: { fontSize: 20, fontWeight: "700", color: "#333", marginBottom: 8 },
  loadingSubtitle: { fontSize: 15, color: "#888" },

  // Cards
  verdictCard: { borderRadius: 24, padding: 24, marginBottom: 24, shadowOpacity: 0.15, elevation: 8 },
  verdictHeader: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
  verdictLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600', textTransform: 'uppercase' },
  verdictValue: { color: '#FFF', fontSize: 28, fontWeight: '800' },
  verdictDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 16 },
  verdictSummary: { color: '#FFF', fontSize: 16, lineHeight: 24, fontWeight: '500' },

  // Details
  detailsContainer: { marginBottom: 20 },
  sectionHeader: { fontSize: 18, fontWeight: "700", color: "#333", marginBottom: 12, marginLeft: 4 },
  detailCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 16, elevation: 3 },
  detailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', paddingBottom: 12 },
  ingName: { fontSize: 18, fontWeight: "700", color: "#2D2D2D", textTransform: 'capitalize' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14, gap: 12 },
  icon: { marginTop: 2 },
  label: { fontSize: 12, color: "#999", fontWeight: "600", textTransform: 'uppercase' },
  value: { fontSize: 15, color: "#444", lineHeight: 22, flex: 1 },

  // Button
  saveBtn: { backgroundColor: '#2D2D2D', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, borderRadius: 16, gap: 10, shadowOpacity: 0.2, elevation: 5 },
  saveText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});