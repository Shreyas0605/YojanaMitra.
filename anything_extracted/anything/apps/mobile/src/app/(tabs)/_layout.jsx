import { Tabs } from "expo-router";
import {
  Home,
  Search,
  FolderClosed,
  LayoutDashboard,
} from "lucide-react-native";
import { View } from "react-native";
import FAB from "@/components/FAB";

export default function TabLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: "#0b1a16" }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "#0b1a16",
            borderTopWidth: 1,
            borderColor: "rgba(255,255,255,0.1)",
            elevation: 0,
            paddingBottom: 8,
          },
          tabBarActiveTintColor: "#f97316",
          tabBarInactiveTintColor: "#94a3b8",
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "500",
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => <Home size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="schemes"
          options={{
            title: "Schemes",
            tabBarIcon: ({ color }) => <Search size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="vault"
          options={{
            title: "Vault",
            tabBarIcon: ({ color }) => <FolderClosed size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="dashboard"
          options={{
            title: "Dashboard",
            tabBarIcon: ({ color }) => (
              <LayoutDashboard size={24} color={color} />
            ),
          }}
        />
      </Tabs>
      <FAB />
    </View>
  );
}
