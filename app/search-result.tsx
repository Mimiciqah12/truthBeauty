import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator, 
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; 
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Product = {
  id: string;
  product_name?: string;
  name?: string; 
  brand?: string;
  image?: string;
  photoURL?: string; 
  average_rating?: number;
  likes_count?: number;
  safety?: string;
  ingredients?: string; 
};

export default function SearchResultScreen() {
  const { q } = useLocalSearchParams<{ q?: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true); 
  const searchText = (q ?? "").toLowerCase();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true); 
        const snap = await getDocs(collection(db, "products"));
        const allProducts: Product[] = snap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Product, "id">),
        }));

        const filtered = allProducts.filter((p) => {
          const pName = p.product_name || p.name || ""; 
          const nameMatch = pName.toLowerCase().includes(searchText);
          const brandMatch = (p.brand ?? "").toLowerCase().includes(searchText);
          const ingredientMatch = (p.ingredients ?? "").toLowerCase().includes(searchText);
          return nameMatch || brandMatch || ingredientMatch;
        });

        setProducts(filtered);
      } catch (error) {
        console.log("❌ Search error:", error);
      } finally {
        setLoading(false); 
      }
    };

    fetchProducts();
  }, [q]);

  return (
    <View style={styles.container}>
      
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>
            Search results for "{q ?? ""}"
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#FF7AA2" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
            data={products}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={50} color="#ccc" />
                <Text style={styles.empty}>No products found.</Text>
            </View>
            }
            renderItem={({ item }) => (
            <TouchableOpacity
                style={styles.card}
                onPress={() =>
                router.push({
                    pathname: "/product-detail", 
                    params: { id: item.id },
                })
                }
            >
                <Image
                    source={{ uri: item.image || item.photoURL || "https://via.placeholder.com/150" }}
                    style={styles.image}
                />

                <View style={{ flex: 1 }}>
                <Text style={styles.name} numberOfLines={2}>
                    {item.product_name || item.name || "Unknown Product"}
                </Text>

                <Text style={styles.brand}>
                    {item.brand || "Generic"}
                </Text>

                <Text style={styles.rating}>
                    ⭐ {item.average_rating ?? "N/A"} ·{" "}
                    {item.likes_count ?? 0} likes
                </Text>

                {item.safety && (
                    <Text
                        style={[
                        styles.safety,
                        item.safety === "SAFE"
                            ? styles.safe
                            : styles.caution,
                        ]}
                    >
                        {item.safety}
                    </Text>
                )}
                </View>
            </TouchableOpacity>
            )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8EC",
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backBtn: {
    marginRight: 10,
    padding: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    flex: 1, 
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  empty: {
    textAlign: "center",
    marginTop: 10,
    color: "#777",
    fontSize: 16,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 14,
    marginBottom: 14,
    gap: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, elevation: 1
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: "#eee",
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333",
  },
  brand: {
    fontSize: 13,
    color: "#777",
    marginTop: 2,
  },
  rating: {
    fontSize: 12,
    marginTop: 4,
    color: "#555",
  },
  safety: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: "700",
  },
  safe: {
    color: "#4CAF50",
  },
  caution: {
    color: "#FF9800",
  },
});