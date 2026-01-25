import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { db, auth } from "@/lib/firebase";
import { 
  doc, 
  onSnapshot, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  Timestamp, 
  updateDoc, 
  increment, 
  arrayUnion, 
  arrayRemove 
} from "firebase/firestore";

export default function CommunityDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (!id) return;

    const postRef = doc(db, "communityPosts", id);
    const unsubPost = onSnapshot(postRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPost({ id: docSnap.id, ...data });
        
        if (auth.currentUser && data.likedBy?.includes(auth.currentUser.uid)) {
            setIsLiked(true);
        }
      } else {
        Alert.alert("Error", "Post not found");
        router.back();
      }
      setLoading(false);
    });

    const commentsRef = collection(db, "communityPosts", id, "comments");
    const q = query(commentsRef, orderBy("createdAt", "asc"));
    
    const unsubComments = onSnapshot(q, (snapshot) => {
      const loadedComments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setComments(loadedComments);
    });

    return () => {
      unsubPost();
      unsubComments();
    };
  }, [id]);

  const handleSendComment = async () => {
    if (!newComment.trim()) return;
    if (!auth.currentUser) {
        Alert.alert("Login Required", "Please login to comment.");
        return;
    }

    try {
      const commentsRef = collection(db, "communityPosts", id as string, "comments");
      await addDoc(commentsRef, {
        text: newComment,
        userId: auth.currentUser.uid,
        username: auth.currentUser.displayName || "Anonymous",
        avatar: auth.currentUser.photoURL || null,
        createdAt: Timestamp.now(),
      });
      setNewComment(""); 
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to post comment");
    }
  };

  const handleLike = async () => {
    if (!auth.currentUser) return;
    const postRef = doc(db, "communityPosts", id as string);

    if (isLiked) {
        setIsLiked(false);
        await updateDoc(postRef, {
            likes: increment(-1),
            likedBy: arrayRemove(auth.currentUser.uid)
        });
    } else {
        setIsLiked(true);
        await updateDoc(postRef, {
            likes: increment(1),
            likedBy: arrayUnion(auth.currentUser.uid)
        });
    }
  };

  if (loading) {
    return (
        <View style={[styles.container, {justifyContent:'center', alignItems:'center'}]}>
            <ActivityIndicator size="large" color="#FF7AA2" />
        </View>
    );
  }

  const safetyStyleMap: Record<string, any> = {
    SAFE: styles.bg_SAFE,
    CAUTION: styles.bg_CAUTION,
    AVOID: styles.bg_AVOID,
  };

  return (
    <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={{flex: 1}}
    >
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Discussion</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView contentContainerStyle={{paddingBottom: 100}} showsVerticalScrollIndicator={false}>
    
        {post && (
            <View style={styles.postCard}>
                <View style={styles.userRow}>
                <Image 
                    source={{ uri: post.avatar || "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png" }} 
                    style={styles.avatar} 
                />
                <View>
                    <View style={{flexDirection:'row', alignItems:'center', gap: 6}}>
                        <Text style={styles.username}>{post.name}</Text>
                        {post.isExpert && <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />}
                    </View>
                    <Text style={styles.role}>{post.isExpert ? (post.role || "Expert") : "Community Member"}</Text>
                </View>
                </View>

                <Text style={styles.content}>{post.content}</Text>
                
                {post.product && (
                    <View style={styles.productBox}>
                        <Ionicons name="flask-outline" size={16} color="#666" />
                        <Text style={styles.productText}>{post.product.brand} - {post.product.name}</Text>
                        <View style={[
                            styles.badge, 
                            safetyStyleMap[post.product.safety] || styles.bg_CAUTION
                        ]}>
                            <Text style={styles.badgeText}>{post.product.safety}</Text>
                        </View>
                    </View>
                )}

               
                <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.likeBtn} onPress={handleLike}>
                        <Ionicons 
                            name={isLiked ? "heart" : "heart-outline"} 
                            size={24} 
                            color={isLiked ? "#E91E63" : "#666"} 
                        />
                        <Text style={[styles.likeText, isLiked && {color: "#E91E63"}]}>
                            {post.likes || 0} Likes
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        )}

        
        <Text style={styles.sectionHeader}>Comments ({comments.length})</Text>

        {comments.length === 0 ? (
            <Text style={styles.emptyText}>No comments yet. Be the first!</Text>
        ) : (
            comments.map((c) => (
            <View key={c.id} style={styles.commentCard}>
                <Image 
                    source={{ uri: c.avatar || "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png" }} 
                    style={styles.commentAvatar} 
                />
                <View style={{flex: 1}}>
                    <Text style={styles.commentUser}>{c.username}</Text>
                    <Text style={styles.commentText}>{c.text}</Text>
                </View>
            </View>
            ))
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Add a comment..."
          value={newComment}
          onChangeText={setNewComment}
          style={styles.input}
          placeholderTextColor="#999"
        />
        <TouchableOpacity onPress={handleSendComment} disabled={!newComment.trim()}>
          <Ionicons 
            name="send" 
            size={24} 
            color={newComment.trim() ? "#FF7AA2" : "#DDD"} 
          />
        </TouchableOpacity>
      </View>
    </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8EC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50, 
    paddingBottom: 15,
    backgroundColor: '#F7F8EC',
  },
  backBtn: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: '#333',
  },
  postCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  username: {
    fontWeight: "700",
    fontSize: 15,
    color: '#222',
    marginBottom: -14 ,
  },
  role: {
    fontSize: 12,
    color: '#888',
  },
  content: {
    color: "#444",
    lineHeight: 24,
    fontSize: 15,
    marginBottom: -10,
  },
  productBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
    gap: 8,
  },
  productText: {
    flex: 1,
    fontSize: 13,
    color: '#555',
    fontWeight: '600',
  },
  badge: { 
    paddingHorizontal:8, 
    paddingVertical:4, 
    borderRadius:6 
  },
  badgeText: { 
    fontSize: 10, 
    color:'#fff', 
    fontWeight:'700'
  },
  bg_SAFE: { 
    backgroundColor: '#4CAF50' 
  },
  bg_CAUTION: { 
    backgroundColor: '#FF9800' 
  },
  bg_AVOID: { 
    backgroundColor: '#EF5350' 
  },
  actionRow: {
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 12,
    flexDirection: 'row',
  },
  likeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  likeText: {
    fontWeight: '600',
    color: '#666',
  },

  // COMMENT STYLES
  sectionHeader: {
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 20,
    marginBottom: 12,
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
    fontStyle: 'italic',
  },
  commentCard: {
    flexDirection: 'row',
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
    backgroundColor: '#EEE',
  },
  commentUser: {
    fontWeight: "700",
    fontSize: 13,
    marginBottom: 2,
    color: '#333',
  },
  commentText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },

  // INPUT STYLES
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 15,
    color: '#333',
  },
});