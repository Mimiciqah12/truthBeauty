import { useLocalSearchParams, router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
  SafeAreaView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { 
  doc, 
  getDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp 
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";


const CommentItem = ({ comment }: { comment: any }) => {
    const [userData, setUserData] = useState<any>(null);
    const defaultAvatar = "https://ui-avatars.com/api/?background=random&color=fff&size=128";
  
    useEffect(() => {
      const fetchUser = async () => {
        if (comment.userId) {
          try {
            const userDoc = await getDoc(doc(db, "users", comment.userId));
            if (userDoc.exists()) setUserData(userDoc.data());
          } catch (e) { console.log(e); }
        }
      };
      fetchUser();
    }, [comment.userId]);
  
    const displayName = userData?.displayName || userData?.username || userData?.name || "User";
    const displayAvatar = userData?.photoURL || defaultAvatar;
  
    return (
       <View style={styles.commentItem}>
          <Image source={{ uri: displayAvatar }} style={styles.commentAvatar} />
          <View style={styles.commentBubble}>
              <Text style={styles.commentUser}>{displayName}</Text>
              <Text style={styles.commentText}>{comment.text}</Text>
          </View>
       </View>
    );
};

export default function InsightDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [post, setPost] = useState<any>(null);
  const [expertData, setExpertData] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);

 
  useEffect(() => {
    if (!id) return;
    const fetchPost = async () => {
      try {
        const docRef = doc(db, "communityPosts", id);
        const snap = await getDoc(docRef);
        
        if (snap.exists()) {
          const postData = snap.data();
          setPost({ id: snap.id, ...postData });

          // Fetch Expert
          if (postData.userId) {
             const userSnap = await getDoc(doc(db, "users", postData.userId));
             if (userSnap.exists()) {
                 setExpertData(userSnap.data());
             }
          }
        }
      } catch(e) { console.error(e); }
      setLoading(false);
    };
    fetchPost();
  }, [id]);

  
  useEffect(() => {
    if (!id) return;
    const q = query(
      collection(db, "communityComments"), 
      where("postId", "==", id),
      orderBy("createdAt", "asc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setComments(data);
    });
    return () => unsubscribe();
  }, [id]);


  const handleSend = async () => {
    if (!commentText.trim() || !auth.currentUser) return;
    try {
      await addDoc(collection(db, "communityComments"), {
        postId: id,
        text: commentText,
        userId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      });
      setCommentText("");
    } catch (e) { console.error(e); }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color="#4CAF50" /></View>;

  
  const expertName = expertData?.displayName || expertData?.username || expertData?.name || "Expert Name";
  const expertAvatar = expertData?.photoURL 
    ? expertData.photoURL 
    : `https://ui-avatars.com/api/?name=${expertName}&background=4CAF50&color=fff&size=128`;
  
  const expertRole = expertData?.role || "Verified Expert";

  return (
    <SafeAreaView style={styles.container}>
      
      <StatusBar barStyle="dark-content" backgroundColor="#F7F8EC" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Expert Insight</Text>
        <View style={{width: 24}} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          
          {post && (
            <View style={styles.expertCard}>
              <View style={styles.userRow}>
                 <Image source={{ uri: expertAvatar }} style={styles.avatar} />
                 <View style={{flex: 1}}>
                    <View style={{flexDirection:'row', alignItems:'center'}}>
                        <Text style={styles.userName}>{expertName}</Text>
                        <Ionicons name="checkmark-circle" size={16} color="#4CAF50" style={{marginLeft: 4}} />
                    </View>
                    <Text style={styles.userRole}>{expertRole}</Text>
                 </View>
              </View>
              
              <Text style={styles.content}>{post.content}</Text>
              
              {post.product && (
                  <View style={styles.productTag}>
                      <Ionicons name="flask-outline" size={16} color="#555" />
                      <Text style={{marginLeft: 5, fontWeight:'600', color:'#555'}}>
                          {post.product.brand} - {post.product.name}
                      </Text>
                  </View>
              )}
            </View>
          )}

          
          <Text style={styles.discussionTitle}>Discussion ({comments.length})</Text>

          {comments.map((c) => (
             <CommentItem key={c.id} comment={c} />
          ))}
          
          {comments.length === 0 && (
              <Text style={styles.emptyText}>No discussions yet. Ask the expert something!</Text>
          )}

        </ScrollView>

    
        <View style={styles.inputArea}>
            <TextInput 
                style={styles.input} 
                placeholder="Ask a question or discuss..." 
                value={commentText}
                onChangeText={setCommentText}
                placeholderTextColor="#999"
            />
            <TouchableOpacity onPress={handleSend}>
                <Ionicons name="send" size={24} color="#4CAF50" />
            </TouchableOpacity>
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
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: "#F7F8EC" 
  },
  header: { 
    flexDirection:'row', 
    justifyContent:'space-between', 
    alignItems:'center', 
    padding: 16, 
    backgroundColor:'#F7F8EC',  
  },
  backBtn: {
    padding: 4 
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight:'700', 
    color:'#333' 
  },
  expertCard: {
      backgroundColor: '#F7FFF7', 
      margin: 16,
      padding: 20,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#E0F2F1',
      shadowColor: "#000", shadowOffset: {width:0, height:2}, shadowOpacity:0.05, elevation:2
  },
  userRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 15 
  },
  avatar: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    marginRight: 12, 
    backgroundColor:'#eee',
    borderWidth: 1,
    borderColor: '#ddd'
  },
  userName: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#333' 
  },
  userRole: { 
    fontSize: 13, 
    color: '#666', 
    textTransform: 'capitalize', 
    marginTop: 2 
  },
  content: { 
    fontSize: 16, 
    lineHeight: 26, 
    color: '#333', 
    marginBottom: 15 
  },
  productTag: { 
    flexDirection:'row', 
    alignItems:'center', 
    backgroundColor:'#fff', 
    padding: 10, 
    borderRadius: 8, 
    alignSelf:'flex-start', 
    borderWidth:1, 
    borderColor:'#eee' 
  },
  discussionTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    marginLeft: 16, 
    marginBottom: 10, 
    color: '#444'
  },
  commentItem: { 
    flexDirection: 'row', 
    marginHorizontal: 16, 
    marginBottom: 16 
  },
  commentAvatar: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    marginRight: 10,
    backgroundColor: '#eee' 
  },
  commentBubble: { 
    flex: 1, 
    backgroundColor: '#FFF', 
    padding: 12, 
    borderRadius: 12, 
    borderTopLeftRadius: 0,
    shadowColor: "#000", 
    shadowOffset: {width:0, height:1}, 
    shadowOpacity: 0.03, 
    elevation: 1 
  },
  commentUser: { 
    fontWeight: '700', 
    fontSize: 13, 
    marginBottom: 2, 
    color: '#555' 
  },
  commentText: { 
    fontSize: 14, 
    color: '#333' 
  },
  emptyText: { 
    textAlign: 'center', 
    color: '#999', 
    marginTop: 20 
  },
  inputArea: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 12, 
    backgroundColor: '#F7F8EC', 
    borderTopWidth: 1, 
    borderTopColor: '#EEE' 
  },
  input: { 
    flex: 1, 
    backgroundColor: '#ffffffff', 
    borderRadius: 20, 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    marginRight: 10, 
    fontSize: 15, 
    color:'#333' 
  },
});