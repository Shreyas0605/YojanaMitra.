import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Sparkles } from "lucide-react-native";

export default function FAB() {
  return (
    <TouchableOpacity
      style={styles.fab}
      activeOpacity={0.8}
      onPress={() => console.log("AI Chat opened")}
    >
      <Sparkles size={24} color="#f8fafc" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 80,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#f97316",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
