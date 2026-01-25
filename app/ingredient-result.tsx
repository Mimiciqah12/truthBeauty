import { analyzeIngredientWithAI } from "@/lib/aiService";
import { auth, db } from "@/lib/firebase";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

export default function IngredientResult() {
  const { q, lang } = useLocalSearchParams<{ q: string; lang: string }>();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentLang, setCurrentLang] = useState<'en' | 'ms'>((lang as 'en'|'ms') || 'en');
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [loadingText, setLoadingText] = useState("Initializing...");

  useEffect(() => {
    if (!q) return;

    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.1, duration: 800, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 800, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      ])
    ).start();

    const fetchAnalysis = async () => {
      try {
          setLoadingText(currentLang === 'ms' ? "Pakar sedang menganalisis..." : "Expert is analyzing...");
          
          const aiData = await analyzeIngredientWithAI(q);
          
          if (aiData) {
            setResult(aiData);
          } else {
            throw new Error("No data returned");
          }
      } catch (error) {
          console.error(error);
          Alert.alert("Error", "Gagal menganalisis bahan.");
          router.back();
      } finally {
          setLoading(false);
      }
    };
    
    fetchAnalysis();
  }, [q]); 

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <View style={styles.loadingCircle}>
                    <Ionicons name="sparkles" size={40} color="#FFF" />
                </View>
            </Animated.View>
            <Text style={styles.loadingTitle}>Scanning...</Text>
            <Text style={styles.loadingSubtitle}>{loadingText}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!result) return null;

  const themeColor = {
    SAFE: "#4CAF50",
    CAUTION: "#FF9800",
    AVOID: "#EF5350",
  }[result.overallLevel as "SAFE" | "CAUTION" | "AVOID"] || "#FF9800";

  const handleSave = async () => {
    if (!auth.currentUser) return Alert.alert("Login Required");
    try {
      await addDoc(collection(db, "users", auth.currentUser.uid, "history"), {
        ingredientName: q,
        resultData: result, 
        savedAt: Timestamp.now(),
        overallLevel: result.overallLevel
      });
      Alert.alert(currentLang === 'ms' ? "Disimpan" : "Saved", "Already saved in history✅");
    } catch (e) { console.error(e); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F8EC" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        
        <TouchableOpacity 
            style={styles.langToggle} 
            onPress={() => setCurrentLang(prev => prev === 'en' ? 'ms' : 'en')}
        >
            <Text style={styles.langText}>{currentLang === 'en' ? "English" : "Bahasa"}</Text>
            <Ionicons name="swap-horizontal" size={16} color="#333" style={{marginLeft:4}}/>
        </TouchableOpacity>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        <View style={[styles.verdictCard, { backgroundColor: themeColor }]}>
            <View style={styles.verdictHeader}>
                <View style={styles.iconCircle}>
                    <Ionicons name={result.overallLevel === "SAFE" ? "shield-checkmark" : "warning"} size={32} color={themeColor} />
                </View>
                <View style={{flex:1}}>
                    <Text style={styles.verdictLabel}>
                      {currentLang === 'ms' ? "Keputusan" : "Verdict"}
                    </Text>
                    <Text style={styles.verdictValue}>{result.overallLevel}</Text>

                    <Text style={styles.verdictTitle}>
                      {currentLang === 'ms' ? result.verdict_title_ms : result.verdict_title_en}
                    </Text>
                </View>

                {result.health_score !== undefined && (
                   <View style={styles.scoreBadge}>
                      <Text style={styles.scoreText}>{result.health_score}</Text>
                      <Text style={styles.scoreLabel}>Score</Text>
                   </View>
                )}
            </View>
            
            <View style={styles.verdictDivider} />

            <Text style={styles.verdictSummary}>
                "{currentLang === 'ms' ? result.verdict_description_ms : result.verdict_description_en}"
            </Text>
        </View>

        <View style={styles.detailsContainer}>
            <Text style={styles.sectionHeader}>
              {currentLang === 'ms' ? "Perincian Bahan" : "Ingredient Breakdown"}
            </Text>
            
            {result.ingredients && result.ingredients.map((item: any, index: number) => (
                <View key={index} style={styles.detailCard}>
                    <View style={styles.detailHeader}>
                        <Text style={styles.ingName}>{item.name}</Text>
                        <View style={[styles.badge, { backgroundColor: item.level === "SAFE" ? "#4CAF50" : item.level === "AVOID" ? "#EF5350" : "#FF9800" }]}>
                            <Text style={styles.badgeText}>{item.level}</Text>
                        </View>
                    </View>

                    <View style={styles.row}>
                        <Ionicons name="flask-outline" size={18} color="#666" style={styles.icon} />
                        <View style={{flex: 1}}>
                            <Text style={styles.label}>{currentLang === 'ms' ? "Fungsi" : "Function"}</Text>
                            <Text style={styles.value}>
                                {currentLang === 'ms' ? item.function_ms : item.function_en}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.row}>
                        <Ionicons name="bulb-outline" size={18} color="#666" style={styles.icon} />
                        <View style={{flex: 1}}>
                            <Text style={styles.label}>{currentLang === 'ms' ? "Penjelasan" : "Explanation"}</Text>
                            <Text style={styles.value}>
                                {currentLang === 'ms' ? item.explanation_ms : item.explanation_en}
                            </Text>
                        </View>
                    </View>

                    <View style={[styles.row, {borderBottomWidth: 0}]}>
                        <Ionicons name="happy-outline" size={18} color="#666" style={styles.icon} />
                        <View style={{flex: 1}}>
                            <Text style={styles.label}>{currentLang === 'ms' ? "Sesuai Untuk" : "Best For"}</Text>
                            <Text style={styles.value}>
                                {currentLang === 'ms' 
                                    ? (item.suitableFor_ms ? item.suitableFor_ms.join(", ") : "-") 
                                    : (item.suitableFor_en ? item.suitableFor_en.join(", ") : "-")}
                            </Text>
                        </View>
                    </View>
                </View>
            ))}
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Ionicons name="bookmark" size={20} color="#FFF" />
            <Text style={styles.saveText}>
              {currentLang === 'ms' ? "Simpan" : "Save"}
            </Text>
        </TouchableOpacity>

        <View style={{height: 40}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8EC",
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: Platform.OS === 'android' ? 30 : 0,
  },
  backBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  langToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  langText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF7AA2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 15,
    color: "#888",
  },
  verdictCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowOpacity: 0.15,
    elevation: 8,
  },
  verdictHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verdictLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  verdictValue: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '800',
  },
  verdictTitle: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 2,
    fontStyle: 'italic',
  },
  verdictDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 16,
  },
  verdictSummary: {
    color: '#FFF',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  scoreBadge: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 8,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 50,
  },
  scoreText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 18,
  },
  scoreLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  detailsContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
    marginLeft: 4,
  },
  detailCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 12,
  },
  ingName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2D2D2D",
    textTransform: 'capitalize',
    flex: 1,
    marginRight: 10,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
    gap: 12,
  },
  icon: {
    marginTop: 2,
  },
  label: {
    fontSize: 12,
    color: "#999",
    fontWeight: "600",
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 15,
    color: "#444",
    lineHeight: 22,
    flex: 1,
  },
  saveBtn: {
    backgroundColor: '#2D2D2D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    gap: 10,
    shadowOpacity: 0.2,
    elevation: 5,
  },
  saveText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});