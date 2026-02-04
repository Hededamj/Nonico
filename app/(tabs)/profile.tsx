import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuthStore, useUserStore, usePetStore } from "../../lib/stores";

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const { signOut } = useAuthStore();
  const { profile } = useUserStore();
  const { pet } = usePetStore();

  const handleLogout = () => {
    Alert.alert(t("auth.logout"), "Are you sure you want to log out?", [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("auth.logout"),
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === "da" ? "en" : "da";
    i18n.changeLanguage(newLang);
  };

  const formatNicotineTypes = () => {
    if (!profile?.nicotine_types?.length) return "-";
    return profile.nicotine_types
      .map((type) => t(`onboarding.${type}`))
      .join(", ");
  };

  const formatQuitDate = () => {
    if (!profile?.quit_date) return "-";
    return new Date(profile.quit_date).toLocaleDateString(
      i18n.language === "da" ? "da-DK" : "en-US"
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 100 }}>
        <Text className="text-white text-3xl font-bold mt-4 mb-6">
          {t("profile.title")}
        </Text>

        {/* User Card */}
        <View className="bg-background-card rounded-2xl p-6 mb-6 items-center">
          <View className="bg-primary/20 w-20 h-20 rounded-full items-center justify-center mb-4">
            <Text className="text-4xl">👤</Text>
          </View>
          <Text className="text-white text-xl font-semibold">
            {profile?.name || profile?.email || "User"}
          </Text>
          {pet && (
            <View className="flex-row items-center mt-2">
              <Text className="text-2xl mr-2">🐱</Text>
              <Text className="text-text-secondary">{pet.name}</Text>
            </View>
          )}
        </View>

        {/* Stats */}
        <View className="bg-background-card rounded-2xl p-4 mb-6">
          <Text className="text-text-muted text-sm mb-4 uppercase">
            {t("profile.settings")}
          </Text>

          <TouchableOpacity
            onPress={toggleLanguage}
            className="flex-row justify-between items-center py-4 border-b border-background"
          >
            <View className="flex-row items-center">
              <Text className="text-2xl mr-3">🌐</Text>
              <Text className="text-white text-base">{t("profile.language")}</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-text-secondary mr-2">
                {i18n.language === "da" ? "Dansk" : "English"}
              </Text>
              <Text className="text-text-muted">›</Text>
            </View>
          </TouchableOpacity>

          <View className="flex-row justify-between items-center py-4 border-b border-background">
            <View className="flex-row items-center">
              <Text className="text-2xl mr-3">📅</Text>
              <Text className="text-white text-base">{t("profile.quitDate")}</Text>
            </View>
            <Text className="text-text-secondary">{formatQuitDate()}</Text>
          </View>

          <View className="flex-row justify-between items-center py-4 border-b border-background">
            <View className="flex-row items-center">
              <Text className="text-2xl mr-3">🚬</Text>
              <Text className="text-white text-base">
                {t("profile.nicotineTypes")}
              </Text>
            </View>
            <Text className="text-text-secondary">{formatNicotineTypes()}</Text>
          </View>

          <View className="flex-row justify-between items-center py-4">
            <View className="flex-row items-center">
              <Text className="text-2xl mr-3">💰</Text>
              <Text className="text-white text-base">{t("profile.dailyCost")}</Text>
            </View>
            <Text className="text-text-secondary">
              {profile?.daily_cost || 0} kr/dag
            </Text>
          </View>
        </View>

        {/* Motivation */}
        {profile?.motivation && (
          <View className="bg-background-card rounded-2xl p-4 mb-6">
            <Text className="text-text-muted text-sm mb-2 uppercase">
              {t("profile.motivation")}
            </Text>
            <Text className="text-white text-base italic">
              "{profile.motivation}"
            </Text>
          </View>
        )}

        {/* Links */}
        <View className="bg-background-card rounded-2xl p-4 mb-6">
          <TouchableOpacity className="flex-row justify-between items-center py-4 border-b border-background">
            <Text className="text-white text-base">{t("profile.about")}</Text>
            <Text className="text-text-muted">›</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row justify-between items-center py-4 border-b border-background">
            <Text className="text-white text-base">
              {t("profile.privacyPolicy")}
            </Text>
            <Text className="text-text-muted">›</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row justify-between items-center py-4">
            <Text className="text-white text-base">
              {t("profile.termsOfService")}
            </Text>
            <Text className="text-text-muted">›</Text>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-red-500/10 border border-red-500/30 rounded-2xl py-4 mb-4"
        >
          <Text className="text-red-500 text-center text-lg font-semibold">
            {t("auth.logout")}
          </Text>
        </TouchableOpacity>

        <Text className="text-text-muted text-center text-sm">
          NicoNo v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
