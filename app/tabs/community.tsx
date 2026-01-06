import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";

import { auth, db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  updateDoc,
} from "firebase/firestore";

/* ================= TYPES ================= */
type Comment = {
  id: string;
  userId: string;
  username: string;
  text: string;
};

type Post = {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  content: string;
  likes: number;
  likedBy?: string[]; // New field to track who liked
  createdAt: any;
  isExpert?: boolean;
  comments?: Comment[];
};

/* ================= SCREEN ================= */
export default function CommunityScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [postText, setPostText] = useState("");
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  
  // State untuk kontrol comment section mana yang terbuka
  const [activePostId, setActivePostId] = useState<string | null>(null);
  
  const [commentText, setCommentText] = useState("");
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all topics");

  const defaultAvatar =
    "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png";

  /* ================= FORMAT TIME ================= */
  const formatTime = (timestamp: any) => {
    if (!timestamp?.toDate) return "Just now";
    const now = new Date();
    const postDate = timestamp.toDate();
    const diffMs = now.getTime() - postDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d`;
    if (diffHours > 0) return `${diffHours}h`;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins > 0) return `${diffMins}m`;
    return "Just now";
  };

  /* ================= READ POSTS ================= */
  useEffect(() => {
    const q = query(
      collection(db, "communityPosts"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        const postsData = await Promise.all(
          snapshot.docs.map(async (docSnap) => {
            const postData = docSnap.data();
            let commentSnap: any[] = [];
            try {
                // Fetch comments
                const cQ = collection(db, "communityPosts", docSnap.id, "comments");
                const cS = await getDocs(cQ);
                commentSnap = cS.docs.map(d => ({id: d.id, ...d.data()}));
            } catch(e) {}

            return { id: docSnap.id, ...postData, comments: commentSnap } as Post;
          })
        );
        setPosts(postsData.filter((p): p is Post => p !== null));
      } catch (error) { console.log(error); }
    });
    return () => unsubscribe();
  }, []);

  /* ================= CREATE / UPDATE POST ================= */
  const handlePost = async () => {
    if (!postText.trim() || !auth.currentUser) return;
    try {
      if (editingPostId) {
        await updateDoc(doc(db, "communityPosts", editingPostId), { content: postText });
        setEditingPostId(null);
      } else {
        await addDoc(collection(db, "communityPosts"), {
          userId: auth.currentUser.uid,
          username: auth.currentUser.displayName || "Anonymous",
          avatar: auth.currentUser.photoURL || defaultAvatar,
          content: postText,
          likes: 0,
          likedBy: [], // Initialize empty array
          createdAt: Timestamp.now(),
        });
      }
      setPostText("");
      setShowPostModal(false);
    } catch (e) { Alert.alert("Error", "Failed to post"); }
  };

  /* ================= DELETE POST ================= */
  const handleDelete = async (postId: string) => {
    Alert.alert("Delete", "Are you sure you want to delete this post?", [
        { text: "Cancel" }, 
        { text: "Delete", style: "destructive", onPress: async () => await deleteDoc(doc(db, "communityPosts", postId)) }
    ]);
  };

  /* ================= LIKE / UNLIKE LOGIC ================= */
  const handleLike = async (post: Post) => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
        Alert.alert("Please login to like");
        return;
    }

    // Check kalau user dah like
    const currentLikedBy = post.likedBy || [];
    const isLiked = currentLikedBy.includes(uid);
    
    let newLikes = post.likes;
    let newLikedBy = [...currentLikedBy];

    if (isLiked) {
        // UNLIKE Logic: Remove ID, decrease count
        newLikes = Math.max(0, newLikes - 1);
        newLikedBy = newLikedBy.filter(id => id !== uid);
    } else {
        // LIKE Logic: Add ID, increase count
        newLikes = newLikes + 1;
        newLikedBy.push(uid);
    }

    try {
        await updateDoc(doc(db, "communityPosts", post.id), { 
            likes: newLikes,
            likedBy: newLikedBy
        });
    } catch (error) {
        console.error("Like error:", error);
    }
  };

  /* ================= ADD COMMENT ================= */
  const addComment = async (postId: string) => {
    if (!commentText.trim() || !auth.currentUser) return;
    await addDoc(collection(db, "communityPosts", postId, "comments"), {
      userId: auth.currentUser.uid,
      username: auth.currentUser.displayName || "Anonymous",
      text: commentText,
      createdAt: Timestamp.now(),
    });
    setCommentText("");
    // Note: Kita tak tutup (setActivePostId(null)) supaya user boleh sambung chat
  };

  const filteredPosts = posts.filter((post) => selectedFilter === "all topics" || true);

  /* ================= UI ================= */
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F8EC" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Community</Text>
        <TouchableOpacity onPress={() => setShowPostModal(true)} style={styles.iconBtn}>
          <Ionicons name="add-circle-outline" size={28} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      {/* FILTER TABS */}
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
          style={styles.filterContainer}
        >
          {["all topics", "skincare", "makeup", "health"].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterBtn, selectedFilter === filter && styles.filterBtnActive]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text style={[styles.filterText, selectedFilter === filter && styles.filterTextActive]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* POST LIST */}
      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
            const isLikedByMe = item.likedBy?.includes(auth.currentUser?.uid || "");
            const isMyPost = auth.currentUser?.uid === item.userId;

            return (
              <View style={styles.card}>
                {/* User Info */}
                <View style={styles.cardHeader}>
                  <View style={styles.userRow}>
                    <Image source={{ uri: item.avatar }} style={styles.avatar} />
                    <View>
                      <Text style={styles.username}>{item.username}</Text>
                      <Text style={styles.time}>{formatTime(item.createdAt)}</Text>
                    </View>
                  </View>
                  
                  {/* REQUIREMENT 3: Only Owner Can Edit/Delete */}
                  {isMyPost && (
                    <TouchableOpacity onPress={() => {
                        Alert.alert("Options", "", [
                            { text: "Edit", onPress: () => { setPostText(item.content); setEditingPostId(item.id); setShowPostModal(true); } },
                            { text: "Delete", style: "destructive", onPress: () => handleDelete(item.id) },
                            { text: "Cancel" }
                        ]);
                    }}>
                       <Ionicons name="ellipsis-horizontal" size={20} color="#999" />
                    </TouchableOpacity>
                  )}
                </View>
    
                {/* Post Content */}
                <Text style={styles.content}>{item.content}</Text>
    
                {/* REQUIREMENT 4: Icons close to text (No large gap) */}
                <View style={styles.actionRow}>
                  {/* REQUIREMENT 2: Toggle Like */}
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => handleLike(item)}
                  >
                    <Ionicons 
                      name={isLikedByMe ? "heart" : "heart-outline"} 
                      size={22} 
                      color={isLikedByMe ? "#FF7AA2" : "#555"} 
                    />
                    <Text style={[styles.actionText, isLikedByMe && {color: "#FF7AA2"}]}>
                        {item.likes}
                    </Text>
                  </TouchableOpacity>
    
                  {/* REQUIREMENT 1: Toggle Comments */}
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => setActivePostId(activePostId === item.id ? null : item.id)}
                  >
                    <Ionicons 
                        name={activePostId === item.id ? "chatbubble" : "chatbubble-outline"} 
                        size={21} 
                        color={activePostId === item.id ? "#FF7AA2" : "#555"} 
                    />
                    <Text style={[styles.actionText, activePostId === item.id && {color: "#FF7AA2"}]}>
                        {item.comments?.length || 0}
                    </Text>
                  </TouchableOpacity>
                </View>
    
                {/* REQUIREMENT 1: Show Comment History & Input ONLY if Active */}
                {activePostId === item.id && (
                    <View style={styles.commentSectionContainer}>
                        {/* Divider halus untuk asingkan post dengan komen */}
                        <View style={styles.divider} />
                        
                        {/* Comment History */}
                        {item.comments && item.comments.length > 0 ? (
                            <View style={styles.commentsList}>
                                {item.comments.map((c) => (
                                <View key={c.id} style={styles.commentRow}>
                                    <Text style={styles.commentText}>
                                        <Text style={styles.commentUser}>{c.username} </Text>
                                        {c.text}
                                    </Text>
                                </View>
                                ))}
                            </View>
                        ) : (
                            <Text style={styles.noCommentText}>No comments yet. Be the first!</Text>
                        )}

                        {/* Add Comment Input */}
                        <View style={styles.inputContainer}>
                            <TextInput
                            placeholder="Add a comment..."
                            value={commentText}
                            onChangeText={setCommentText}
                            style={styles.inputField}
                            />
                            <TouchableOpacity onPress={() => addComment(item.id)}>
                                <Ionicons name="send" size={20} color="#FF7AA2" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
              </View>
            );
        }}
      />

      {/* MODAL */}
      <Modal visible={showPostModal} transparent animationType="slide">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowPostModal(false)}
        />
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowPostModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingPostId ? "Edit Post" : "New Post"}
            </Text>
            <TouchableOpacity onPress={handlePost} disabled={!postText.trim()}>
              <Text style={[styles.modalPostText, !postText.trim() && {opacity: 0.5}]}>
                {editingPostId ? "Update" : "Post"}
              </Text>
            </TouchableOpacity>
          </View>
          
          <TextInput
            placeholder="Share your thoughts..."
            placeholderTextColor="#999"
            value={postText}
            onChangeText={setPostText}
            style={styles.modalInput}
            multiline
            autoFocus
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8EC", // Warm Cream Theme
  },
  
  /* HEADER */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: Platform.OS === 'android' ? 30 : 0,
    backgroundColor: "#F7F8EC",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2D2D2D",
  },
  iconBtn: { padding: 5 },

  /* FILTERS */
  filterContainer: { marginBottom: 10 },
  filterContent: { paddingHorizontal: 20, gap: 10 },
  filterBtn: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#EAEAEA",
    shadowColor: "#EAE7D6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 2,
  },
  filterBtnActive: {
    backgroundColor: "#FF7AA2",
    borderColor: "#FF7AA2",
  },
  filterText: { 
    fontSize: 14, 
    color: "#555", 
    fontWeight: "500" 
  },

  filterTextActive: { 
    color: "#FFF", 
    fontWeight: "700" 
  },

  /* POST CARD */
  listContent: { paddingHorizontal: 20, paddingBottom: 50 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  userRow: { 
    flexDirection: "row", 
    alignItems: "center" 
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 12,
    backgroundColor: "#F0F0F0",
  },
  username: { 
    fontSize: 15, 
    fontWeight: "700", 
    color: "#333" 
  },
  time: { 
    fontSize: 12, 
    color: "#999" 
  },
  
  content: {
    fontSize: 15,
    color: "#444",
    lineHeight: 22,
    marginBottom: -8, // Requirement 4: Jarak kecil je dengan icon bawah
  },
  
  /* ACTIONS (Like & Comment) */
  actionRow: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 5,
    marginTop: 0, // Pastikan rapat naik atas
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 5, // Clickable area
  },
  actionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
  },

  /* COMMENTS SECTION (Hidden by default) */
  commentSectionContainer: {
    marginTop: 10,
  },
  divider: {
    height: 1,
    backgroundColor: "#F5F5F5",
    marginBottom: 10,
  },
  commentsList: {
    marginBottom: 10,
  },
  commentRow: {
    marginBottom: 6,
    flexDirection: "row",
  },
  commentText: {
    fontSize: 13,
    color: "#555",
    lineHeight: 18,
  },
  commentUser: {
    fontWeight: "700",
    color: "#333",
  },
  noCommentText: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
    marginBottom: 10,
  },
  
  /* INPUT */
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  inputField: {
    flex: 1,
    marginRight: 10,
    fontSize: 14,
    color: "#333",
  },

  /* MODAL */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalCard: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    paddingTop: 10,
    height: "80%", // Taller modal
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  modalCancel: {
    fontSize: 15,
    color: "#6B7280",
  },
  modalPostText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FF7AA2",
  },
  modalInput: {
    flex: 1,
    padding: 20,
    fontSize: 16,
    color: "#1F2937",
    textAlignVertical: "top",
  },
});