import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import {
  useAuthStore,
  useUserStore,
  usePetStore,
  useCheckinStore,
} from "../../lib/stores";
import NicoPet from "../../components/NicoPet";
import CheckinModal from "../../components/CheckinModal";

export default function HomeScreen() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const { profile, fetchProfile, getStreak, getMoneySaved, getTimeSinceQuit } =
    useUserStore();
  const { pet, fetchPet, fetchInventory } = usePetStore();
  const { todayCheckin, fetchTodayCheckin, hasCheckedInToday } = useCheckinStore();

  const [refreshing, setRefreshing] = useState(false);
  const [showCheckin, setShowCheckin] = useState(false);
  const [time, setTime] = useState(getTimeSinceQuit());

  const streak = getStreak();
  const moneySaved = getMoneySaved();

  // Animation for streak number
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    if (user) {
      fetchProfile(user.id);
      fetchPet(user.id);
      fetchInventory(user.id);
      fetchTodayCheckin(user.id);
    }
  }, [user]);

  // Update timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getTimeSinceQuit());
    }, 1000);
    return () => clearInterval(interval);
  }, [profile]);

  // Pulse animation for streak
  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.05, { duration: 1000 }),
      -1,
      true
    );
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    if (user) {
      await Promise.all([
        fetchProfile(user.id),
        fetchPet(user.id),
        fetchTodayCheckin(user.id),
      ]);
    }
    setRefreshing(false);
  };

  const handleHelpNow = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push("/crisis");
  };

  const handleCheckin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowCheckin(true);
  };

  const formatTime = () => {
    const { days, hours, minutes, seconds } = time;
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    }
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#14B8A6"
          />
        }
      >
        {/* Header */}
        <View className="px-6 pt-4 pb-2">
          <Text className="text-text-muted text-lg">
            {profile?.name
              ? t("home.greeting", { name: profile.name })
              : t("home.greetingDefault")}
          </Text>
        </View>

        {/* Streak Card */}
        <View className="px-6 py-4">
          <LinearGradient
            colors={["#14B8A6", "#06B6D4"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-3xl p-6"
          >
            <Text className="text-white/80 text-center text-lg mb-2">
              {t("home.streakTitle")}
            </Text>
            <Animated.View style={animatedStyle}>
              <Text className="text-white text-center text-7xl font-bold">
                {streak}
              </Text>
            </Animated.View>
            <Text className="text-white/80 text-center text-xl">
              {streak === 1 ? t("common.day") : t("common.days")}
            </Text>

            {/* Timer */}
            <View className="mt-4 pt-4 border-t border-white/20">
              <Text className="text-white/60 text-center text-sm">
                {t("home.timeSince")}
              </Text>
              <Text className="text-white text-center text-2xl font-semibold">
                {formatTime()}
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Nico Pet */}
        <View className="px-6 py-4">
          <NicoPet />
        </View>

        {/* Stats Row */}
        <View className="flex-row px-6 py-2 space-x-4">
          <View className="flex-1 bg-background-card rounded-2xl p-4">
            <Text className="text-text-muted text-sm">{t("home.moneySaved")}</Text>
            <Text className="text-accent text-2xl font-bold">
              {moneySaved.toFixed(0)} kr
            </Text>
          </View>
          <View className="flex-1 bg-background-card rounded-2xl p-4">
            <Text className="text-text-muted text-sm">
              {t("home.healthProgress")}
            </Text>
            <Text className="text-primary text-2xl font-bold">
              {Math.min(100, Math.round((streak / 30) * 100))}%
            </Text>
          </View>
        </View>

        {/* Check-in Button */}
        <View className="px-6 py-4">
          <TouchableOpacity
            onPress={handleCheckin}
            disabled={hasCheckedInToday()}
            className={`rounded-2xl p-4 ${
              hasCheckedInToday() ? "bg-background-card" : "bg-background-light"
            }`}
          >
            <View className="flex-row items-center justify-center">
              <Text className="text-2xl mr-3">
                {hasCheckedInToday() ? "✅" : "📝"}
              </Text>
              <Text
                className={`text-lg ${
                  hasCheckedInToday() ? "text-accent" : "text-white"
                }`}
              >
                {hasCheckedInToday()
                  ? t("home.checkedIn")
                  : t("home.dailyCheckin")}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Help Now Button */}
        <View className="px-6 py-4">
          <TouchableOpacity
            onPress={handleHelpNow}
            className="bg-accent-warning/20 border-2 border-accent-warning rounded-2xl p-4"
          >
            <View className="flex-row items-center justify-center">
              <Text className="text-3xl mr-3">🆘</Text>
              <Text className="text-accent-warning text-xl font-semibold">
                {t("home.helpNow")}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <CheckinModal
        visible={showCheckin}
        onClose={() => setShowCheckin(false)}
      />
    </SafeAreaView>
  );
}
