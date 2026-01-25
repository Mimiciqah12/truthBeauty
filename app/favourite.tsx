import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from "react-native";
import { router } from "expo-router";
import { db, auth } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";

type Product = {
  id: string;
  product_name: string;
  brand: string;
  image: string;
  average_rating: number;
};

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    const user = auth.currentUser;
    if (!user) {
        setLoading(false);
        return;
    }

    try {
      const likesRef = collection(db, "productLikes");
      const q = query(likesRef, where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      const productIds = querySnapshot.docs.map(doc => doc.data().productId);
      const productsData: Product[] = [];
      
      await Promise.all(
        productIds.map(async (productId) => {
          const productSnap = await getDoc(doc(db, "products", productId));
          if (productSnap.exists()) {
            const data = productSnap.data();
            productsData.push({
              id: productSnap.id,
              product_name: data.product_name || "Unknown Product",
              brand: data.brand || "Unknown Brand",
              image: data.image || "",
              average_rating: data.average_rating || 0,
            });
          }
        })
      );

      setFavorites(productsData);

    } catch (error) {
      console.error("Error fetching favorites:", error);
      Alert.alert("Error", "Failed to load favorites.");
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Product }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push({ pathname: "/product-detail", params: { id: item.id } })}
    >
      <Image source={{ uri: item.image }} style={styles.image} />
      
      <View style={styles.info}>
        <Text style={styles.brand}>{item.brand}</Text>
        <Text style={styles.name} numberOfLines={2}>{item.product_name}</Text>
        <Text style={styles.rating}>⭐ {item.average_rating ? item.average_rating.toFixed(1) : "New"}</Text>
      </View>

      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>My Favourites</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#FF7AA2" style={{ marginTop: 50 }} />
      ) : favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
            <Text style={{ fontSize: 30, marginBottom: 10 }}>💔</Text>
            <Text style={styles.emptyText}>No favourite yet.</Text>
            <Text style={styles.subText}>Go browse and like some products!</Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAF4",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    elevation: 2,
  },
  backBtn: {
    marginRight: 15,
  },
  backText: {
    fontSize: 16,
    color: "#FF7AA2",
    fontWeight: "600",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    paddingHorizontal: 60,
  },
  listContent: {
    padding: 20,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    elevation: 1,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: "#eee",
  },
  info: {
    flex: 1,
    marginLeft: 15,
    justifyContent: "center",
  },
  brand: {
    fontSize: 12,
    color: "#888",
    marginBottom: 2,
    textTransform: "uppercase",
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  rating: {
    fontSize: 13,
    color: "#555",
  },
  arrow: {
    fontSize: 24,
    color: "#ccc",
    marginRight: 5,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#555",
  },
  subText: {
    color: "#999",
    marginTop: 5,
  },
});