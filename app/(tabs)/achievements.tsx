import { View, Text, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUserStore } from "../../lib/stores";

const ACHIEVEMENTS = [
  {
    id: "first_day",
    emoji: "🌟",
    nameKey: "firstDay",
    descKey: "firstDayDesc",
    type: "streak",
    target: 1,
  },
  {
    id: "three_days",
    emoji: "⚔️",
    nameKey: "threeDays",
    descKey: "threeDaysDesc",
    type: "streak",
    target: 3,
  },
  {
    id: "one_week",
    emoji: "🏆",
    nameKey: "oneWeek",
    descKey: "oneWeekDesc",
    type: "streak",
    target: 7,
  },
  {
    id: "two_weeks",
    emoji: "🥊",
    nameKey: "twoWeeks",
    descKey: "twoWeeksDesc",
    type: "streak",
    target: 14,
  },
  {
    id: "one_month",
    emoji: "👑",
    nameKey: "oneMonth",
    descKey: "oneMonthDesc",
    type: "streak",
    target: 30,
  },
  {
    id: "saved_100",
    emoji: "💰",
    nameKey: "savedFirst",
    descKey: "savedFirstDesc",
    type: "savings",
    target: 100,
  },
  {
    id: "nico_happy",
    emoji: "😸",
    nameKey: "nicoHappy",
    descKey: "nicoHappyDesc",
    type: "pet",
    target: 3,
  },
];

export default function AchievementsScreen() {
  const { t } = useTranslation();
  const { getStreak, getMoneySaved } = useUserStore();

  const streak = getStreak();
  const saved = getMoneySaved();

  const getProgress = (achievement: (typeof ACHIEVEMENTS)[0]) => {
    switch (achievement.type) {
      case "streak":
        return Math.min(streak, achievement.target);
      case "savings":
        return Math.min(Math.floor(saved), achievement.target);
      default:
        return 0;
    }
  };

  const isUnlocked = (achievement: (typeof ACHIEVEMENTS)[0]) => {
    return getProgress(achievement) >= achievement.target;
  };

  const unlockedCount = ACHIEVEMENTS.filter(isUnlocked).length;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 100 }}>
        <Text className="text-white text-3xl font-bold mt-4 mb-2">
          {t("achievements.title")}
        </Text>
        <Text className="text-text-muted mb-6">
          {unlockedCount} / {ACHIEVEMENTS.length} {t("achievements.unlocked").toLowerCase()}
        </Text>

        <View className="space-y-4">
          {ACHIEVEMENTS.map((achievement) => {
            const unlocked = isUnlocked(achievement);
            const progress = getProgress(achievement);

            return (
              <View
                key={achievement.id}
                className={`rounded-2xl p-4 ${
                  unlocked ? "bg-primary/10 border border-primary/30" : "bg-background-card"
                }`}
              >
                <View className="flex-row items-center">
                  <View
                    className={`w-16 h-16 rounded-2xl items-center justify-center mr-4 ${
                      unlocked ? "bg-primary/20" : "bg-background"
                    }`}
                  >
                    <Text className={`text-4xl ${unlocked ? "" : "opacity-30"}`}>
                      {achievement.emoji}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text
                      className={`text-lg font-semibold ${
                        unlocked ? "text-white" : "text-text-muted"
                      }`}
                    >
                      {t(`achievements.${achievement.nameKey}`)}
                    </Text>
                    <Text
                      className={`text-sm ${
                        unlocked ? "text-text-secondary" : "text-text-muted"
                      }`}
                    >
                      {t(`achievements.${achievement.descKey}`)}
                    </Text>
                    {!unlocked && (
                      <View className="mt-2">
                        <View className="flex-row justify-between mb-1">
                          <Text className="text-text-muted text-xs">
                            {t("achievements.progress", {
                              current: progress,
                              target: achievement.target,
                            })}
                          </Text>
                        </View>
                        <View className="bg-background h-2 rounded-full overflow-hidden">
                          <View
                            className="h-full bg-primary rounded-full"
                            style={{
                              width: `${(progress / achievement.target) * 100}%`,
                            }}
                          />
                        </View>
                      </View>
                    )}
                  </View>
                  {unlocked && (
                    <Text className="text-accent text-2xl ml-2">✓</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
