import { router } from "expo-router";
import React, { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function SkinProfile() {
  const [skinType, setSkinType] = useState("");
  const [concerns, setConcerns] = useState<string[]>([]); // MULTI SELECT
  const [allergies, setAllergies] = useState("");

  const skinTypes = ["Dry", "Oily", "Combination", "Sensitive"];

  const concernOptions = [
    "Acne",
    "Redness",
    "Pigmentation",
    "Dark Spots",
    "Uneven Texture",
    "Large Pores",
  ];

  // HANDLE MULTI SELECT
  const toggleConcern = (item: string) => {
    if (concerns.includes(item)) {
      setConcerns(concerns.filter((c) => c !== item)); // remove
    } else {
      setConcerns([...concerns, item]); // add
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Skin Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* SKIN TYPE - SINGLE SELECT */}
        <Text style={styles.label}>Skin Type</Text>

        {skinTypes.map((type) => (
          <TouchableOpacity
            key={type}
            style={styles.radioRow}
            onPress={() => setSkinType(type)}
          >
            <View style={styles.radioOuter}>
              {skinType === type && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.radioText}>{type}</Text>
          </TouchableOpacity>
        ))}

        {/* SKIN CONCERNS - MULTI SELECT */}
        <Text style={[styles.label, { marginTop: 20 }]}>Skin Concerns</Text>

        {concernOptions.map((item) => (
          <TouchableOpacity
            key={item}
            style={styles.radioRow}
            onPress={() => toggleConcern(item)}
          >
            <View style={styles.radioOuter}>
              {concerns.includes(item) && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.radioText}>{item}</Text>
          </TouchableOpacity>
        ))}

        {/* ALLERGIES */}
        <Text style={[styles.label, { marginTop: 20 }]}>Allergies</Text>
        <TextInput
          style={styles.input}
          value={allergies}
          onChangeText={setAllergies}
          placeholder="Any allergies? e.g. fragrance, alcohol..."
          placeholderTextColor="#aaa"
          multiline
        />

        {/* SAVE BUTTON */}
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={() =>
            alert(
              `Saved!\n\nSkin Type: ${skinType}\nConcerns: ${concerns.join(
                ", "
              )}\nAllergies: ${allergies}`
            )
          }
        >
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

/* -------------------- STYLES -------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8EC",
    paddingTop: 55,
    paddingHorizontal: 25,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },

  backText: {
    color: "#FF7AA2",
    fontSize: 16,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 10,
  },

  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#FF7AA2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FF7AA2",
  },

  radioText: {
    fontSize: 15,
    color: "#444",
  },

  input: {
    backgroundColor: "#FFE6EF",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 60,
    fontSize: 15,
    textAlignVertical: "top",
  },

  saveBtn: {
    backgroundColor: "#FF7AA2",
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 30,
    marginBottom: 20,
  },

  saveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
