import { Tabs } from "expo-router";
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    home: "🏠",
    progress: "📊",
    achievements: "🏆",
    community: "👥",
    profile: "👤",
  };

  return (
    <View className="items-center justify-center">
      <Text className={`text-2xl ${focused ? "opacity-100" : "opacity-50"}`}>
        {icons[name]}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#1E293B",
          borderTopColor: "#334155",
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarActiveTintColor: "#14B8A6",
        tabBarInactiveTintColor: "#64748B",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t("home.greeting", { name: "" }).split(",")[0] || "Home",
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: t("progress.title"),
          tabBarIcon: ({ focused }) => <TabIcon name="progress" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="achievements"
        options={{
          title: t("achievements.title"),
          tabBarIcon: ({ focused }) => <TabIcon name="achievements" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: t("community.title"),
          tabBarIcon: ({ focused }) => <TabIcon name="community" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("profile.title"),
          tabBarIcon: ({ focused }) => <TabIcon name="profile" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
