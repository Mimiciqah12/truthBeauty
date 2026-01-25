import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert
} from "react-native";
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  limit,
  orderBy,
  query,
  where,
  updateDoc, 
  arrayUnion,
  arrayRemove 
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase"; 

type ExpertPostData = {
  id: string;
  userId: string;
  content: string;
  topic?: string;
  createdAt: any;
  likes: number;       
  likedBy: string[];   
  product?: {
    brand: string;
    name: string;
    safety: string;
  };
};

const ExpertCard = ({ post }: { post: ExpertPostData }) => {
    const [userData, setUserData] = useState<any>(null);
    const [likeCount, setLikeCount] = useState(post.likes || 0);
    const [isLiked, setIsLiked] = useState(false); 
    const defaultAvatar = "https://ui-avatars.com/api/?background=random&color=fff";
    const currentUserId = auth.currentUser?.uid;

    useEffect(() => {
        if (currentUserId && post.likedBy?.includes(currentUserId)) {
            setIsLiked(true);
        }
    }, [currentUserId, post.likedBy]);

    const formatTime = (timestamp: any) => {
        if (!timestamp?.toDate) return "Just now";
        const now = new Date();
        const postDate = timestamp.toDate();
        const diffMs = now.getTime() - postDate.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays > 0) return `${diffDays}d ago`;
        return "Today";
    };

    const safetyStyleMap: Record<string, any> = {
        SAFE: { backgroundColor: '#4CAF50' },
        CAUTION: { backgroundColor: '#FF9800' },
        AVOID: { backgroundColor: '#EF5350' },
    };

    useEffect(() => {
        const fetchUser = async () => {
            if (post.userId) {
                try {
                    const userSnap = await getDoc(doc(db, "users", post.userId));
                    if (userSnap.exists()) {
                        setUserData(userSnap.data());
                    }
                } catch (e) { console.log(e); }
            }
        };
        fetchUser();
    }, [post.userId]);

    const handleLike = async () => {
        if (!currentUserId) {
            Alert.alert("Login Required", "Please login to like posts.");
            return;
        }
        const newStatus = !isLiked;
        const newCount = newStatus ? likeCount + 1 : likeCount - 1;
        setIsLiked(newStatus);
        setLikeCount(newCount);

        try {
            const postRef = doc(db, "communityPosts", post.id);
            if (newStatus) {
                await updateDoc(postRef, {
                    likes: newCount,
                    likedBy: arrayUnion(currentUserId)
                });
            } else {
                await updateDoc(postRef, {
                    likes: newCount,
                    likedBy: arrayRemove(currentUserId)
                });
            }
        } catch (error) {
            console.error("Like error:", error);
            setIsLiked(!newStatus);
            setLikeCount(likeCount);
        }
    };

    const displayName = userData?.displayName || userData?.username || "Expert";
    const displayAvatar = userData?.photoURL || defaultAvatar;
    const displayRole = userData?.role || "Expert";

    return (
        <TouchableOpacity 
            activeOpacity={0.9}
            style={[styles.card, styles.expertCard]}
            onPress={() => router.push({
                pathname: "/community/insight/[id]", 
                params: { id: post.id }
            })}
        >
            <View style={styles.cardHeader}>
                <View style={styles.userInfo}>
                    <Image source={{ uri: displayAvatar }} style={styles.avatar} />
                    <View>
                        <View style={{flexDirection: 'row', alignItems:'center'}}>
                            <Text style={styles.userName}>{displayName}</Text>
                            <Ionicons name="checkmark-circle" size={14} color="#4CAF50" style={{marginLeft: 4}} />
                        </View>
                        <Text style={styles.userRole}>
                            {displayRole} • {formatTime(post.createdAt)}
                        </Text>
                    </View>
                </View>

                {post.topic && (
                    <View style={styles.tagContainer}>
                        <Text style={styles.tagText}>{post.topic}</Text>
                    </View>
                )}
            </View>

            <Text style={styles.cardContent} numberOfLines={3}>{post.content}</Text>

            {post.product && (
                <View style={styles.productTag}>
                    <Ionicons name="flask" size={12} color="#666" style={{marginRight:6}}/>
                    <Text style={styles.productName} numberOfLines={1}>
                        {post.product.brand} - {post.product.name}
                    </Text>
                    <View style={[styles.safetyBadge, safetyStyleMap[post.product.safety]]}>
                        <Text style={styles.safetyText}>{post.product.safety}</Text>
                    </View>
                </View>
            )}

            <View style={styles.actionRow}>
                <TouchableOpacity style={styles.likeBtn} onPress={handleLike}>
                    <Ionicons 
                        name={isLiked ? "heart" : "heart-outline"} 
                        size={18} 
                        color={isLiked ? "#FF7AA2" : "#888"} 
                    />
                    <Text style={[styles.likeText, isLiked && {color: "#FF7AA2", fontWeight: '700'}]}>
                        {likeCount} Likes
                    </Text>
                </TouchableOpacity>

                <View style={styles.viewDiscussion}>
                    <Text style={styles.replyText}>View discussion</Text>
                    <Ionicons name="arrow-forward" size={12} color="#999" />
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default function CommunityPreview() {
  const [posts, setPosts] = useState<ExpertPostData[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const q = query(
          collection(db, "communityPosts"),
          where("isExpert", "==", true),
          orderBy("createdAt", "desc"),
          limit(3)
        );

        const snapshot = await getDocs(q); 
        const fetchedData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as ExpertPostData[];

        setPosts(fetchedData);
      } catch (error) {
        console.error("Error fetching expert posts:", error);
      }
    };
    fetchPosts();
  }, []);

  if (posts.length === 0) return null; 

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerRow}>
        <View>
            <Text style={styles.sectionTitle}>Expert Insights</Text>
            <Text style={styles.sectionSubtitle}>Expert advice & tips</Text>
        </View>
        <TouchableOpacity onPress={() => router.push("/tabs/community")}>
            <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        {posts.map((post) => (
            <ExpertCard key={post.id} post={post} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 30,
    marginBottom: 20,
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 25,
    fontWeight: '800',
    color: '#222',
    letterSpacing: -0.2,
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
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    elevation: 2,
  },
  expertCard: {
    backgroundColor: '#F7FFF7',
    borderWidth: 1,
    borderColor: '#E0F2F1',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    backgroundColor: '#EEE',
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  userRole: {
    fontSize: 11,
    color: '#666',
    marginTop: 1,
    textTransform: 'capitalize',
  },
  tagContainer: {
    backgroundColor: "rgba(0,0,0,0.05)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 5,
  },
  tagText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#555",
    textTransform: 'uppercase',
  },
  cardContent: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
    marginBottom: 12,
  },
  productTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEE',
    marginBottom: 12,
  },
  productName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
    flex: 1,
  },
  safetyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  safetyText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFF',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.03)',
  },
  likeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  likeText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  viewDiscussion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  replyText: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
  },
});