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
  useWindowDimensions,
} from "react-native";
import { auth, db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  arrayUnion,
  arrayRemove
} from "firebase/firestore";

type Comment = {
  id: string;
  userId: string;
  text: string;
  username?: string;
};

type Post = {
  id: string;
  userId: string;
  username?: string;
  avatar?: string;
  content: string;
  topic?: string;
  likes: number;
  likedBy?: string[];
  createdAt: any;
  isExpert?: boolean;
  comments?: Comment[];
};

const CommentItem = ({ comment }: { comment: Comment }) => {
    const [userData, setUserData] = useState<any>(null);
    const defaultAvatar = "https://ui-avatars.com/api/?background=random&color=fff";
  
    useEffect(() => {
      const fetchUser = async () => {
        if (comment.userId) {
          try {
            const userDoc = await getDoc(doc(db, "users", comment.userId));
            if (userDoc.exists()) {
              setUserData(userDoc.data());
            }
          } catch (e) { console.log(e); }
        }
      };
      fetchUser();
    }, [comment.userId]);
  
    const displayName = 
        userData?.displayName || 
        userData?.username || 
        userData?.name || 
        comment.username || 
        "User";

    return (
      <View style={styles.commentRow}>
         <Text style={styles.commentText}>
            <Text style={styles.commentUser}>
                {displayName}
                {userData?.isExpert && <Text style={{color: '#4CAF50'}}> ✅</Text>}
                {" "}
            </Text>
            {comment.text}
         </Text>
      </View>
    );
};

const PostItem = ({ 
    item, 
    currentUserId, 
    onDelete, 
    onLike, 
    activePostId, 
    onToggleComment 
}: { 
    item: Post, 
    currentUserId: string | undefined, 
    onDelete: (id: string) => void,
    onLike: (post: Post) => void,
    activePostId: string | null,
    onToggleComment: (id: string) => void
}) => {
    const [userData, setUserData] = useState<any>(null);
    const [commentText, setCommentText] = useState(""); 
    const defaultAvatar = "https://ui-avatars.com/api/?background=random&color=fff";

    useEffect(() => {
        const fetchUser = async () => {
          if (item.userId) {
            try {
              const userDoc = await getDoc(doc(db, "users", item.userId));
              if (userDoc.exists()) {
                setUserData(userDoc.data());
              }
            } catch (e) { console.log(e); }
          }
        };
        fetchUser();
    }, [item.userId]);

    const handleAddComment = async () => {
        if (!commentText.trim() || !auth.currentUser) return;
        try {
            await addDoc(collection(db, "communityPosts", item.id, "comments"), {
                userId: auth.currentUser.uid,
                username: auth.currentUser.displayName || "User",
                text: commentText,
                createdAt: Timestamp.now(),
            });
            setCommentText("");
        } catch(e) { Alert.alert("Error", "Failed to comment"); }
    };

    const displayName = 
        userData?.displayName || 
        userData?.username || 
        userData?.name || 
        item.username || 
        "User";

    const displayAvatar = userData?.photoURL || item.avatar || defaultAvatar;
    const isExpertUser = userData?.isExpert === true;
    const isLikedByMe = item.likedBy?.includes(currentUserId || "");
    const isMyPost = currentUserId === item.userId;

    const formatTime = (timestamp: any) => {
        if (!timestamp?.toDate) return "Just now";
        const date = timestamp.toDate();
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffHours < 24) return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        return date.toLocaleDateString();
    };

    return (
        <View style={styles.card}>
            
            <View style={styles.cardHeader}>
                <View style={styles.userRow}>
                    <Image source={{ uri: displayAvatar }} style={styles.avatar} />
                    <View style={{flex:1}}>
                        <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
                            <View>
                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                    <Text style={styles.username}>{displayName}</Text>
                                                      
                                    {isExpertUser && (
                                        <Ionicons 
                                            name="checkmark-circle" 
                                            size={16} 
                                            color="#4CAF50" 
                                            style={{ marginLeft: 4 }} 
                                        />
                                    )}
                                </View>
                                
                                <Text style={styles.time}>{formatTime(item.createdAt)}</Text>
                            </View>
                            
                            {item.topic && (
                                <View style={styles.compactTopicBadge}>
                                    <Text style={styles.compactTopicText}>{item.topic}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
                
                {isMyPost && (
                    <TouchableOpacity style={{marginLeft: 10}} onPress={() => onDelete(item.id)}>
                        <Ionicons name="trash-outline" size={18} color="#FF4D4D" />
                    </TouchableOpacity>
                )}
            </View>

            <Text style={styles.content}>{item.content}</Text>

            <View style={styles.actionRow}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => onLike(item)}>
                    <Ionicons name={isLikedByMe ? "heart" : "heart-outline"} size={20} color={isLikedByMe ? "#FF7AA2" : "#555"} />
                    <Text style={[styles.actionText, isLikedByMe && {color: "#FF7AA2"}]}>{item.likes}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn} onPress={() => onToggleComment(item.id)}>
                    <Ionicons name={activePostId === item.id ? "chatbubble" : "chatbubble-outline"} size={19} color={activePostId === item.id ? "#FF7AA2" : "#555"} />
                    <Text style={[styles.actionText, activePostId === item.id && {color: "#FF7AA2"}]}>{item.comments?.length || 0}</Text>
                </TouchableOpacity>
            </View>

            {activePostId === item.id && (
                <View style={styles.commentSectionContainer}>
                    <View style={styles.divider} />
                    
                    {item.comments && item.comments.length > 0 ? (
                        <View style={styles.commentsList}>
                            {item.comments.map((c) => (
                                <CommentItem key={c.id} comment={c} />
                            ))}
                        </View>
                    ) : (
                        <Text style={styles.noCommentText}>No comments yet.</Text>
                    )}

                    <View style={styles.inputContainer}>
                        <TextInput
                            placeholder="Add a comment..."
                            value={commentText}
                            onChangeText={setCommentText}
                            style={styles.inputField}
                        />
                        <TouchableOpacity onPress={handleAddComment}>
                            <Ionicons name="send" size={18} color="#FF7AA2" />
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
};

export default function CommunityScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width > 700;
  const [posts, setPosts] = useState<Post[]>([]);
  const [postText, setPostText] = useState("");
  const [postTopic, setPostTopic] = useState("skincare");
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all topics");

  useEffect(() => {
    const q = query(collection(db, "communityPosts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        const postsData = await Promise.all(
          snapshot.docs.map(async (docSnap) => {
            const postData = docSnap.data();
            let commentSnap: any[] = [];
            try {
                const cQ = collection(db, "communityPosts", docSnap.id, "comments");
                const cS = await getDocs(cQ);
                commentSnap = cS.docs.map(d => ({id: d.id, ...d.data()}));
            } catch(e) { console.log(e) }
            return { id: docSnap.id, ...postData, comments: commentSnap } as Post;
          })
        );
        setPosts(postsData.filter((p): p is Post => p !== null));
      } catch (error) { console.log(error); }
    });
    return () => unsubscribe();
  }, []);

  const handlePost = async () => {
    if (!postText.trim() || !auth.currentUser) return;
    try {
      if (editingPostId) {
        await updateDoc(doc(db, "communityPosts", editingPostId), { 
            content: postText,
            topic: postTopic 
        });
        setEditingPostId(null);
      } else {
        await addDoc(collection(db, "communityPosts"), {
          userId: auth.currentUser.uid,
          username: auth.currentUser.displayName || "Anonymous", 
          avatar: auth.currentUser.photoURL || "",
          content: postText,
          topic: postTopic,
          likes: 0,
          likedBy: [],
          createdAt: Timestamp.now(),
        });
      }
      setPostText("");
      setPostTopic("skincare");
      setShowPostModal(false);
    } catch (e) { Alert.alert("Error", "Failed to post"); }
  };

  const handleDelete = async (postId: string) => {
    Alert.alert("Delete", "Are you sure?", [
        { text: "Cancel" }, 
        { text: "Delete", style: "destructive", onPress: async () => await deleteDoc(doc(db, "communityPosts", postId)) }
    ]);
  };

  const handleLike = async (post: Post) => {
    const uid = auth.currentUser?.uid;
    if (!uid) { Alert.alert("Please login to like"); return; }
    
    const currentLikedBy = post.likedBy || [];
    const isLiked = currentLikedBy.includes(uid);

    let newLikes = post.likes;
    let newLikedBy = [...currentLikedBy];

    if (isLiked) {
        newLikes = Math.max(0, newLikes - 1);
        newLikedBy = newLikedBy.filter(id => id !== uid);
    } else {
        newLikes = newLikes + 1;
        newLikedBy.push(uid);
    }

    try {
        if(isLiked) {
             await updateDoc(doc(db, "communityPosts", post.id), { 
                 likes: newLikes, 
                 likedBy: arrayRemove(uid) 
             });
        } else {
             await updateDoc(doc(db, "communityPosts", post.id), { 
                 likes: newLikes, 
                 likedBy: arrayUnion(uid) 
             });
        }
    } catch (error) { console.error("Like error:", error); }
  };

  const filteredPosts = posts.filter((post) => selectedFilter === "all topics" || post.topic === selectedFilter);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F8EC" />
      
      <View style={{ flex: 1, alignItems: 'center' }}>
        <View style={{ width: '100%', maxWidth: isTablet ? 700 : '100%', flex: 1 }}>

            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
                <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Community</Text>
                <TouchableOpacity onPress={() => {
                    setPostText("");
                    setPostTopic("skincare");
                    setEditingPostId(null);
                    setShowPostModal(true);
                }} style={styles.iconBtn}>
                <Ionicons name="add-circle-outline" size={28} color="#1A1A1A" />
                </TouchableOpacity>
            </View>

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

            <FlatList
                data={filteredPosts}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={{marginTop: 50, alignItems: 'center'}}>
                        <Text style={{color: '#999'}}>No posts found in {selectedFilter}.</Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <PostItem 
                        item={item}
                        currentUserId={auth.currentUser?.uid}
                        onDelete={handleDelete}
                        onLike={handleLike}
                        activePostId={activePostId}
                        onToggleComment={(id) => setActivePostId(activePostId === id ? null : id)}
                    />
                )}
            />
        </View>
      </View>

      <Modal visible={showPostModal} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setShowPostModal(false)} />
        <View style={[styles.modalCard, isTablet && { width: 600, alignSelf: 'center', borderRadius: 24, bottom: 20 }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowPostModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{editingPostId ? "Edit Post" : "New Post"}</Text>
            <TouchableOpacity onPress={handlePost} disabled={!postText.trim()}>
              <Text style={[styles.modalPostText, !postText.trim() && {opacity: 0.5}]}>
                {editingPostId ? "Update" : "Post"}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.topicSelector}>
              <Text style={styles.topicLabel}>Select Topic:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {["skincare", "makeup", "health"].map((topic) => (
                      <TouchableOpacity 
                        key={topic} 
                        style={[styles.topicChip, postTopic === topic && styles.topicChipActive]}
                        onPress={() => setPostTopic(topic)}
                      >
                          <Text style={[styles.topicChipText, postTopic === topic && {color: '#fff'}]}>
                              {topic}
                          </Text>
                      </TouchableOpacity>
                  ))}
              </ScrollView>
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
    paddingVertical: 12,
    marginTop: Platform.OS === 'android' ? 30 : 0,
    backgroundColor: "#F7F8EC",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2D2D2D",
  },
  iconBtn: {
    padding: 5,
  },

  filterContainer: {
    marginBottom: 12,
  },
  filterContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  filterBtn: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#EAEAEA",
    elevation: 1,
    shadowColor: "#EAE7D6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },
  filterBtnActive: {
    backgroundColor: "#FF7AA2",
    borderColor: "#FF7AA2",
  },
  filterText: {
    fontSize: 14,
    color: "#555",
    fontWeight: "600",
  },
  filterTextActive: {
    color: "#FFF",
    fontWeight: "700",
  },

  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 50,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  userRow: {
    flexDirection: "row",
    flex: 1,
    marginRight: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    backgroundColor: "#F0F0F0",
  },
  username: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },
  time: {
    fontSize: 11,
    color: "#999",
  },
  compactTopicBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'center',
    marginLeft: 10,
  },
  compactTopicText: {
    fontSize: 10,
    color: '#666',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  content: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
    marginBottom: 8,
  },
  actionRow: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 0,
    alignItems: 'center',
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 2,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#555",
  },

  commentSectionContainer: {
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#F5F5F5",
    marginBottom: 8,
  },
  commentsList: {
    marginBottom: 8,
  },
  commentRow: {
    marginBottom: 4,
    flexDirection: "row",
  },
  commentText: {
    fontSize: 12,
    color: "#555",
    lineHeight: 16,
  },
  commentUser: {
    fontWeight: "700",
    color: "#333",
  },
  noCommentText: {
    fontSize: 11,
    color: "#999",
    fontStyle: "italic",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  inputField: {
    flex: 1,
    marginRight: 10,
    fontSize: 13,
    color: "#333",
  },

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
    height: "80%",
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
  topicSelector: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  topicLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 10,
  },
  topicChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  topicChipActive: {
    backgroundColor: '#FF7AA2',
  },
  topicChipText: {
    fontSize: 13,
    color: '#555',
  },
});