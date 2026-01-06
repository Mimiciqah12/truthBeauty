import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

// 1. Saya tambah 'ingredients' di sini supaya TypeScript tak error
type Product = {
  id: string;
  product_name?: string;
  brand?: string;
  image?: string;
  average_rating?: number;
  likes_count?: number;
  safety?: string;
  ingredients?: string; 
};

export default function SearchResultScreen() {
  const { q } = useLocalSearchParams<{ q?: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const searchText = (q ?? "").toLowerCase();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snap = await getDocs(collection(db, "products"));

        const allProducts: Product[] = snap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Product, "id">),
        }));

        // 2. Logik Filter Baru: Check Name ATAU Brand ATAU Ingredient
        const filtered = allProducts.filter((p) => {
          const nameMatch = (p.product_name ?? "").toLowerCase().includes(searchText);
          const brandMatch = (p.brand ?? "").toLowerCase().includes(searchText);
          const ingredientMatch = (p.ingredients ?? "").toLowerCase().includes(searchText);

          // Kalau salah satu match, produk akan keluar
          return nameMatch || brandMatch || ingredientMatch;
        });

        setProducts(filtered);
      } catch (error) {
        console.log("❌ Search error:", error);
      }
    };

    fetchProducts();
  }, [q]);

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <Text style={styles.title}>
        Search results for "{q ?? ""}"
      </Text>

      {/* RESULT LIST */}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.empty}>No products found.</Text>
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
            {item.image && (
              <Image
                source={{ uri: item.image }}
                style={styles.image}
              />
            )}

            <View style={{ flex: 1 }}>
              <Text style={styles.name}>
                {item.product_name}
              </Text>

              <Text style={styles.brand}>
                {item.brand}
              </Text>

              <Text style={styles.rating}>
                ⭐ {item.average_rating ?? "N/A"} ·{" "}
                {item.likes_count ?? 0} likes
              </Text>

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
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

/* ======================
   STYLES (TAK BERUBAH)
====================== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8EC",
    paddingTop: 60,
    paddingHorizontal: 16,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 20,
  },

  empty: {
    textAlign: "center",
    marginTop: 50,
    color: "#777",
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 14,
    marginBottom: 14,
    gap: 12,
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
  },

  brand: {
    fontSize: 13,
    color: "#777",
    marginTop: 2,
  },

  rating: {
    fontSize: 12,
    marginTop: 4,
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