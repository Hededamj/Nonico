import { View, Text, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUserStore, useCheckinStore } from "../../lib/stores";

const HEALTH_MILESTONES = [
  { time: "20min", key: "health20min", hours: 0.33 },
  { time: "8h", key: "health8hours", hours: 8 },
  { time: "24h", key: "health24hours", hours: 24 },
  { time: "48h", key: "health48hours", hours: 48 },
  { time: "72h", key: "health72hours", hours: 72 },
  { time: "2 uger", key: "health2weeks", hours: 336 },
  { time: "1 måned", key: "health1month", hours: 720 },
  { time: "3 måneder", key: "health3months", hours: 2160 },
];

export default function ProgressScreen() {
  const { t } = useTranslation();
  const { getStreak, getMoneySaved, getTimeSinceQuit } = useUserStore();
  const { crisisLogs } = useCheckinStore();

  const streak = getStreak();
  const saved = getMoneySaved();
  const time = getTimeSinceQuit();
  const totalHours = time.days * 24 + time.hours;

  const cravingsOvercome = crisisLogs.filter(
    (log) => log.type === "craving"
  ).length;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 100 }}>
        <Text className="text-white text-3xl font-bold mt-4 mb-6">
          {t("progress.title")}
        </Text>

        {/* Stats Grid */}
        <View className="mb-8">
          <Text className="text-text-muted text-lg mb-4">
            {t("progress.statistics")}
          </Text>
          <View className="flex-row flex-wrap">
            <View className="w-1/2 p-2">
              <View className="bg-background-card rounded-2xl p-4">
                <Text className="text-4xl mb-2">📅</Text>
                <Text className="text-white text-2xl font-bold">{streak}</Text>
                <Text className="text-text-muted text-sm">
                  {t("progress.totalDays")}
                </Text>
              </View>
            </View>
            <View className="w-1/2 p-2">
              <View className="bg-background-card rounded-2xl p-4">
                <Text className="text-4xl mb-2">🔥</Text>
                <Text className="text-white text-2xl font-bold">{streak}</Text>
                <Text className="text-text-muted text-sm">
                  {t("progress.longestStreak")}
                </Text>
              </View>
            </View>
            <View className="w-1/2 p-2">
              <View className="bg-background-card rounded-2xl p-4">
                <Text className="text-4xl mb-2">💰</Text>
                <Text className="text-accent text-2xl font-bold">
                  {saved.toFixed(0)} kr
                </Text>
                <Text className="text-text-muted text-sm">
                  {t("progress.totalSaved")}
                </Text>
              </View>
            </View>
            <View className="w-1/2 p-2">
              <View className="bg-background-card rounded-2xl p-4">
                <Text className="text-4xl mb-2">💪</Text>
                <Text className="text-white text-2xl font-bold">
                  {cravingsOvercome}
                </Text>
                <Text className="text-text-muted text-sm">
                  {t("progress.cravingsOvercome")}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Health Timeline */}
        <View>
          <Text className="text-text-muted text-lg mb-4">
            {t("progress.healthTimeline")}
          </Text>
          <View className="bg-background-card rounded-2xl p-4">
            {HEALTH_MILESTONES.map((milestone, index) => {
              const achieved = totalHours >= milestone.hours;
              return (
                <View
                  key={milestone.key}
                  className={`flex-row items-center py-3 ${
                    index < HEALTH_MILESTONES.length - 1
                      ? "border-b border-background"
                      : ""
                  }`}
                >
                  <View
                    className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${
                      achieved ? "bg-accent/20" : "bg-background"
                    }`}
                  >
                    <Text className={achieved ? "text-accent" : "text-text-muted"}>
                      {achieved ? "✓" : "○"}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text
                      className={`font-semibold ${
                        achieved ? "text-white" : "text-text-muted"
                      }`}
                    >
                      {milestone.time}
                    </Text>
                    <Text
                      className={`text-sm ${
                        achieved ? "text-text-secondary" : "text-text-muted"
                      }`}
                    >
                      {t(`progress.${milestone.key}`)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
