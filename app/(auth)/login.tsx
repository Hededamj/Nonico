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

export default function LoginScreen() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const signIn = useAuthStore((state) => state.signIn);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t("common.error"), "Please fill in all fields");
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);

    if (error) {
      Alert.alert(t("common.error"), t("auth.loginError"));
    } else {
      router.replace("/");
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

          <TouchableOpacity
            onPress={handleLogin}
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
                {isLoading ? t("common.loading") : t("auth.login")}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity className="mt-4">
            <Text className="text-primary text-center">
              {t("auth.forgotPassword")}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center mt-12">
          <Text className="text-text-muted">{t("auth.noAccount")} </Text>
          <Link href="/(auth)/signup" asChild>
            <TouchableOpacity>
              <Text className="text-primary font-semibold">
                {t("auth.signup")}
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
