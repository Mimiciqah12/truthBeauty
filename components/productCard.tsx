import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export type SafetyLevel = "SAFE" | "CAUTION" | "AVOID";

export type Ingredient = {
  name: string;
  level: SafetyLevel;
  function: string;
};

type Props = {
  name: string;
  brand: string;
  image: any;
  overallLevel: SafetyLevel;
  ingredients: Ingredient[];
  rating?: number;
  reviews?: number;
  recommendPct?: number;
};

export default function ProductCard({
  name,
  brand,
  image,
  overallLevel,
  ingredients,
  rating = 0,
  reviews = 0,
  recommendPct = 0,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  const levelColor =
    overallLevel === "SAFE"
      ? "#4CAF50"
      : overallLevel === "CAUTION"
      ? "#FF9800"
      : "#F44336";

  return (
    <View style={styles.card}>
  
      <View style={styles.headerRow}>
        <View style={styles.imageWrapper}>
          <Image source={image} style={styles.image} />
        </View>

        <View style={styles.infoCol}>
          <Text style={styles.brand}>{brand}</Text>
          <Text style={styles.name} numberOfLines={2}>
            {name}
          </Text>

          {(rating > 0 || recommendPct > 0) && (
            <View style={styles.ratingRow}>
              {rating > 0 && (
                <>
                  <Ionicons name="star" size={14} color="#FFC107" />
                  <Text style={styles.ratingText}>
                    {rating.toFixed(1)} ({reviews})
                  </Text>
                </>
              )}

              {recommendPct > 0 && (
                <>
                  <View style={styles.dot} />
                  <Ionicons name="thumbs-up" size={14} color="#4CAF50" />
                  <Text style={styles.recommendText}>
                    {recommendPct}% recommend
                  </Text>
                </>
              )}
            </View>
          )}

          <View style={[styles.badge, { backgroundColor: levelColor }]}>
            <Text style={styles.badgeText}>{overallLevel}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.expandBtn}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <Text style={styles.expandText}>Ingredient Breakdown</Text>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={18}
          color="#666"
        />
      </TouchableOpacity>

      {expanded &&
        ingredients.map((ing, idx) => (
          <View key={idx} style={styles.ingredientRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.ingName}>{ing.name}</Text>
              <Text style={styles.ingFunc}>{ing.function}</Text>
            </View>

            <Text
              style={[
                styles.ingLevel,
                {
                  color:
                    ing.level === "SAFE"
                      ? "#4CAF50"
                      : ing.level === "CAUTION"
                      ? "#FF9800"
                      : "#F44336",
                },
              ]}
            >
              {ing.level}
            </Text>
          </View>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
  },

  headerRow: {
    flexDirection: "row",
    gap: 14,
  },

  imageWrapper: {
    width: 110,
    height: 110,
    borderRadius: 18,
    backgroundColor: "#F5EAF0",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  infoCol: {
    flex: 1,
  },

  brand: {
    fontSize: 12,
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  name: {
    fontSize: 17,
    fontWeight: "700",
    marginTop: 2,
    lineHeight: 22,
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    flexWrap: "wrap",
  },

  ratingText: {
    fontSize: 13,
    color: "#555",
    marginLeft: 4,
  },

  recommendText: {
    fontSize: 13,
    color: "#4CAF50",
    fontWeight: "600",
    marginLeft: 4,
  },

  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#ccc",
    marginHorizontal: 8,
  },

  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    marginTop: 10,
  },

  badgeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },

  expandBtn: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  expandText: {
    fontWeight: "600",
    color: "#555",
  },

  ingredientRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 0.5,
    borderColor: "#eee",
    paddingBottom: 8,
  },

  ingName: {
    fontWeight: "600",
    fontSize: 14,
  },

  ingFunc: {
    fontSize: 12,
    color: "#777",
    marginTop: 2,
  },

  ingLevel: {
    fontWeight: "700",
    fontSize: 13,
  },
});
