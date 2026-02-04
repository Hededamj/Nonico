import { View, Text, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { usePetStore } from "../lib/stores";
import { useEffect } from "react";

export default function NicoPet() {
  const { t } = useTranslation();
  const { pet, petNico, feedPet, inventory } = usePetStore();

  const bounce = useSharedValue(0);
  const wiggle = useSharedValue(0);

  useEffect(() => {
    // Idle animation
    bounce.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 500 }),
        withTiming(0, { duration: 500 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: bounce.value },
      { rotate: `${wiggle.value}deg` },
    ],
  }));

  const handlePet = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    wiggle.value = withSequence(
      withTiming(-10, { duration: 100 }),
      withTiming(10, { duration: 100 }),
      withTiming(-10, { duration: 100 }),
      withTiming(0, { duration: 100 })
    );
    petNico();
  };

  const handleFeed = () => {
    const foodItems = inventory.filter(
      (item) => item.item_type === "food" && item.quantity > 0
    );
    if (foodItems.length > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      feedPet(foodItems[0].item_id);
    }
  };

  if (!pet) {
    return (
      <View className="bg-background-card rounded-3xl p-6 items-center">
        <Text className="text-6xl">🐱</Text>
        <Text className="text-white text-lg mt-2">Loading Nico...</Text>
      </View>
    );
  }

  const getPetEmoji = () => {
    if (!pet.is_alive) return "😵";
    if (pet.health < 30) return "🤒";
    if (pet.happiness < 30) return "😢";
    if (pet.hunger < 30) return "😫";
    if (pet.happiness > 80 && pet.health > 80) return "😸";
    return "🐱";
  };

  const getPetMessage = () => {
    if (!pet.is_alive) return "💀 Nico er død...";
    if (pet.health < 30) return t("pet.nicoIsSick");
    if (pet.hunger < 30) return t("pet.nicoIsHungry");
    if (pet.happiness < 30) return t("pet.nicoIsLonely");
    if (pet.happiness > 80) return t("pet.nicoIsHappy");
    return t("pet.nicoMessage");
  };

  const foodCount = inventory
    .filter((item) => item.item_type === "food")
    .reduce((sum, item) => sum + item.quantity, 0);

  return (
    <View className="bg-background-card rounded-3xl p-6">
      {/* Pet display */}
      <TouchableOpacity onPress={handlePet} activeOpacity={0.8}>
        <Animated.View style={animatedStyle} className="items-center">
          <Text className="text-8xl">{getPetEmoji()}</Text>
          <Text className="text-white text-xl font-semibold mt-2">
            {pet.name}
          </Text>
        </Animated.View>
      </TouchableOpacity>

      {/* Message */}
      <View className="bg-background-light rounded-2xl p-3 mt-4">
        <Text className="text-text-secondary text-center">
          {getPetMessage()}
        </Text>
      </View>

      {/* Stats */}
      <View className="flex-row mt-4 space-x-2">
        <View className="flex-1">
          <View className="flex-row justify-between mb-1">
            <Text className="text-text-muted text-xs">❤️ {t("pet.health")}</Text>
            <Text className="text-text-muted text-xs">{pet.health}%</Text>
          </View>
          <View className="bg-background h-2 rounded-full overflow-hidden">
            <View
              className={`h-full rounded-full ${
                pet.health > 50 ? "bg-accent" : "bg-accent-warning"
              }`}
              style={{ width: `${pet.health}%` }}
            />
          </View>
        </View>

        <View className="flex-1">
          <View className="flex-row justify-between mb-1">
            <Text className="text-text-muted text-xs">😊 {t("pet.happiness")}</Text>
            <Text className="text-text-muted text-xs">{pet.happiness}%</Text>
          </View>
          <View className="bg-background h-2 rounded-full overflow-hidden">
            <View
              className="h-full rounded-full bg-primary"
              style={{ width: `${pet.happiness}%` }}
            />
          </View>
        </View>

        <View className="flex-1">
          <View className="flex-row justify-between mb-1">
            <Text className="text-text-muted text-xs">🍎 {t("pet.hunger")}</Text>
            <Text className="text-text-muted text-xs">{pet.hunger}%</Text>
          </View>
          <View className="bg-background h-2 rounded-full overflow-hidden">
            <View
              className={`h-full rounded-full ${
                pet.hunger > 30 ? "bg-yellow-500" : "bg-red-500"
              }`}
              style={{ width: `${pet.hunger}%` }}
            />
          </View>
        </View>
      </View>

      {/* Action buttons */}
      <View className="flex-row mt-4 space-x-3">
        <TouchableOpacity
          onPress={handlePet}
          className="flex-1 bg-primary/20 rounded-xl py-3"
        >
          <Text className="text-primary text-center font-semibold">
            🤗 {t("pet.pet")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleFeed}
          disabled={foodCount === 0}
          className={`flex-1 rounded-xl py-3 ${
            foodCount > 0 ? "bg-accent/20" : "bg-background"
          }`}
        >
          <Text
            className={`text-center font-semibold ${
              foodCount > 0 ? "text-accent" : "text-text-muted"
            }`}
          >
            🍎 {t("pet.feed")} ({foodCount})
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
