import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useAuthStore, useUserStore, usePetStore } from "../../lib/stores";
import { NicotineType } from "../../lib/database.types";

type Step = "welcome" | "type" | "duration" | "usage" | "motivation" | "date" | "pet";

const NICOTINE_TYPES: { id: NicotineType; emoji: string }[] = [
  { id: "snus", emoji: "🫙" },
  { id: "vape", emoji: "💨" },
  { id: "cigarettes", emoji: "🚬" },
];

const DURATIONS = [
  { id: "less1", label: "lessThanYear" },
  { id: "1to3", label: "oneToThreeYears" },
  { id: "3to5", label: "threeToFiveYears" },
  { id: "more5", label: "moreThanFive" },
];

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const setIsOnboarded = useAuthStore((state) => state.setIsOnboarded);
  const createProfile = useUserStore((state) => state.createProfile);
  const createPet = usePetStore((state) => state.createPet);

  const [step, setStep] = useState<Step>("welcome");
  const [selectedTypes, setSelectedTypes] = useState<NicotineType[]>([]);
  const [duration, setDuration] = useState("");
  const [dailyCost, setDailyCost] = useState("");
  const [dailyUnits, setDailyUnits] = useState("");
  const [motivation, setMotivation] = useState("");
  const [quitDate, setQuitDate] = useState<"today" | "tomorrow" | "custom">("today");
  const [petName, setPetName] = useState("Nico");
  const [isLoading, setIsLoading] = useState(false);

  const toggleType = (type: NicotineType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const getQuitDateValue = () => {
    const now = new Date();
    if (quitDate === "today") {
      return now.toISOString();
    } else if (quitDate === "tomorrow") {
      now.setDate(now.getDate() + 1);
      now.setHours(0, 0, 0, 0);
      return now.toISOString();
    }
    return now.toISOString();
  };

  const handleComplete = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Create user profile
      await createProfile({
        id: user.id,
        email: user.email || "",
        name: null,
        quit_date: getQuitDateValue(),
        nicotine_types: selectedTypes,
        daily_cost: parseFloat(dailyCost) || 0,
        daily_units: parseInt(dailyUnits) || 0,
        motivation,
      });

      // Create pet
      await createPet(user.id, petName);

      setIsOnboarded(true);
      router.replace("/(tabs)/home");
    } catch (error) {
      console.error("Error completing onboarding:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const canContinue = () => {
    switch (step) {
      case "welcome":
        return true;
      case "type":
        return selectedTypes.length > 0;
      case "duration":
        return duration !== "";
      case "usage":
        return dailyCost !== "" && dailyUnits !== "";
      case "motivation":
        return motivation.trim().length > 0;
      case "date":
        return true;
      case "pet":
        return petName.trim().length > 0;
      default:
        return false;
    }
  };

  const nextStep = () => {
    const steps: Step[] = ["welcome", "type", "duration", "usage", "motivation", "date", "pet"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    const steps: Step[] = ["welcome", "type", "duration", "usage", "motivation", "date", "pet"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };

  const renderStep = () => {
    switch (step) {
      case "welcome":
        return (
          <Animated.View entering={FadeIn} exiting={FadeOut} className="items-center">
            <Text className="text-6xl mb-6">🌟</Text>
            <Text className="text-4xl font-bold text-white text-center mb-4">
              {t("onboarding.welcome")}
            </Text>
            <Text className="text-text-muted text-lg text-center px-4">
              {t("onboarding.welcomeSubtitle")}
            </Text>
          </Animated.View>
        );

      case "type":
        return (
          <Animated.View entering={FadeIn} exiting={FadeOut} className="w-full">
            <Text className="text-2xl font-bold text-white text-center mb-2">
              {t("onboarding.whatDoYouUse")}
            </Text>
            <Text className="text-text-muted text-center mb-8">
              {t("onboarding.selectAll")}
            </Text>
            <View className="space-y-4">
              {NICOTINE_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  onPress={() => toggleType(type.id)}
                  className={`flex-row items-center p-4 rounded-2xl ${
                    selectedTypes.includes(type.id)
                      ? "bg-primary/20 border-2 border-primary"
                      : "bg-background-light"
                  }`}
                >
                  <Text className="text-3xl mr-4">{type.emoji}</Text>
                  <Text className="text-white text-lg flex-1">
                    {t(`onboarding.${type.id}`)}
                  </Text>
                  {selectedTypes.includes(type.id) && (
                    <Text className="text-primary text-2xl">✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        );

      case "duration":
        return (
          <Animated.View entering={FadeIn} exiting={FadeOut} className="w-full">
            <Text className="text-2xl font-bold text-white text-center mb-8">
              {t("onboarding.howLong")}
            </Text>
            <View className="space-y-3">
              {DURATIONS.map((d) => (
                <TouchableOpacity
                  key={d.id}
                  onPress={() => setDuration(d.id)}
                  className={`p-4 rounded-2xl ${
                    duration === d.id
                      ? "bg-primary/20 border-2 border-primary"
                      : "bg-background-light"
                  }`}
                >
                  <Text className="text-white text-lg text-center">
                    {t(`onboarding.${d.label}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        );

      case "usage":
        return (
          <Animated.View entering={FadeIn} exiting={FadeOut} className="w-full">
            <Text className="text-2xl font-bold text-white text-center mb-8">
              {t("onboarding.howMuch")}
            </Text>
            <View className="space-y-6">
              <View>
                <Text className="text-text-secondary mb-2">
                  {t("onboarding.dailyCost")}
                </Text>
                <TextInput
                  className="bg-background-light rounded-2xl px-4 py-4 text-white text-lg"
                  placeholder="50"
                  placeholderTextColor="#64748B"
                  value={dailyCost}
                  onChangeText={setDailyCost}
                  keyboardType="numeric"
                />
              </View>
              <View>
                <Text className="text-text-secondary mb-2">
                  {t("onboarding.unitsPerDay")}
                </Text>
                <TextInput
                  className="bg-background-light rounded-2xl px-4 py-4 text-white text-lg"
                  placeholder="10"
                  placeholderTextColor="#64748B"
                  value={dailyUnits}
                  onChangeText={setDailyUnits}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </Animated.View>
        );

      case "motivation":
        return (
          <Animated.View entering={FadeIn} exiting={FadeOut} className="w-full">
            <Text className="text-2xl font-bold text-white text-center mb-2">
              {t("onboarding.whyQuit")}
            </Text>
            <Text className="text-text-muted text-center mb-8">
              {t("onboarding.motivationPlaceholder")}
            </Text>
            <TextInput
              className="bg-background-light rounded-2xl px-4 py-4 text-white text-lg min-h-[150px]"
              placeholder={t("onboarding.motivationPlaceholder")}
              placeholderTextColor="#64748B"
              value={motivation}
              onChangeText={setMotivation}
              multiline
              textAlignVertical="top"
            />
          </Animated.View>
        );

      case "date":
        return (
          <Animated.View entering={FadeIn} exiting={FadeOut} className="w-full">
            <Text className="text-2xl font-bold text-white text-center mb-8">
              {t("onboarding.whenStart")}
            </Text>
            <View className="space-y-3">
              <TouchableOpacity
                onPress={() => setQuitDate("today")}
                className={`p-4 rounded-2xl ${
                  quitDate === "today"
                    ? "bg-primary/20 border-2 border-primary"
                    : "bg-background-light"
                }`}
              >
                <Text className="text-white text-lg text-center">
                  {t("onboarding.today")} 🔥
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setQuitDate("tomorrow")}
                className={`p-4 rounded-2xl ${
                  quitDate === "tomorrow"
                    ? "bg-primary/20 border-2 border-primary"
                    : "bg-background-light"
                }`}
              >
                <Text className="text-white text-lg text-center">
                  {t("onboarding.tomorrow")}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        );

      case "pet":
        return (
          <Animated.View entering={FadeIn} exiting={FadeOut} className="items-center w-full">
            <Text className="text-6xl mb-4">🐱</Text>
            <Text className="text-2xl font-bold text-white text-center mb-2">
              {t("onboarding.meetNico")}
            </Text>
            <Text className="text-text-muted text-center mb-8 px-4">
              {t("onboarding.nicoIntro")}
            </Text>
            <View className="w-full">
              <Text className="text-text-secondary mb-2">
                {t("onboarding.nicoName")}
              </Text>
              <TextInput
                className="bg-background-light rounded-2xl px-4 py-4 text-white text-lg text-center"
                placeholder="Nico"
                placeholderTextColor="#64748B"
                value={petName}
                onChangeText={setPetName}
              />
            </View>
          </Animated.View>
        );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-6 py-12">
          {renderStep()}
        </View>

        <View className="px-6 pb-8">
          <View className="flex-row space-x-4">
            {step !== "welcome" && (
              <TouchableOpacity
                onPress={prevStep}
                className="flex-1 bg-background-light rounded-2xl py-4"
              >
                <Text className="text-white text-center text-lg">
                  {t("common.back")}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={nextStep}
              disabled={!canContinue() || isLoading}
              className={`${step === "welcome" ? "flex-1" : "flex-[2]"}`}
            >
              <LinearGradient
                colors={canContinue() ? ["#14B8A6", "#06B6D4"] : ["#374151", "#374151"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="rounded-2xl py-4"
              >
                <Text className="text-white text-center text-lg font-semibold">
                  {isLoading
                    ? t("common.loading")
                    : step === "pet"
                    ? t("onboarding.letsGo")
                    : t("common.continue")}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Progress dots */}
          <View className="flex-row justify-center mt-6 space-x-2">
            {["welcome", "type", "duration", "usage", "motivation", "date", "pet"].map(
              (s, i) => (
                <View
                  key={s}
                  className={`w-2 h-2 rounded-full ${
                    s === step ? "bg-primary" : "bg-background-light"
                  }`}
                />
              )
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
