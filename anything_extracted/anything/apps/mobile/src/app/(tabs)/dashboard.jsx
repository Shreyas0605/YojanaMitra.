import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SchemeCard from "@/components/SchemeCard";

const MATCHED_SCHEMES = [
  {
    id: "1",
    title: "PM Kisan Samman Nidhi",
    description:
      "Income support of ₹6,000 per year in three equal installments to all landholding farmer families.",
    matchScore: 95,
    type: "Central",
  },
  {
    id: "3",
    title: "Ladli Behna Yojana",
    description:
      "Financial assistance to women to enhance their health, nutrition and financial independence.",
    matchScore: 92,
    type: "State",
  },
];

const APPLICATIONS = [
  {
    id: "1",
    name: "PM-JAY Health Card",
    status: "Approved",
    date: "Oct 12, 2025",
  },
  {
    id: "2",
    name: "Solar Pump Subsidy",
    status: "Under Review",
    date: "Nov 05, 2025",
  },
];

export default function Dashboard() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Welcome Banner */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome back, User</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>3</Text>
              <Text style={styles.summaryLabel}>Schemes Ready</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>₹12,000</Text>
              <Text style={styles.summaryLabel}>Est. Benefits</Text>
            </View>
          </View>
        </View>

        {/* Your Matched Schemes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Matched Schemes</Text>
          {MATCHED_SCHEMES.map((scheme) => (
            <SchemeCard key={scheme.id} scheme={scheme} />
          ))}
        </View>

        {/* Status Tracker */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Application Status</Text>
          <View style={styles.statusList}>
            {APPLICATIONS.map((app, index) => (
              <View key={app.id} style={styles.statusItem}>
                <View style={styles.timeline}>
                  <View
                    style={[
                      styles.dot,
                      {
                        backgroundColor:
                          app.status === "Approved" ? "#22c55e" : "#f97316",
                      },
                    ]}
                  />
                  {index < APPLICATIONS.length - 1 && (
                    <View style={styles.line} />
                  )}
                </View>
                <View style={styles.statusInfo}>
                  <Text style={styles.appName}>{app.name}</Text>
                  <Text style={styles.appDate}>{app.date}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          app.status === "Approved"
                            ? "rgba(34, 197, 94, 0.1)"
                            : "rgba(249, 115, 22, 0.1)",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        {
                          color:
                            app.status === "Approved" ? "#22c55e" : "#f97316",
                        },
                      ]}
                    >
                      {app.status}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b1a16",
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 32,
  },
  welcomeText: {
    color: "#f8fafc",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 16,
  },
  summaryCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    padding: 20,
    alignItems: "center",
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  summaryValue: {
    color: "#f97316",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  summaryLabel: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "500",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  statusList: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    padding: 16,
  },
  statusItem: {
    flexDirection: "row",
    gap: 16,
  },
  timeline: {
    alignItems: "center",
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    zIndex: 1,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginVertical: 4,
  },
  statusInfo: {
    flex: 1,
    paddingBottom: 24,
  },
  appName: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  appDate: {
    color: "#64748b",
    fontSize: 12,
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
});
