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
  getDoc, 
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
import { sendPushNotification } from "@/lib/notifications";


const CommentItem = ({ item, currentUserId, onLike }: { item: any, currentUserId: string | undefined, onLike: () => void }) => {
    const [userData, setUserData] = useState<any>(null);
    const defaultAvatar = "https://ui-avatars.com/api/?background=FF7AA2&color=fff";
  
    useEffect(() => {
      const fetchUser = async () => {
        if (item.userId) {
          try {
            const userSnap = await getDoc(doc(db, "users", item.userId));
            if (userSnap.exists()) {
              setUserData(userSnap.data());
            }
          } catch (e) {
            console.log("Error fetch user for comment:", e);
          }
        }
      };
      fetchUser();
    }, [item.userId]);
  
    const displayName = userData?.username || userData?.displayName || userData?.name || item.username || "Anonymous";
    
    const displayAvatar = userData?.photoURL || item.avatar || defaultAvatar;
    
    const isExpert = userData?.isExpert === true || userData?.role === "expert" || item.isExpert === true; 
  
    return (
      <View style={styles.commentCard}>
        <Image source={{ uri: displayAvatar }} style={styles.commentAvatar} />
        <View style={styles.commentContent}>
          <View style={styles.commentHeader}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={styles.commentUser}>{displayName}</Text>
                {isExpert && (
                    <Ionicons name="checkmark-circle" size={14} color="#4CAF50" style={{ marginLeft: 4 }} />
                )}
            </View>
            <Text style={styles.commentTime}>
               {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : "Just now"}
            </Text>
          </View>
          <Text style={styles.commentText}>{item.comment}</Text>
          <TouchableOpacity style={styles.commentLikeBtn} onPress={onLike}>
            <Ionicons
              name={item.likes?.includes(currentUserId) ? "heart" : "heart-outline"}
              size={14}
              color={item.likes?.includes(currentUserId) ? "#FF7AA2" : "#888"}
            />
            <Text style={styles.commentLikeText}>{item.likes?.length || 0} Likes</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
};

export default function ForumDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [post, setPost] = useState<any>(null);
  const [authorAvatar, setAuthorAvatar] = useState<string | null>(null);
  const [authorIsExpert, setAuthorIsExpert] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  const defaultAvatar = "https://ui-avatars.com/api/?background=FF7AA2&color=fff";

  useEffect(() => {
    if (!id) return;

    // Fetch Post
    const postRef = doc(db, "forumPosts", id);
    const unsubPost = onSnapshot(postRef, async (docSnap) => {
      if (docSnap.exists()) {
        const postData = docSnap.data();
        setPost({ id: docSnap.id, ...postData });
        
        if (postData.userId) {
            const userRef = doc(db, "users", postData.userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const uData = userSnap.data();
                setAuthorAvatar(uData.photoURL);
                setAuthorIsExpert(uData.isExpert === true || uData.role === "expert");
            }
        }
      } else {
        Alert.alert("Error", "Post deleted");
        router.back();
      }
      setLoading(false);
    });

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

  const toggleLikeComment = async (commentId: string, currentLikes: string[]) => {
    if (!auth.currentUser) return;
    const ref = doc(db, "forumComments", commentId);
    const uid = auth.currentUser.uid;
    const isLiked = currentLikes.includes(uid);
    await updateDoc(ref, { likes: isLiked ? arrayRemove(uid) : arrayUnion(uid) });
  };

  const sendComment = async () => {
    if (!text.trim()) return;
    if (!auth.currentUser) {
        Alert.alert("Login Required", "Please login.");
        return;
    }

    try {
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

      await updateDoc(doc(db, "forumPosts", id!), {
        commentsCount: increment(1)
      });

      if (post && post.userId !== auth.currentUser.uid) {
         try {
             const ownerRef = doc(db, "users", post.userId);
             const ownerSnap = await getDoc(ownerRef);
             if (ownerSnap.exists()) {
                 const ownerData = ownerSnap.data();
                 if (ownerData.notificationsEnabled && ownerData.pushToken && typeof ownerData.pushToken === 'string') {
                     await sendPushNotification(
                         ownerData.pushToken,
                         "New Reply",
                         `${auth.currentUser.displayName} replied: "${text}"`
                     );
                 }
             }
         } catch (notifError) {
             console.log("Notification skipped due to error:", notifError);
         }
      }

      setText("");
    } catch (e) {
      console.error("Comment Error:", e);
      Alert.alert("Error", "Failed to send comment");
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "Just now";
    const date = timestamp.toDate ? timestamp.toDate() : new Date();
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

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
          ListHeaderComponent={
            <View style={styles.mainPostContainer}>
              <View style={styles.card}>
                <View style={styles.userInfoRow}>
                   <Image source={{ uri: authorAvatar || defaultAvatar }} style={styles.avatar} />
                   <View>
                      <View style={{flexDirection: 'row', alignItems: 'center'}}>
                          <Text style={styles.authorName}>{post?.authorName || "User"}</Text>
                          {authorIsExpert && (
                              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" style={{ marginLeft: 4 }} />
                          )}
                      </View>
                      <Text style={styles.postDate}>{formatTime(post?.createdAt)}</Text>
                   </View>
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
                <View style={styles.statsRow}>
                    <TouchableOpacity style={styles.statItem} onPress={handleLikePost}>
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
          renderItem={({ item }) => (
            <CommentItem 
              item={item}
              currentUserId={auth.currentUser?.uid}
              onLike={() => toggleLikeComment(item.id, item.likes || [])}
            />
          )}
          ListEmptyComponent={
             <View style={styles.emptyState}>
                <View style={styles.emptyIconBg}>
                    <Ionicons name="chatbubbles" size={40} color="#FF7AA2" />
                </View>
                <Text style={styles.emptyTitle}>No replies yet</Text>
                <Text style={styles.emptyText}>Be the first to share your thoughts!</Text>
             </View>
          }
        />
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

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F7F8EC" 
  },
 center: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#F7F8EC",
    marginTop: Platform.OS === 'android' ? 30 : 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2D2D2D",
  },
  backBtn: {
    padding: 8,
  },
  mainPostContainer: {
    padding: 16,
    paddingBottom: 0,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  userInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "#EEE",
  },
  authorName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333",
  },
  postDate: {
    fontSize: 12,
    color: "#999",
  },
  deleteIcon: {
    marginLeft: 'auto',
    padding: 5,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1A1A1A",
    marginBottom: 8,
    lineHeight: 26,
  },
  postDesc: {
    fontSize: 15,
    color: "#4A4A4A",
    lineHeight: 22,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    paddingTop: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: "#666",
    fontWeight: '500',
  },
  commentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#444",
    marginRight: 10,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#DDD",
  },
  commentCard: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
    backgroundColor: '#DDD',
  },
  commentContent: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 16,
    borderTopLeftRadius: 4,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  commentUser: {
    fontSize: 13,
    fontWeight: "700",
    color: "#333",
  },
  commentTime: {
    fontSize: 11,
    color: "#AAA",
  },
  commentText: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
    marginBottom: 8,
  },
  commentLikeBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F9F9F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  commentLikeText: {
    fontSize: 11,
    color: "#666",
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 40,
  },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF0F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    color: "#888",
    lineHeight: 20,
  },
  inputWrapper: {
    backgroundColor: "#F7F8EC",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#FFF",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#EAEAEA",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    maxHeight: 100,
    paddingTop: 8,
    paddingBottom: 8,
  },
  sendBtn: {
    backgroundColor: "#FF7AA2",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: 'center',
    marginLeft: 10,
    marginBottom: 2,
  },
});