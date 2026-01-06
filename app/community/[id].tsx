import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";

/* ===== MOCK DATA ===== */
const QUESTION = {
  title: "Is COSRX Snail 96 suitable for sensitive skin?",
  desc:
    "I've been seeing the COSRX Snail 96 Mucin everywhere lately. I have sensitive skin and I'm worried it might irritate. Anyone tried it?",
};

const INITIAL_REPLIES = [
  {
    id: "1",
    user: "AinaSkincare",
    text: "I have sensitive skin and it worked fine for me. No irritation 👍",
    likes: 12,
    expert: false,
  },
  {
    id: "2",
    user: "DrSarahChen",
    text:
      "Snail mucin is generally safe for sensitive skin, but patch testing is recommended before full use.",
    likes: 28,
    expert: true,
  },
];

export default function DiscussionRoom() {
  const { id } = useLocalSearchParams();
  const [replies, setReplies] = useState(INITIAL_REPLIES);
  const [input, setInput] = useState("");

  const handleSend = () => {
  if (!input.trim()) return;

  const newReply = {
    id: Date.now().toString(),
    user: "You",
    text: input,
    likes: 0,
    expert: false,
  };

  setReplies([newReply, ...replies]);
  setInput("");
};


  return (
    <View style={styles.container}>
      {/* ===== HEADER ===== */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Discussion</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* ===== QUESTION ===== */}
      <View style={styles.questionCard}>
        <Text style={styles.questionTitle}>{QUESTION.title}</Text>
        <Text style={styles.questionDesc}>{QUESTION.desc}</Text>
      </View>

      {/* ===== REPLIES ===== */}
      <FlatList
        data={replies}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 90 }}
        renderItem={({ item }) => (
          <View style={styles.replyCard}>
            <View style={styles.replyHeader}>
              <Text style={styles.replyUser}>{item.user}</Text>

              {item.expert && (
                <View style={styles.expertBadge}>
                  <Text style={styles.expertText}>Expert</Text>
                </View>
              )}
            </View>

            <Text style={styles.replyText}>{item.text}</Text>

            <View style={styles.replyActions}>
              <Ionicons name="heart-outline" size={16} color="#999" />
              <Text style={styles.likeCount}>{item.likes}</Text>
            </View>
          </View>
        )}
      />

      {/* ===== INPUT BOX ===== */}
      <View style={styles.inputBar}>
        <TextInput
          placeholder="Join the discussion..."
          style={styles.input}
          value={input}
          onChangeText={setInput}
        />

        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>

          <Ionicons name="send" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ===== STYLES ===== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F8E9",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 35,
  },
  questionCard: {
    backgroundColor: "#fff",
    padding: 16,
    margin: 16,
    borderRadius: 14,
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  questionDesc: {
    fontSize: 14,
    color: "#555",
    marginTop: 6,
  },
  replyCard: {
    backgroundColor: "#fff",
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
  },
  replyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  replyUser: {
    fontWeight: "600",
    marginRight: 6,
  },
  expertBadge: {
    backgroundColor: "#E1F5FE",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  expertText: {
    fontSize: 11,
    color: "#0288D1",
    fontWeight: "600",
  },
  replyText: {
    fontSize: 14,
    color: "#333",
  },
  replyActions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  likeCount: {
    fontSize: 12,
    color: "#999",
    marginLeft: 4,
  },
  inputBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  input: {
    flex: 1,
    backgroundColor: "#F1F1F1",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
  },
  sendBtn: {
    backgroundColor: "#F48FB1",
    marginLeft: 10,
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
});
