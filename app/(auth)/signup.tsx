import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Link, router } from "expo-router";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import { useAuthStore } from "../../lib/stores";

export default function SignupScreen() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const signUp = useAuthStore((state) => state.signUp);

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert(t("common.error"), "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t("common.error"), "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert(t("common.error"), "Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    const { error } = await signUp(email, password);
    setIsLoading(false);

    if (error) {
      Alert.alert(t("common.error"), t("auth.signupError"));
    } else {
      router.replace("/(auth)/onboarding");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background"
    >
      <View className="flex-1 justify-center px-6">
        <View className="items-center mb-12">
          <Text className="text-5xl font-bold text-white mb-2">NicoNo</Text>
          <Text className="text-text-muted text-lg">
            {t("onboarding.welcomeSubtitle")}
          </Text>
        </View>

        <View className="space-y-4">
          <View>
            <Text className="text-text-secondary mb-2 text-base">
              {t("auth.email")}
            </Text>
            <TextInput
              className="bg-background-light rounded-2xl px-4 py-4 text-white text-base"
              placeholder="email@example.com"
              placeholderTextColor="#64748B"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View className="mt-4">
            <Text className="text-text-secondary mb-2 text-base">
              {t("auth.password")}
            </Text>
            <TextInput
              className="bg-background-light rounded-2xl px-4 py-4 text-white text-base"
              placeholder="••••••••"
              placeholderTextColor="#64748B"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View className="mt-4">
            <Text className="text-text-secondary mb-2 text-base">
              {t("auth.confirmPassword")}
            </Text>
            <TextInput
              className="bg-background-light rounded-2xl px-4 py-4 text-white text-base"
              placeholder="••••••••"
              placeholderTextColor="#64748B"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            onPress={handleSignup}
            disabled={isLoading}
            className="mt-8"
          >
            <LinearGradient
              colors={["#14B8A6", "#06B6D4"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="rounded-2xl py-4"
            >
              <Text className="text-white text-center text-lg font-semibold">
                {isLoading ? t("common.loading") : t("auth.signup")}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center mt-12">
          <Text className="text-text-muted">{t("auth.hasAccount")} </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text className="text-primary font-semibold">
                {t("auth.login")}
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
