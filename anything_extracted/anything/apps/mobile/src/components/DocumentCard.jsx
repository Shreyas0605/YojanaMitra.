import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { FileText, MoreVertical } from "lucide-react-native";

export default function DocumentCard({ name, date }) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.iconContainer}>
          <FileText size={24} color="#f97316" />
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <MoreVertical size={18} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.date}>{date}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    padding: 12,
    aspectRatio: 1,
    justifyContent: "space-between",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "rgba(249, 115, 22, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuButton: {
    padding: 4,
  },
  info: {
    marginTop: 12,
  },
  name: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  date: {
    color: "#64748b",
    fontSize: 11,
  },
});
