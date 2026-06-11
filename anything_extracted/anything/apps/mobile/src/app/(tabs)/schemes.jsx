import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Search as SearchIcon } from "lucide-react-native";
import SchemeCard from "@/components/SchemeCard";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";

const FILTERS = ["All", "Agriculture", "Education", "Health", "Women"];

const ALL_SCHEMES = [
  {
    id: "1",
    title: "PM Kisan Samman Nidhi",
    description:
      "Income support of ₹6,000 per year in three equal installments to all landholding farmer families.",
    matchScore: 95,
    type: "Central",
  },
  {
    id: "2",
    title: "Ayushman Bharat (PM-JAY)",
    description:
      "Health insurance cover of ₹5 Lakh per family per year for secondary and tertiary care hospitalization.",
    matchScore: 88,
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
  {
    id: "4",
    title: "National Pension Scheme",
    description:
      "A voluntary defined contribution pension system designed to enable the subscribers to make decisions regarding their future.",
    matchScore: 75,
    type: "Central",
  },
  {
    id: "5",
    title: "Post Matric Scholarship",
    description:
      "Scholarship scheme for students belonging to Scheduled Castes for studies in India.",
    matchScore: 82,
    type: "Central",
  },
];

export default function Schemes() {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState("All");

  return (
    <KeyboardAvoidingAnimatedView
      style={{ flex: 1, backgroundColor: "#0b1a16" }}
      behavior="padding"
    >
      <View style={{ flex: 1, paddingTop: insets.top }}>
        {/* Top Bar - Search */}
        <View style={styles.topBar}>
          <View style={styles.searchContainer}>
            <SearchIcon size={20} color="#94a3b8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search 4,200+ schemes..."
              placeholderTextColor="#64748b"
            />
          </View>
        </View>

        {/* Filter Bar */}
        <View style={styles.filterBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ flexGrow: 0 }}
            contentContainerStyle={styles.filterScroll}
          >
            {FILTERS.map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterChip,
                  activeFilter === filter && styles.filterChipActive,
                ]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text
                  style={[
                    styles.filterText,
                    activeFilter === filter && styles.filterTextActive,
                  ]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Vertical List */}
        <FlatList
          data={ALL_SCHEMES}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.listPadding}>
              <SchemeCard scheme={item} />
            </View>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </KeyboardAvoidingAnimatedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b1a16",
  },
  topBar: {
    padding: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 12,
    height: 48,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: "#f8fafc",
    fontSize: 15,
  },
  filterBar: {
    marginBottom: 8,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  filterChipActive: {
    backgroundColor: "#f97316",
    borderColor: "#f97316",
  },
  filterText: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "600",
  },
  filterTextActive: {
    color: "#f8fafc",
  },
  listContent: {
    paddingBottom: 100,
  },
  listPadding: {
    paddingHorizontal: 16,
  },
});
