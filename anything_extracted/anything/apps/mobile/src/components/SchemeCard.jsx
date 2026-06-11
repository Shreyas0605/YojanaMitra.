import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { CheckCircle2 } from "lucide-react-native";

export default function SchemeCard({ scheme }) {
  const { title, description, matchScore, type } = scheme;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View
          style={[
            styles.badge,
            { backgroundColor: type === "Central" ? "#0369a1" : "#047857" },
          ]}
        >
          <Text style={styles.badgeText}>{type} Govt</Text>
        </View>
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle} numberOfLines={2}>
        {description}
      </Text>

      <View style={styles.matchRow}>
        <CheckCircle2 size={16} color="#22c55e" />
        <Text style={styles.matchText}>{matchScore}% Eligibility Match</Text>
      </View>

      <TouchableOpacity style={styles.button} activeOpacity={0.7}>
        <Text style={styles.buttonText}>View Details & Apply</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    padding: 16,
    marginBottom: 16,
    width: "100%",
  },
  topRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: "#f8fafc",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  title: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  matchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  },
  matchText: {
    color: "#22c55e",
    fontSize: 13,
    fontWeight: "600",
  },
  button: {
    width: "100%",
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#f97316",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#f97316",
    fontSize: 14,
    fontWeight: "600",
  },
});
