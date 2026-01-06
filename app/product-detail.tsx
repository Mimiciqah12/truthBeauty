import { db, auth } from "@/lib/firebase";
import { router, useLocalSearchParams } from "expo-router";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  Pressable,
  Alert,
  useWindowDimensions, // <--- TAMBAH INI
} from "react-native";

/* ... (Kekalkan Type Product & Review sama macam tadi) ... */
type Product = {
  id: string;
  product_name: string;
  brand: string;
  image: string;
  description: string;
  safety: string;
  ingredient: string[];
  suitable_for: string[];
  average_rating: number;
  review_count: number;
};

type Review = {
  id: string;
  avatar: string;
  username: string;
  rating: number;
  comment: string;
};

const EMPTY_PRODUCT: Product = {
  id: "",
  product_name: "",
  brand: "",
  image: "",
  description: "",
  safety: "",
  ingredient: [],
  suitable_for: [],
  average_rating: 0,
  review_count: 0,
};

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions(); // <--- DAPATKAN LEBAR SKRIN
  const isTablet = width > 700; // <--- CHECK KALAU TABLET

  const [product, setProduct] = useState<Product>(EMPTY_PRODUCT);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [text, setText] = useState("");
  const [rating, setRating] = useState<number>(0);
  const [showReview, setShowReview] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // ... (Kekalkan function handlePostReview, handleToggleLike, useEffect sama) ...
  // Sila copy paste logic function tadi di sini (saya ringkaskan ruang ni)
  const handlePostReview = async () => {
    if (!text.trim() || rating === 0) {
      Alert.alert("Incomplete", "Please add rating & review");
      return;
    }
    if (!auth.currentUser) {
      Alert.alert("Login required");
      return;
    }
    try {
      await addDoc(collection(db, "reviews"), {
        productId: id,
        userId: auth.currentUser.uid,
        username: auth.currentUser.displayName || "User",
        avatar: auth.currentUser.photoURL || `https://ui-avatars.com/api/?name=${auth.currentUser.displayName}`,
        rating,
        comment: text,
      });
      setText("");
      setRating(0);
      setShowReview(false);
      Alert.alert("Success", "Review posted");
    } catch (e) {
      Alert.alert("Error", "Failed to post review");
    }
  };

  const handleToggleLike = async () => {
    if (!auth.currentUser) {
        Alert.alert("Login required");
        return;
    }
    const likesRef = collection(db, "productLikes");
    const q = query(likesRef, where("productId", "==", id), where("userId", "==", auth.currentUser.uid));
    const snap = await getDocs(q);
    const productRef = doc(db, "products", id);

    if (snap.empty) {
        await addDoc(likesRef, { productId: id, userId: auth.currentUser.uid });
        await updateDoc(productRef, { likes_count: likeCount + 1 });
        setLiked(true);
        setLikeCount((prev) => prev + 1);
    } else {
        await deleteDoc(snap.docs[0].ref);
        await updateDoc(productRef, { likes_count: likeCount - 1 });
        setLiked(false);
        setLikeCount((prev) => prev - 1);
    }
  };

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      const snap = await getDoc(doc(db, "products", id));
      if (!snap.exists()) return;
      const data = snap.data();
      setProduct({
        id: snap.id,
        product_name: data.product_name || "",
        brand: data.brand || "",
        image: data.image || "",
        description: data.description || "",
        safety: data.safety || "",
        ingredient: Array.isArray(data.ingredient) ? data.ingredient : [],
        suitable_for: Array.isArray(data.suitable_for) ? data.suitable_for : [],
        average_rating: data.average_rating || 0,
        review_count: data.review_count || 0,
      });
      setLikeCount(data.likes_count || 0);
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const fetchReviews = async () => {
      const q = query(collection(db, "reviews"), where("productId", "==", id));
      const snap = await getDocs(q);
      const data = snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }));
      setReviews(data);
    };
    fetchReviews();
  }, [id]);

  useEffect(() => {
    if (!id || !auth.currentUser) return;
    const checkLike = async () => {
      const q = query(collection(db, "productLikes"), where("productId", "==", id), where("userId", "==", auth.currentUser!.uid));
      const snap = await getDocs(q);
      setLiked(!snap.empty);
    };
    checkLike();
  }, [id]);

  return (
    <ScrollView 
        style={styles.container} 
        contentContainerStyle={{ alignItems: 'center' }} // Center content for tablet
    >
      {/* RESPONSIVE CONTAINER: Kalau tablet, kita limit width dia */}
      <View style={{ width: '100%', maxWidth: isTablet ? 700 : '100%' }}>
          
          {/* BACK */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.back}>‹ Back</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowReview(true)}>
              <Text style={styles.plus}>＋</Text>
            </TouchableOpacity>
          </View>

          {/* TOP CARD */}
          <View style={styles.topCard}>
            <Image source={{ uri: product.image }} style={styles.productImg} />
            <View style={styles.topInfo}>
              <Text style={styles.title}>{product.product_name}</Text>
              <Text style={styles.brand}>{product.brand}</Text>
              <View style={styles.ratingRow}>
                <Text style={styles.star}>⭐ </Text>
                <Text style={styles.ratingText}>{product.average_rating} out of 5 stars</Text>
              </View>
            </View>
          </View>

          {/* LIKE ROW */}
          <View style={styles.likeRow}>
            <TouchableOpacity onPress={handleToggleLike}>
              <Text style={styles.likeIcon}>{liked ? "❤️" : "🤍"}</Text>
            </TouchableOpacity>
            <Text style={styles.likeCount}>{likeCount} likes</Text>
          </View>

          {/* DESCRIPTION */}
          <Text style={styles.section}>Descriptions</Text>
          <Text style={styles.text}>{product.description}</Text>

          {/* INGREDIENTS */}
          <Text style={styles.section}>Key Ingredients:</Text>
          {/* LOGIC RESPONSIVE: Tablet align kiri, Phone align center */}
          <View style={[styles.chips, isTablet ? { justifyContent: 'flex-start' } : { justifyContent: 'center' }]}>
            {product.ingredient?.map((i) => (
              <Text key={i} style={styles.chip}>{i}</Text>
            ))}
          </View>

          {/* SUITABLE FOR (Bahagian yang awak nak cantikkan) */}
          <Text style={styles.section}>Suitable for:</Text>
          <View style={[styles.suitableWrap, isTablet ? { justifyContent: 'flex-start' } : { justifyContent: 'center' }]}>
            {product.suitable_for.map((s) => (
              <Text key={s} style={styles.chipPink}>{s}</Text>
            ))}
          </View>

          {/* REVIEWS */}
          <Text style={styles.section}>Community Reviews</Text>
          {reviews.length === 0 && (
            <Text style={{ color: "#ffd0d0ff" }}>No reviews yet</Text>
          )}

          {reviews.map((r) => (
            <View key={r.id} style={styles.reviewCard}>
              <Image
                source={{ uri: r.avatar || `https://ui-avatars.com/api/?name=${r.username}` }}
                style={styles.avatar}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "700" }}>{r.username}</Text>
                <View style={{ flexDirection: "row" }}>
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Text key={i}>⭐</Text>
                  ))}
                </View>
                <Text>{r.comment}</Text>
              </View>
            </View>
          ))}
          
          <View style={{ height: 40 }} />

      </View>

      {/* MODAL (Review) */}
      <Modal visible={showReview} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowReview(false)} />
        <View style={[styles.modalCard, isTablet && { width: 500 }]}> 
          <Text style={styles.modalTitle}>Add Review</Text>
          <View style={{ flexDirection: "row", marginBottom: 12 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <TouchableOpacity key={n} onPress={() => setRating(n)}>
                <Text style={{ fontSize: 28, color: n <= rating ? "#FFC107" : "#ccc" }}>★</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            placeholder="Write your review..."
            placeholderTextColor="#584c4cff"
            value={text}
            onChangeText={setText}
            multiline
            style={styles.modalInput}
          />
          <View style={styles.modalBtnRow}>
            <TouchableOpacity onPress={() => setShowReview(false)}>
              <Text style={{ color: "#999" }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handlePostReview}>
              <Text style={{ color: "#FF7AA2", fontWeight: "700" }}>Post</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

/* ===== STYLES ===== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8EC",
    padding: 16,
    paddingTop: 50,
  },
  back: { color: "#FF7AA2", marginBottom: 10, fontSize: 16 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  plus: { fontSize: 28, fontWeight: "700", color: "#FF7AA2" },
  topCard: { flexDirection: "row", gap: 14, marginBottom: 20 },
  productImg: { width: 130, height: 130, borderRadius: 18, backgroundColor: "#fff" },
  topInfo: { flex: 1, justifyContent: "center" },
  ratingRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  star: { fontSize: 16, marginRight: 4 },
  ratingText: { color: "#444" },
  title: { fontSize: 22, fontWeight: "700", marginTop: -25 }, // Adjusted spacing
  brand: { color: "#646464ff", marginBottom: 3, fontSize: 15, marginTop: 5 },
  
  // Adjusted Like Row Logic
  likeRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: 'flex-end', // Pindah ke kanan sikit supaya tak langgar gambar
    marginTop: -40, 
    marginBottom: 2,
    marginRight: 162,
  },
  likeIcon: { 
    fontSize: 18 
  },
  likeCount: { 
    marginLeft: 6, color: "#444", fontSize: 14 },

  section: { marginTop: 16, marginBottom: 8, fontWeight: "700", fontSize: 17, color: "#2D2D2D" },
  text: { color: "#444", lineHeight: 22, fontSize: 15.5 },

  // Updated Ingredient Chips
  chips: { flexDirection: "row", flexWrap: "wrap", marginTop: 9, gap: 8 }, 
  chip: { 
    backgroundColor: "#E6F2D8", 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 20, 
    fontSize: 14.5, 
    color: "#4F6F3E", 
    fontWeight: "600",
    overflow: 'hidden' // Untuk pastikan rounded corner cantik
  },

  // Updated Suitable For Chips
  suitableWrap: { flexDirection: "row", flexWrap: "wrap", marginTop: 8, gap: 8 },
  chipPink: { 
    backgroundColor: "#FFD7E6", 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 20, 
    fontSize: 14.5, 
    fontWeight: "600", 
    color: "#7A2E4A",
    overflow: 'hidden'
  },

  reviewCard: { 
    flexDirection: "row", 
    gap: 12, 
    backgroundColor: "#fff", 
    padding: 16, 
    borderRadius: 18,
    marginTop: 12, 
    shadowOpacity: 0.05, 
    elevation: 1 
  },
  avatar: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: "#eee" 
  },
  
  modalOverlay: { 
    position: "absolute", 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    backgroundColor: "rgba(0, 0, 0, 0.6)" 
  },

  modalCard: { 
    position: "absolute", 
    justifyContent: "center", 
    alignSelf: "center", 
    bottom: 300, 
    width: "90%", 
    backgroundColor: "#fff", 
    borderRadius: 24, 
    padding: 20, 
    elevation: 5 
  },

  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  modalInput: { backgroundColor: "#F9F9F9", borderRadius: 14, padding: 14, height: 100, textAlignVertical: "top", marginBottom: 10 },
  modalBtnRow: { flexDirection: "row", justifyContent: "flex-end", gap: 20, marginTop: 10 },
});