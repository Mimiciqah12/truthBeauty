import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function CreateForumPost() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  const handlePost = async () => {
    if (!title.trim() || !desc.trim()) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    if (!auth.currentUser) {
      Alert.alert("Login required");
      return;
    }

    try {
      await addDoc(collection(db, "forumPosts"), {
        title,
        description: desc,
        authorId: auth.currentUser.uid,
        authorName: auth.currentUser.displayName || "User",
        likesCount: 0,
        commentsCount: 0,
        hasExpertReply: false,
        createdAt: serverTimestamp(),
      });

      router.back();
    } catch (e) {
      Alert.alert("Error", "Failed to post question");
      console.log(e);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Ask a Question</Text>

    
      <TextInput
        placeholder="Question title"
        placeholderTextColor="#7e7c7cff"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />

      <TextInput
        placeholder="Describe your question..."
        placeholderTextColor="#7e7c7cff"
        value={desc}
        onChangeText={setDesc}
        multiline
        style={[styles.input, { height: 120 }]}
      />

      <TouchableOpacity style={styles.btn} onPress={handlePost}>
        <Text style={{ color: "#fff", fontWeight: "700" }}>Post</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8EC",
    padding: 20,
    paddingTop: 60,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 0,
    marginBottom: 15,
    marginTop: -5,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
    paddingHorizontal: 8,

  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  btn: {
    backgroundColor: "#FF7AA2",
    padding: 16,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 10,
  },
});
