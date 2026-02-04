import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from "react-native";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

// Mock data for now - would come from Supabase
const MOCK_POSTS = [
  {
    id: "1",
    anonymous_name: "Kriger #4521",
    content: "Dag 7 uden snus! Det er hårdt, men Nico holder mig motiveret 🐱",
    type: "victory",
    reactions: { "💪": 12, "🎉": 8, "❤️": 5 },
    created_at: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    anonymous_name: "Kriger #2847",
    content:
      "Har lige haft den værste craving... Men jeg klarede det! 3-5 minutter føles som en evighed 😅",
    type: "struggle",
    reactions: { "💪": 24, "❤️": 15 },
    created_at: "2024-01-15T09:15:00Z",
  },
  {
    id: "3",
    anonymous_name: "Kriger #1923",
    content: "1 MÅNED! 🎉🎉🎉 Troede aldrig jeg ville klare det!",
    type: "milestone",
    reactions: { "💪": 45, "🎉": 67, "❤️": 32 },
    created_at: "2024-01-14T18:00:00Z",
  },
];

const POST_TYPES = [
  { id: "struggle", emoji: "😤", label: "Kæmper" },
  { id: "victory", emoji: "🎉", label: "Sejr" },
  { id: "milestone", emoji: "🏆", label: "Milepæl" },
];

const REACTIONS = ["💪", "🎉", "❤️"];

export default function CommunityScreen() {
  const { t } = useTranslation();
  const [showNewPost, setShowNewPost] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [postType, setPostType] = useState<string>("victory");

  const handleReaction = (postId: string, emoji: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Would update in Supabase
  };

  const handleSubmitPost = () => {
    if (!postContent.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Would create post in Supabase
    setPostContent("");
    setShowNewPost(false);
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffHours < 1) return "Lige nu";
    if (diffHours < 24) return `${diffHours}t siden`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d siden`;
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="flex-row justify-between items-center mt-4 mb-6">
          <Text className="text-white text-3xl font-bold">
            {t("community.title")}
          </Text>
          <TouchableOpacity
            onPress={() => setShowNewPost(true)}
            className="bg-primary rounded-full w-12 h-12 items-center justify-center"
          >
            <Text className="text-white text-2xl">+</Text>
          </TouchableOpacity>
        </View>

        {/* Posts */}
        <View className="space-y-4">
          {MOCK_POSTS.map((post) => (
            <View key={post.id} className="bg-background-card rounded-2xl p-4">
              {/* Header */}
              <View className="flex-row justify-between items-center mb-3">
                <View className="flex-row items-center">
                  <View className="bg-primary/20 rounded-full px-3 py-1">
                    <Text className="text-primary text-sm font-semibold">
                      {post.anonymous_name}
                    </Text>
                  </View>
                  <Text className="text-text-muted text-sm ml-2">
                    {getTimeAgo(post.created_at)}
                  </Text>
                </View>
                <Text className="text-2xl">
                  {POST_TYPES.find((t) => t.id === post.type)?.emoji}
                </Text>
              </View>

              {/* Content */}
              <Text className="text-white text-base mb-4">{post.content}</Text>

              {/* Reactions */}
              <View className="flex-row space-x-2">
                {REACTIONS.map((emoji) => {
                  const count = (post.reactions as any)[emoji] || 0;
                  return (
                    <TouchableOpacity
                      key={emoji}
                      onPress={() => handleReaction(post.id, emoji)}
                      className={`flex-row items-center px-3 py-2 rounded-full ${
                        count > 0 ? "bg-background-light" : "bg-background"
                      }`}
                    >
                      <Text className="text-lg mr-1">{emoji}</Text>
                      {count > 0 && (
                        <Text className="text-text-secondary text-sm">
                          {count}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* New Post Modal */}
      <Modal visible={showNewPost} animationType="slide" transparent>
        <View className="flex-1 bg-black/70 justify-end">
          <View className="bg-background-card rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-white text-2xl font-bold">
                {t("community.newPost")}
              </Text>
              <TouchableOpacity onPress={() => setShowNewPost(false)}>
                <Text className="text-text-muted text-3xl">✕</Text>
              </TouchableOpacity>
            </View>

            {/* Post Type */}
            <View className="flex-row space-x-2 mb-4">
              {POST_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  onPress={() => setPostType(type.id)}
                  className={`flex-1 py-3 rounded-xl items-center ${
                    postType === type.id
                      ? "bg-primary/20 border border-primary"
                      : "bg-background"
                  }`}
                >
                  <Text className="text-2xl mb-1">{type.emoji}</Text>
                  <Text
                    className={`text-sm ${
                      postType === type.id ? "text-primary" : "text-text-muted"
                    }`}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Content */}
            <TextInput
              className="bg-background rounded-xl px-4 py-3 text-white min-h-[120px] mb-4"
              placeholder="Del dine tanker med fællesskabet..."
              placeholderTextColor="#64748B"
              value={postContent}
              onChangeText={setPostContent}
              multiline
              textAlignVertical="top"
            />

            <Text className="text-text-muted text-sm text-center mb-4">
              Dit opslag vil blive vist anonymt
            </Text>

            <TouchableOpacity
              onPress={handleSubmitPost}
              disabled={!postContent.trim()}
            >
              <LinearGradient
                colors={
                  postContent.trim()
                    ? ["#14B8A6", "#06B6D4"]
                    : ["#374151", "#374151"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="rounded-2xl py-4"
              >
                <Text className="text-white text-center text-lg font-semibold">
                  Del opslag
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
