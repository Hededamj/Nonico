import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useAuthStore, useCheckinStore, usePetStore } from "../lib/stores";

interface CheckinModalProps {
  visible: boolean;
  onClose: () => void;
}

const MOODS = [
  { value: 1, emoji: "😢", label: "Terrible" },
  { value: 2, emoji: "😕", label: "Bad" },
  { value: 3, emoji: "😐", label: "Okay" },
  { value: 4, emoji: "🙂", label: "Good" },
  { value: 5, emoji: "😄", label: "Great" },
];

export default function CheckinModal({ visible, onClose }: CheckinModalProps) {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const createCheckin = useCheckinStore((state) => state.createCheckin);
  const addToInventory = usePetStore((state) => state.addToInventory);

  const [mood, setMood] = useState(3);
  const [cravings, setCravings] = useState(5);
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      await createCheckin(user.id, mood, cravings, notes);

      // Reward: Give food to pet for checking in
      const foods = ["apple", "carrot", "salad"];
      const randomFood = foods[Math.floor(Math.random() * foods.length)];
      await addToInventory(user.id, "food", randomFood, 1);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        onClose();
        resetForm();
      }, 2000);
    } catch (error) {
      console.error("Error creating checkin:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setMood(3);
    setCravings(5);
    setNotes("");
  };

  if (showSuccess) {
    return (
      <Modal visible={visible} animationType="fade" transparent>
        <View className="flex-1 bg-black/70 justify-center items-center">
          <View className="bg-background-card rounded-3xl p-8 mx-6 items-center">
            <Text className="text-6xl mb-4">🎉</Text>
            <Text className="text-white text-2xl font-bold text-center">
              Check-in complete!
            </Text>
            <Text className="text-accent text-lg mt-2">+1 🍎 for Nico!</Text>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 bg-black/70 justify-end">
          <View className="bg-background-card rounded-t-3xl p-6">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-white text-2xl font-bold">
                {t("home.dailyCheckin")}
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Text className="text-text-muted text-3xl">✕</Text>
              </TouchableOpacity>
            </View>

            {/* Mood */}
            <View className="mb-6">
              <Text className="text-text-secondary mb-3">
                How are you feeling today?
              </Text>
              <View className="flex-row justify-between">
                {MOODS.map((m) => (
                  <TouchableOpacity
                    key={m.value}
                    onPress={() => {
                      setMood(m.value);
                      Haptics.selectionAsync();
                    }}
                    className={`items-center p-3 rounded-xl ${
                      mood === m.value ? "bg-primary/20" : ""
                    }`}
                  >
                    <Text className="text-3xl">{m.emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Cravings */}
            <View className="mb-6">
              <Text className="text-text-secondary mb-3">
                Cravings level (0-10)
              </Text>
              <View className="flex-row justify-between">
                {[0, 2, 4, 6, 8, 10].map((level) => (
                  <TouchableOpacity
                    key={level}
                    onPress={() => {
                      setCravings(level);
                      Haptics.selectionAsync();
                    }}
                    className={`items-center px-4 py-2 rounded-xl ${
                      cravings === level
                        ? level > 6
                          ? "bg-accent-warning/20"
                          : "bg-accent/20"
                        : "bg-background"
                    }`}
                  >
                    <Text
                      className={`text-lg font-semibold ${
                        cravings === level
                          ? level > 6
                            ? "text-accent-warning"
                            : "text-accent"
                          : "text-text-muted"
                      }`}
                    >
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Notes */}
            <View className="mb-6">
              <Text className="text-text-secondary mb-3">
                Notes (optional)
              </Text>
              <TextInput
                className="bg-background rounded-xl px-4 py-3 text-white min-h-[80px]"
                placeholder="How was your day?"
                placeholderTextColor="#64748B"
                value={notes}
                onChangeText={setNotes}
                multiline
                textAlignVertical="top"
              />
            </View>

            {/* Submit */}
            <TouchableOpacity onPress={handleSubmit} disabled={isLoading}>
              <LinearGradient
                colors={["#14B8A6", "#06B6D4"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="rounded-2xl py-4"
              >
                <Text className="text-white text-center text-lg font-semibold">
                  {isLoading ? t("common.loading") : "Complete Check-in"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
