import { useLocalSearchParams, router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Image,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import {
  addDoc,
  collection,
  doc,
  getDoc, // <-- Pastikan getDoc ada
  query,
  serverTimestamp,
  where,
  updateDoc,
  arrayUnion,
  arrayRemove,
  deleteDoc,
  orderBy,
  onSnapshot,
  increment,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Ionicons } from "@expo/vector-icons";
import { sendPushNotification } from "@/lib/notifications"; // <-- Import function notifikasi

export default function ForumDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  // Avatar Dummy
  const defaultAvatar = "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png";

  /* ===== REAL-TIME DATA FETCHING ===== */
  useEffect(() => {
    if (!id) return;

    // 1. Dengar perubahan pada POST
    const postRef = doc(db, "forumPosts", id);
    const unsubPost = onSnapshot(postRef, (docSnap) => {
      if (docSnap.exists()) {
        setPost({ id: docSnap.id, ...docSnap.data() });
      } else {
        Alert.alert("Error", "Post deleted");
        router.back();
      }
      setLoading(false);
    });

    // 2. Dengar perubahan pada KOMEN
    const q = query(
      collection(db, "forumComments"),
      where("postId", "==", id),
      orderBy("createdAt", "asc")
    );
    
    const unsubComments = onSnapshot(q, (snapshot) => {
        const commentsData = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setComments(commentsData);
    });

    return () => {
        unsubPost();
        unsubComments();
    };
  }, [id]);

  /* ===== LIKE MAIN POST ===== */
  const handleLikePost = async () => {
      if (!auth.currentUser) return;
      const uid = auth.currentUser.uid;
      const postRef = doc(db, "forumPosts", id!);

      const isLiked = post?.likes?.includes(uid);

      await updateDoc(postRef, {
          likes: isLiked ? arrayRemove(uid) : arrayUnion(uid),
          likesCount: isLiked ? increment(-1) : increment(1)
      });
  };

  /* ===== LIKE COMMENT ===== */
  const toggleLikeComment = async (commentId: string, currentLikes: string[]) => {
    if (!auth.currentUser) return;
    const ref = doc(db, "forumComments", commentId);
    const uid = auth.currentUser.uid;

    const isLiked = currentLikes.includes(uid);

    await updateDoc(ref, {
      likes: isLiked ? arrayRemove(uid) : arrayUnion(uid),
    });
  };

  /* ===== SEND COMMENT (WITH NOTIFICATION) ===== */
  const sendComment = async () => {
    if (!text.trim()) return;
    if (!auth.currentUser) {
        Alert.alert("Login Required", "Please login to join the discussion.");
        return;
    }

    try {
      // 1. Tambah komen ke Firestore
      await addDoc(collection(db, "forumComments"), {
        postId: id,
        comment: text,
        userId: auth.currentUser.uid,
        username: auth.currentUser.displayName || "Anonymous",
        avatar: auth.currentUser.photoURL || defaultAvatar,
        isExpert: false, 
        createdAt: serverTimestamp(),
        likes: [],
      });

      // 2. Update count pada Post
      await updateDoc(doc(db, "forumPosts", id!), {
        commentsCount: increment(1)
      });

      // 3. HANTAR PUSH NOTIFICATION (Logic Baru)
      if (post && post.userId !== auth.currentUser.uid) {
          // Cari data pemilik post
          const ownerRef = doc(db, "users", post.userId);
          const ownerSnap = await getDoc(ownerRef);

          if (ownerSnap.exists()) {
              const ownerData = ownerSnap.data();
              
              // Check settings user tu
              if (ownerData.notificationsEnabled === true && ownerData.pushToken) {
                  await sendPushNotification(
                      ownerData.pushToken,
                      "New Reply in Forum!",
                      `${auth.currentUser.displayName || "Someone"} replied: "${text}"`
                  );
                  console.log("Notification sent!");
              }
          }
      }

      setText("");
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to send comment");
    }
  };

  /* ===== FORMAT TIME ===== */
  const formatTime = (timestamp: any) => {
    if (!timestamp) return "Just now";
    const date = timestamp.toDate ? timestamp.toDate() : new Date();
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  /* ===== RENDER UI ===== */
  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#FF7AA2" />
      </View>
    );
  }

  const isPostLikedByMe = post?.likes?.includes(auth.currentUser?.uid);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F8EC" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Discussion</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          
          /* === MAIN POST === */
          ListHeaderComponent={
            <View style={styles.mainPostContainer}>
              <View style={styles.card}>
                <View style={styles.userInfoRow}>
                   <Image source={{ uri: defaultAvatar }} style={styles.avatar} />
                   <View>
                      <Text style={styles.authorName}>{post?.authorName || "User"}</Text>
                      <Text style={styles.postDate}>{formatTime(post?.createdAt)}</Text>
                   </View>
                   
                   {/* Delete Button (Owner Only) */}
                   {auth.currentUser?.uid === post?.userId && (
                     <TouchableOpacity 
                        style={styles.deleteIcon}
                        onPress={() => {
                            Alert.alert("Delete", "Are you sure?", [
                                {text:"Cancel"},
                                {text:"Delete", style:"destructive", onPress:async()=>{
                                    await deleteDoc(doc(db, "forumPosts", id!));
                                    router.back();
                                }}
                            ])
                        }}>
                        <Ionicons name="trash-outline" size={20} color="#FF4D4D" />
                     </TouchableOpacity>
                   )}
                </View>

                <Text style={styles.postTitle}>{post?.title}</Text>
                <Text style={styles.postDesc}>{post?.description}</Text>
                
                {/* Stats & Actions Row */}
                <View style={styles.statsRow}>
                    <TouchableOpacity 
                        style={styles.statItem} 
                        onPress={handleLikePost}
                    >
                        <Ionicons 
                            name={isPostLikedByMe ? "heart" : "heart-outline"} 
                            size={20} 
                            color={isPostLikedByMe ? "#FF7AA2" : "#666"} 
                        />
                        <Text style={[styles.statText, isPostLikedByMe && {color: "#FF7AA2", fontWeight:'700'}]}>
                            {post?.likesCount || 0} Likes
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.statItem}>
                        <Ionicons name="chatbubble-outline" size={18} color="#666" />
                        <Text style={styles.statText}>{post?.commentsCount || 0} Comments</Text>
                    </View>
                </View>
              </View>

              <View style={styles.commentsHeader}>
                  <Text style={styles.sectionTitle}>Replies</Text>
                  <View style={styles.line} />
              </View>
            </View>
          }

          /* === COMMENT ITEM === */
          renderItem={({ item }) => (
            <View style={styles.commentCard}>
               <Image source={{ uri: item.avatar || defaultAvatar }} style={styles.commentAvatar} />
               <View style={styles.commentContent}>
                  <View style={styles.commentHeader}>
                      <Text style={styles.commentUser}>
                        {item.username}
                        {item.isExpert && <Text style={{color: '#2F80ED'}}> ✓ Expert</Text>} 
                      </Text>
                      <Text style={styles.commentTime}>{formatTime(item.createdAt).split(' ')[0]}</Text>
                  </View>

                  <Text style={styles.commentText}>{item.comment}</Text>
                  
                  <TouchableOpacity 
                    style={styles.commentLikeBtn}
                    onPress={() => toggleLikeComment(item.id, item.likes || [])}
                  >
                     <Ionicons 
                        name={item.likes?.includes(auth.currentUser?.uid) ? "heart" : "heart-outline"} 
                        size={14} 
                        color={item.likes?.includes(auth.currentUser?.uid) ? "#FF7AA2" : "#888"} 
                     />
                     <Text style={styles.commentLikeText}>{item.likes?.length || 0} Likes</Text>
                  </TouchableOpacity>
               </View>
            </View>
          )}

          /* === EMPTY STATE === */
          ListEmptyComponent={
             <View style={styles.emptyState}>
                <View style={styles.emptyIconBg}>
                    <Ionicons name="chatbubbles" size={40} color="#FF7AA2" />
                </View>
                <Text style={styles.emptyTitle}>No replies yet</Text>
                <Text style={styles.emptyText}>
                    Be the first to share your thoughts! Your answer might help {post?.authorName} find the right solution.
                </Text>
             </View>
          }
        />

        {/* === INPUT BAR === */ }
        <View style={styles.inputWrapper}>
           <View style={styles.inputContainer}>
              <TextInput
                placeholder="Write a helpful reply..."
                value={text}
                onChangeText={setText}
                style={styles.textInput}
                multiline
                placeholderTextColor="#999"
              />
              <TouchableOpacity onPress={sendComment} style={styles.sendBtn}>
                 <Ionicons name="arrow-up" size={20} color="#FFF" />
              </TouchableOpacity>
           </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ===== STYLES ===== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8EC" },
  center: { justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#F7F8EC", marginTop: Platform.OS === 'android' ? 30 : 0 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#2D2D2D" },
  backBtn: { padding: 8 },
  
  mainPostContainer: { padding: 16, paddingBottom: 0 },
  card: { backgroundColor: "#FFF", borderRadius: 20, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 4 },
  userInfoRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10, backgroundColor: "#EEE" },
  authorName: { fontSize: 15, fontWeight: "700", color: "#333" },
  postDate: { fontSize: 12, color: "#999" },
  deleteIcon: { marginLeft: 'auto', padding: 5 },
  
  postTitle: { fontSize: 18, fontWeight: "800", color: "#1A1A1A", marginBottom: 8, lineHeight: 26 },
  postDesc: { fontSize: 15, color: "#4A4A4A", lineHeight: 22, marginBottom: 16 },
  
  statsRow: { flexDirection: 'row', gap: 20, borderTopWidth: 1, borderTopColor: '#F5F5F5', paddingTop: 12 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statText: { fontSize: 14, color: "#666", fontWeight: '500' },

  commentsHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 24, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#444", marginRight: 10 },
  line: { flex: 1, height: 1, backgroundColor: "#DDD" },

  commentCard: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 16 },
  commentAvatar: { width: 32, height: 32, borderRadius: 16, marginRight: 10, backgroundColor: '#DDD' },
  commentContent: { flex: 1, backgroundColor: "#FFF", borderRadius: 16, borderTopLeftRadius: 4, padding: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  commentUser: { fontSize: 13, fontWeight: "700", color: "#333" },
  commentTime: { fontSize: 11, color: "#AAA" },
  commentText: { fontSize: 14, color: "#444", lineHeight: 20, marginBottom: 8 },
  commentLikeBtn: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F9F9F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  commentLikeText: { fontSize: 11, color: "#666" },

  /* EMPTY STATE STYLES */
  emptyState: { alignItems: 'center', marginTop: 40, paddingHorizontal: 40 },
  emptyIconBg: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFF0F5', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 8 },
  emptyText: { textAlign: 'center', fontSize: 14, color: "#888", lineHeight: 20 },

  inputWrapper: { backgroundColor: "#F7F8EC", paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.05)" },
  inputContainer: { flexDirection: "row", alignItems: "flex-end", backgroundColor: "#FFF", borderRadius: 24, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: "#EAEAEA", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  textInput: { flex: 1, fontSize: 15, color: "#333", maxHeight: 100, paddingTop: 8, paddingBottom: 8 },
  sendBtn: { backgroundColor: "#FF7AA2", width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center", marginLeft: 10, marginBottom: 2 },
});