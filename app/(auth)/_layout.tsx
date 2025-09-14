import React from "react";
import { Pressable, Platform, StyleSheet } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Icon } from "@/components/ui";


function BackButton({ fallback = "/" }: { fallback?: string }) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof router.canGoBack === "function" && router.canGoBack()) {
      router.back();
    } else {
      router.replace(fallback);
    }
  };

  return (
    <Pressable
      onPress={handleBack}
      hitSlop={styles.hitSlop}
      style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
      android_ripple={
        Platform.OS === "android" ? { borderless: true } : undefined
      }
    >
      <Icon name="chevron-back-outline" color="primary" accessibilityLabel="Go back" />
    </Pressable>
  );
}

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={({ route }) => ({
        headerShown: true,
        headerBackTitleVisible: false,
        headerLeft: () => {
          if (route.name === "login") return null; // 👉 ascunde back pe login
          return <BackButton fallback="/" />;
        },
      })}
    >
      <Stack.Screen name="login" options={{ title: "Login" }} />
      <Stack.Screen name="register" options={{ title: "Create account" }} />
      <Stack.Screen name="forgot-password" options={{ title: "Reset password" }} />
      <Stack.Screen name="change-password" options={{ title: "Change password" }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    paddingHorizontal: 8,
    paddingVertical: Platform.select({ ios: 6, android: 4, default: 6 }),
    marginLeft: Platform.select({ ios: -6, android: 0, default: 0 }),
    borderRadius: 8,
  },
  backBtnPressed: {
    opacity: 0.7,
  },
  hitSlop: { top: 8, bottom: 8, left: 8, right: 8 } as any,
});
