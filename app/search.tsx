import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Text,
  FlatList,
  Image,
  Dimensions,
  ActivityIndicator
} from "react-native";
import { collection, query, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase"; 

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 55) / 2; 

export default function SearchScreen() {
  const [queryText, setQueryText] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, "products"), limit(20)); 
        const querySnapshot = await getDocs(q);
        
        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        const shuffledProducts = productsData.sort(() => 0.5 - Math.random());

        setSuggestions(shuffledProducts.slice(0, 6));

      } catch (error) {
        console.error("Error fetching suggestions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleSearch = (textToSearch?: string) => {
    const finalQuery = textToSearch || queryText;
    if (!finalQuery.trim()) return;

    router.push({
      pathname: "/search-result", 
      params: { q: finalQuery.trim() },
    });
  };

  return (
    <View style={styles.container}>
 
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#555" />
        </TouchableOpacity>

        <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color="#FF7AA2" style={{ marginRight: 8 }} />
            <TextInput
              placeholder="Search products..."
              placeholderTextColor="#696464ff"
              value={queryText}
              onChangeText={setQueryText}
              style={styles.input}
              returnKeyType="search"
              onSubmitEditing={() => handleSearch()}
              autoFocus={false} 
            />
            {queryText.length > 0 && (
                <TouchableOpacity onPress={() => setQueryText("")}>
                    <Ionicons name="close-circle" size={18} color="#FFB6C1" />
                </TouchableOpacity>
            )}
        </View>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.titleRow}>
            <Text style={styles.sectionTitle}>✨ Search Suggestions</Text>
        </View>
        
        {loading ? (
          <ActivityIndicator size="large" color="#FF7AA2" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
              data={suggestions}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: 'space-between' }}
              contentContainerStyle={{ paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                  <TouchableOpacity 
                      style={styles.card} 
                      onPress={() => handleSearch(item.product_name)} 
                      activeOpacity={0.9}
                  >
                      <View style={styles.imageContainer}>
                        <Image 
                            source={{ uri: item.image || item.photoURL || "https://via.placeholder.com/150" }} 
                            style={styles.cardImage} 
                            resizeMode="cover"
                        />
                      </View>

                      <View style={styles.cardInfo}>
                          <Text style={styles.brandName} numberOfLines={1}>
                            {item.brand || "Popular"}
                          </Text>
                          <Text style={styles.productName} numberOfLines={2}>
                            {item.product_name || "Unknown Product"}
                          </Text>
                      </View>
                  </TouchableOpacity>
              )}
          />
        )}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8EC", 
    paddingTop: 50,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  backBtn: {
    marginRight: 8,
    padding: 8,
  },
  searchBox: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 25, 
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: "#ce4d8aff",
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  titleRow: {
    marginBottom: 15,
    marginTop:-5
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#444",
    letterSpacing: 0.5,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 18, 
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FFF0F5",
    shadowColor: "#5b0d25ff", 
    shadowOffset: { width: 0, height: 5 }, 
    shadowOpacity: 0.15, 
    elevation: 4,
    padding: 8, 
  },
  imageContainer: {
    width: "100%",
    height: CARD_WIDTH - 16,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#FFF0F5",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardInfo: {
    paddingVertical: 10,
    alignItems: 'center', 
  },
  brandName: {
    fontSize: 10,
    color: "#FF7AA2",
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  productName: {
    fontSize: 13,
    color: "#555",
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 18,
  },
});