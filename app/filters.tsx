import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Filters() {
  const skinTypes = [
    "All skin type",
    "Sensitive skin",
    "Combination skin",
    "Dry skin",
    "Oily skin",
  ];

  const [selected, setSelected] = useState("All skin type");

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => setSelected("All skin type")}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Filters</Text>

        <TouchableOpacity onPress={() => router.push("/tabs/explore")}>
          <Text style={styles.okText}>OK</Text>
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* List of Skin Types */}
      <FlatList
        data={skinTypes}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => setSelected(item)}
          >
            <Text style={styles.listText}>{item}</Text>

            {selected === item && (
              <Ionicons name="checkmark" size={22} color="#FF7AA2" />
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: 55,
    paddingHorizontal: 20,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  resetText: {
    color: "#FF7AA2",
    fontSize: 16,
    fontWeight: "600",
  },

  okText: {
    color: "#FF7AA2",
    fontSize: 16,
    fontWeight: "600",
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
  },

  divider: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 15,
  },

  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  listText: {
    fontSize: 16,
    color: "#333",
  },
});
