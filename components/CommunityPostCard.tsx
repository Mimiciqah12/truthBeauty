import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

/* ✅ IMPORT TYPE */
import { Post } from "@/types/Post";

/* ✅ PROPS TYPE */
type Props = {
  post: Post;
  onPress?: () => void;
};

export default function CommunityPostCard({ post, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* USER */}
      <View style={styles.userRow}>
        <Image source={{ uri: post.avatar }} style={styles.avatar} />

        <View style={{ flex: 1 }}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{post.name}</Text>

            {post.isExpert && (
              <View style={styles.expertBadge}>
                <Text style={styles.expertText}>EXPERT</Text>
              </View>
            )}
          </View>

          <Text style={styles.time}>{post.time}</Text>
        </View>
      </View>

      {/* CONTENT */}
      <Text style={styles.content} numberOfLines={2}>
        {post.content}
      </Text>

      {/* PRODUCT */}
      {post.product && (
        <View style={styles.productBox}>
          <View>
            <Text style={styles.productBrand}>{post.product.brand}</Text>
            <Text style={styles.productName}>{post.product.name}</Text>
          </View>

          <Text
            style={[
              styles.safety,
              post.product.safety === "SAFE"
                ? styles.safe
                : post.product.safety === "CAUTION"
                ? styles.caution
                : styles.avoid,
            ]}
          >
            {post.product.safety}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

/* ===== STYLES ===== */
const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
  },

  userRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 10,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  name: {
    fontWeight: "700",
  },

  expertBadge: {
    backgroundColor: "#E8F5E9",
    marginLeft: 6,
    paddingHorizontal: 6,
    borderRadius: 6,
  },

  expertText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#4CAF50",
  },

  time: {
    fontSize: 12,
    color: "#888",
  },

  content: {
    color: "#444",
    lineHeight: 20,
    marginTop: 4,
  },

  productBox: {
    backgroundColor: "#F7F8EC",
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  productBrand: {
    fontSize: 12,
    color: "#777",
    textTransform: "uppercase",
  },

  productName: {
    fontWeight: "700",
  },

  safety: {
    fontWeight: "700",
    fontSize: 12,
  },

  safe: { color: "#4CAF50" },
  caution: { color: "#FF9800" },
  avoid: { color: "#F44336" },
});
