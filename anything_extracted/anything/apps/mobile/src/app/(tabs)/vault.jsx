import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Upload } from "lucide-react-native";
import DocumentCard from "@/components/DocumentCard";

const DOCUMENTS = [
  { id: "1", name: "Aadhaar Card", date: "Uploaded Oct 10" },
  { id: "2", name: "PAN Card", date: "Uploaded Oct 10" },
  { id: "3", name: "Income Cert", date: "Uploaded Oct 12" },
  { id: "4", name: "Caste Cert", date: "Uploaded Oct 15" },
];

export default function Vault() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.headerTitle}>Secure Document Vault</Text>

        {/* Upload Dropzone */}
        <TouchableOpacity style={styles.uploadZone} activeOpacity={0.7}>
          <View style={styles.uploadIcon}>
            <Upload size={24} color="#f97316" />
          </View>
          <Text style={styles.uploadText}>Upload Document</Text>
          <Text style={styles.uploadSubtext}>PDF, JPG or PNG up to 10MB</Text>
        </TouchableOpacity>

        {/* Grid of Documents */}
        <View style={styles.grid}>
          {DOCUMENTS.map((doc, index) => (
            <View
              key={doc.id}
              style={[
                styles.gridItem,
                index % 2 === 0 ? { paddingRight: 8 } : { paddingLeft: 8 },
              ]}
            >
              <DocumentCard name={doc.name} date={doc.date} />
            </View>
          ))}
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
  headerTitle: {
    color: "#f8fafc",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 24,
  },
  uploadZone: {
    width: "100%",
    padding: 32,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f97316",
    borderStyle: "dashed",
    alignItems: "center",
    backgroundColor: "rgba(249, 115, 22, 0.03)",
    marginBottom: 32,
  },
  uploadIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(249, 115, 22, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  uploadText: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  uploadSubtext: {
    color: "#64748b",
    fontSize: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  gridItem: {
    width: "50%",
    marginBottom: 16,
  },
});
