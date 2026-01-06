import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function Discussion() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const handlePost = () => {
    if (!title.trim() || !message.trim()) {
      Alert.alert("Error", "Please fill in both title and message.");
      return;
    }

    Alert.alert("Success", "Post created (UI only, no backend yet)");

    router.push("/tabs/community"); // Go back after posting
  };

  return (
    <View style={styles.container}>
      
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.push("/tabs/community")}>
          <Ionicons name="chevron-back" size={26} color="#FF7AA2" />
        </TouchableOpacity>

        <Text style={styles.title}>New Discussion</Text>

        <View style={{ width: 30 }} /> 
      </View>

      <View style={styles.divider} />

      {/* Title Input */}
      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        placeholder="Write your title..."
        placeholderTextColor="#999"
        value={title}
        onChangeText={setTitle}
      />

      {/* Message Input */}
      <Text style={styles.label}>Message</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Write your message..."
        placeholderTextColor="#999"
        value={message}
        onChangeText={setMessage}
        multiline
      />

      {/* Post Button */}
      <TouchableOpacity style={styles.postBtn} onPress={handlePost}>
        <Text style={styles.postText}>Post</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8EC",
    paddingTop: 55,
    paddingHorizontal: 20,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
  },

  divider: {
    height: 1,
    backgroundColor: "#ccc",
    marginVertical: 15,
  },

  label: {
    fontSize: 16,
    marginBottom: 4,
    fontWeight: "600",
  },

  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    marginBottom: 20,
  },

  textArea: {
    height: 120,
    textAlignVertical: "top",
  },

  postBtn: {
    backgroundColor: "#FF7AA2",
    paddingVertical: 14,
    borderRadius: 25,
    marginTop: 20,
    alignItems: "center",
  },

  postText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
