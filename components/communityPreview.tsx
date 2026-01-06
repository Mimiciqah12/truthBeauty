import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { mapCommunityPost } from "@/lib/mapCommunityPost";

// Pastikan type ini match dengan apa yang awak guna
type CommunityPost = {
  id: string;
  name: string;
  avatar: string;
  isExpert: boolean;
  role?: string;
  content: string;
  time: string;
  likes: number;
  product?: {
    brand: string;
    name: string;
    safety: "SAFE" | "CAUTION" | "AVOID";
  };
};

export default function CommunityPreview() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const q = query(
          collection(db, "communityPosts"),
          orderBy("createdAt", "desc"),
          limit(3) // Papar 3 post supaya tak nampak kosong sangat
        );
        const snapshot = await getDocs(q);
        // Pastikan mapping type betul
        const mapped = snapshot.docs.map(mapCommunityPost) as CommunityPost[];
        setPosts(mapped);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
    fetchPosts();
  }, []);

  // Mapping warna safety untuk elak error TypeScript
  const safetyStyleMap: Record<string, any> = {
    SAFE: styles.bg_SAFE,
    CAUTION: styles.bg_CAUTION,
    AVOID: styles.bg_AVOID,
  };

  return (
    <View style={styles.wrapper}>
      {/* HEADER SECTION */}
      <View style={styles.headerRow}>
        <View>
            <Text style={styles.sectionTitle}>Community Insights</Text>
            <Text style={styles.sectionSubtitle}>Real reviews from real people</Text>
        </View>
        <TouchableOpacity onPress={() => router.push("/tabs/community" as any)}>
            <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      {/* POST LIST */}
      <View style={styles.listContainer}>
        {posts.map((post) => (
            <TouchableOpacity 
                key={post.id} 
                activeOpacity={0.9}
                style={[styles.card, post.isExpert && styles.expertCard]}
                // PENTING: Bawa user ke page detail untuk Like & Comment
                onPress={() => router.push({
                    pathname: "/community/communityDetail", // Pastikan awak create file ini nanti
                    params: { id: post.id }
                } as any)}
            >
            
            {/* USER HEADER */}
            <View style={styles.userRow}>
                <Image source={{ uri: post.avatar }} style={styles.avatar} />
                <View style={{ flex: 1 }}>
                    <View style={styles.nameContainer}>
                        <Text style={styles.userName}>{post.name}</Text>
                        {post.isExpert && <Ionicons name="checkmark-circle" size={14} color="#4CAF50" style={{marginLeft: 4}} />}
                    </View>
                    <Text style={styles.userRole}>
                        {post.isExpert ? (post.role || "Expert") : "Community Member"} • {post.time}
                    </Text>
                </View>
            </View>

            {/* CONTENT (FULL TEXT) */}
            <Text style={styles.content}>{post.content}</Text>

            {/* PRODUCT TAG (JIKA ADA) */}
            {post.product && (
                <View style={styles.productTag}>
                    <View style={styles.productLeft}>
                        <Ionicons name="flask" size={12} color="#888" />
                        <Text style={styles.productName} numberOfLines={1}>
                            {post.product.brand} - {post.product.name}
                        </Text>
                    </View>
                    <View style={[styles.safetyBadge, safetyStyleMap[post.product.safety] || styles.bg_CAUTION]}>
                        <Text style={styles.safetyText}>{post.product.safety}</Text>
                    </View>
                </View>
            )}

            {/* INTERACTION HINT (Supaya user tahu boleh tekan) */}
            <View style={styles.interactionRow}>
                <Text style={styles.replyText}>Tap to view discussion</Text>
                <Ionicons name="arrow-forward" size={14} color="#CCC" />
            </View>

            </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 30,
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#222',
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  viewAllText: {
    color: '#FF7AA2',
    fontWeight: '700',
    fontSize: 14,
    marginTop: 4,
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    // Style Shadow yang lebih lembut (Soft Shadow)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  expertCard: {
    backgroundColor: '#F7FFF7', // Hijau sangat cair untuk expert
    borderColor: '#E0F2F1',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEE',
    marginRight: 10,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginBottom: -14 ,
  },
  userRole: {
    fontSize: 12,
    color: '#999',
    marginTop: -2,
  },
  content: {
    fontSize: 15,
    color: '#444',
    lineHeight: 24, // Line height tinggi sikit supaya senang baca
    marginBottom: -3,
  },
  productTag: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EEE',
    marginBottom: 12,
  },
  productLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    flex: 1, 
  },
  safetyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  safetyText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFF',
  },
  interactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    marginTop: 4,
  },
  replyText: {
    fontSize: 12,
    color: '#CCC',
    fontStyle: 'italic',
  },
  
  // Mapping Warna
  bg_SAFE: { backgroundColor: '#4CAF50' },
  bg_CAUTION: { backgroundColor: '#FF9800' },
  bg_AVOID: { backgroundColor: '#EF5350' },
});