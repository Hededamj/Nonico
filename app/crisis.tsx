import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useAuthStore, useCheckinStore, usePetStore, useUserStore } from "../lib/stores";

type Mode = "menu" | "breathing" | "timer" | "reasons";

export default function CrisisScreen() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const { profile } = useUserStore();
  const { logCrisis } = useCheckinStore();
  const { makeSick } = usePetStore();

  const [mode, setMode] = useState<Mode>("menu");
  const [timer, setTimer] = useState(180); // 3 minutes
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [breathPhase, setBreathPhase] = useState<"in" | "hold" | "out">("in");
  const timerRef = useRef<NodeJS.Timeout>();

  // Breathing animation
  const breathScale = useSharedValue(1);
  const breathAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathScale.value }],
  }));

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Timer countdown
  useEffect(() => {
    if (isTimerRunning && timer > 0) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  // Breathing cycle
  useEffect(() => {
    if (mode === "breathing") {
      const cycle = () => {
        // Breathe in (4 seconds)
        setBreathPhase("in");
        breathScale.value = withTiming(1.5, {
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
        });

        setTimeout(() => {
          // Hold (4 seconds)
          setBreathPhase("hold");
        }, 4000);

        setTimeout(() => {
          // Breathe out (4 seconds)
          setBreathPhase("out");
          breathScale.value = withTiming(1, {
            duration: 4000,
            easing: Easing.inOut(Easing.ease),
          });
        }, 8000);
      };

      cycle();
      const interval = setInterval(cycle, 12000);
      return () => clearInterval(interval);
    }
  }, [mode]);

  const startTimer = () => {
    setMode("timer");
    setTimer(180);
    setIsTimerRunning(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleSlip = () => {
    Alert.alert(t("crisis.iSlipped"), t("crisis.slipConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: "Log",
        style: "destructive",
        onPress: async () => {
          if (user) {
            await logCrisis(user.id, "slip");
            await makeSick(); // Nico gets sick
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            Alert.alert("😢", t("crisis.slipLogged"));
            router.back();
          }
        },
      },
    ]);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const renderMenu = () => (
    <View className="space-y-4">
      <TouchableOpacity
        onPress={() => setMode("breathing")}
        className="bg-background-card rounded-2xl p-6"
      >
        <View className="flex-row items-center">
          <Text className="text-4xl mr-4">🧘</Text>
          <View className="flex-1">
            <Text className="text-white text-xl font-semibold">
              {t("crisis.breathingExercise")}
            </Text>
            <Text className="text-text-muted">4-4-4 breathing technique</Text>
          </View>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={startTimer}
        className="bg-background-card rounded-2xl p-6"
      >
        <View className="flex-row items-center">
          <Text className="text-4xl mr-4">⏱️</Text>
          <View className="flex-1">
            <Text className="text-white text-xl font-semibold">
              {t("crisis.cravingTimer")}
            </Text>
            <Text className="text-text-muted">3 minute countdown</Text>
          </View>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setMode("reasons")}
        className="bg-background-card rounded-2xl p-6"
      >
        <View className="flex-row items-center">
          <Text className="text-4xl mr-4">💭</Text>
          <View className="flex-1">
            <Text className="text-white text-xl font-semibold">
              {t("crisis.myReasons")}
            </Text>
            <Text className="text-text-muted">Remember why you started</Text>
          </View>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleSlip}
        className="bg-accent-warning/10 border border-accent-warning/30 rounded-2xl p-4 mt-8"
      >
        <Text className="text-accent-warning text-center text-lg">
          {t("crisis.iSlipped")}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderBreathing = () => (
    <View className="flex-1 items-center justify-center">
      <Animated.View
        style={breathAnimStyle}
        className="w-48 h-48 rounded-full bg-primary/30 items-center justify-center"
      >
        <View className="w-32 h-32 rounded-full bg-primary/50 items-center justify-center">
          <View className="w-20 h-20 rounded-full bg-primary items-center justify-center">
            <Text className="text-white text-lg font-semibold">
              {breathPhase === "in" && t("crisis.breatheIn")}
              {breathPhase === "hold" && t("crisis.hold")}
              {breathPhase === "out" && t("crisis.breatheOut")}
            </Text>
          </View>
        </View>
      </Animated.View>

      <TouchableOpacity
        onPress={() => setMode("menu")}
        className="mt-12 bg-background-light px-8 py-3 rounded-full"
      >
        <Text className="text-white text-lg">{t("common.back")}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderTimer = () => (
    <View className="flex-1 items-center justify-center">
      <Text className="text-text-muted text-lg mb-4">
        {timer > 0
          ? t("crisis.timerRunning", { time: formatTimer(timer) })
          : t("crisis.timerComplete")}
      </Text>

      <View className="w-64 h-64 rounded-full border-8 border-primary items-center justify-center">
        <Text className="text-white text-6xl font-bold">
          {formatTimer(timer)}
        </Text>
      </View>

      {timer === 0 && (
        <Text className="text-6xl mt-8">🎉</Text>
      )}

      <TouchableOpacity
        onPress={() => {
          setIsTimerRunning(false);
          setMode("menu");
        }}
        className="mt-12 bg-background-light px-8 py-3 rounded-full"
      >
        <Text className="text-white text-lg">{t("common.back")}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderReasons = () => (
    <View className="flex-1">
      <View className="bg-primary/10 border border-primary/30 rounded-2xl p-6 mb-6">
        <Text className="text-primary text-lg font-semibold mb-2">
          Din motivation:
        </Text>
        <Text className="text-white text-xl italic">
          "{profile?.motivation || "Du har ikke skrevet en motivation endnu"}"
        </Text>
      </View>

      <View className="bg-background-card rounded-2xl p-6">
        <Text className="text-text-muted mb-4">Andre gode grunde:</Text>
        <View className="space-y-3">
          {[
            "🫁 Din krop heler sig selv lige nu",
            "💰 Du sparer penge hver dag",
            "🐱 Nico har brug for dig",
            "💪 Du er stærkere end cravingen",
            "⏰ Om 3 minutter er det overstået",
          ].map((reason, index) => (
            <View key={index} className="flex-row items-center">
              <Text className="text-white text-base">{reason}</Text>
            </View>
          ))}
        </View>
      </View>

      <TouchableOpacity
        onPress={() => setMode("menu")}
        className="mt-8 bg-background-light px-8 py-3 rounded-full self-center"
      >
        <Text className="text-white text-lg">{t("common.back")}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-1 px-6 pt-4">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-text-muted text-3xl">✕</Text>
          </TouchableOpacity>
          {mode === "menu" && (
            <View className="items-center flex-1">
              <Text className="text-white text-2xl font-bold">
                {t("crisis.title")}
              </Text>
              <Text className="text-text-muted">{t("crisis.subtitle")}</Text>
            </View>
          )}
          <View className="w-8" />
        </View>

        {/* Content */}
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: 40,
          }}
        >
          {mode === "menu" && renderMenu()}
          {mode === "breathing" && renderBreathing()}
          {mode === "timer" && renderTimer()}
          {mode === "reasons" && renderReasons()}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
