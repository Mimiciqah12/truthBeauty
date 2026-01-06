import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";

import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

/* ===== TYPES ===== */
type Review = {
  id: string;
  username: string;
  rating: number;
  comment: string;
  createdAt: any;
};

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);

  /* 🔥 FETCH PRODUCT */
  useEffect(() => {
    if (!id) return;

    const loadProduct = async () => {
      const snap = await getDoc(doc(db, "products", id));
      if (snap.exists()) {
        setProduct(snap.data());
      }
    };

    loadProduct();
  }, [id]);

  /* 🔥 FETCH REVIEWS (REAL-TIME) */
  useEffect(() => {
    if (!id) return;

    const q = query(
      collection(db, "products", id, "reviews"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Review, "id">),
      }));
      setReviews(data);
    });

    return () => unsub();
  }, [id]);

  /* 📝 ADD REVIEW */
  const submitReview = async () => {
    if (!auth.currentUser) {
      Alert.alert("Login required", "Please login to write a review");
      return;
    }

    if (!comment.trim()) {
      Alert.alert("Empty review", "Please write something");
      return;
    }

    try {
      await addDoc(collection(db, "products", id, "reviews"), {
        userId: auth.currentUser.uid,
        username: auth.currentUser.displayName || "Anonymous",
        rating,
        comment,
        createdAt: Timestamp.now(),
      });

      setComment("");
      setRating(5);
    } catch (e) {
      Alert.alert("Error", "Failed to submit review");
    }
  };

  if (!product) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* BACK */}
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>‹ Back</Text>
      </TouchableOpacity>

      {/* IMAGE */}
      <Image source={{ uri: product.image }} style={styles.image} />

      {/* INFO */}
      <View style={styles.card}>
        <Text style={styles.title}>{product.name}</Text>
        <Text style={styles.brand}>{product.brand}</Text>

        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.text}>{product.desc}</Text>

        <Text style={styles.sectionTitle}>Safety</Text>
        <Text style={styles.text}>{product.safety}</Text>
      </View>

      {/* ADD REVIEW */}
      <View style={styles.reviewBox}>
        <Text style={styles.sectionTitle}>Write a Review</Text>

        <View style={styles.ratingRow}>
          {[1, 2, 3, 4, 5].map((n) => (
            <TouchableOpacity key={n} onPress={() => setRating(n)}>
              <Text style={[styles.star, rating >= n && styles.starActive]}>
                ★
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          placeholder="Share your experience..."
          value={comment}
          onChangeText={setComment}
          style={styles.input}
          multiline
        />

        <TouchableOpacity style={styles.submitBtn} onPress={submitReview}>
          <Text style={styles.submitText}>Post Review</Text>
        </TouchableOpacity>
      </View>

      {/* REVIEWS */}
      <Text style={styles.sectionTitle}>User Reviews</Text>

      {reviews.map((r) => (
        <View key={r.id} style={styles.reviewCard}>
          <Text style={styles.reviewUser}>{r.username}</Text>
          <Text>{"⭐".repeat(r.rating)}</Text>
          <Text style={styles.reviewText}>{r.comment}</Text>
        </View>
      ))}

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

/* ===== STYLES ===== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8EC",
    paddingTop: 55,
    paddingHorizontal: 16,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  back: {
    color: "#FF7AA2",
    marginBottom: 8,
  },
  image: {
    width: "100%",
    height: 260,
    borderRadius: 14,
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  brand: {
    color: "#777",
    marginBottom: 10,
  },
  sectionTitle: {
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 6,
  },
  text: {
    color: "#444",
  },
  reviewBox: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  ratingRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  star: {
    fontSize: 22,
    color: "#ccc",
    marginRight: 4,
  },
  starActive: {
    color: "#FF7AA2",
  },
  input: {
    minHeight: 70,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  submitBtn: {
    backgroundColor: "#FF7AA2",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  submitText: {
    color: "#fff",
    fontWeight: "700",
  },
  reviewCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  reviewUser: {
    fontWeight: "700",
  },
  reviewText: {
    color: "#444",
    marginTop: 4,
  },
});
