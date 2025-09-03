// app/(auth)/_layout.tsx (sau AuthLayout.tsx)
import React from "react";
import { Pressable, Platform, StyleSheet } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Text } from "@/components/ui"; // folosește propriul tău Text; sau înlocuiește cu react-native Text

/**
 * Mic component care afișează butonul Back în header.
 * - Dacă există istoric: router.back()
 * - Dacă NU există istoric: router.replace(fallback)
 */
function BackButton({ fallback = "/" }: { fallback?: string }) {
  const router = useRouter();

  const handleBack = () => {
    // @ts-ignore - în expo-router există canGoBack()
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
      {/* Poți schimba cu o iconiță din expo/vector-icons, ex: Ionicons name="chevron-back" */}
      <Text variant="body" color="primary" style={styles.backLabel}>
        ← Back
      </Text>
    </Pressable>
  );
}

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false, // ascunde textul implicit iOS
        headerLeft: () => <BackButton fallback="/" />, // ← buton back OBLIGATORIU pe toate ecranele
      }}
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
  backLabel: {
    fontSize: 16,
  },
  hitSlop: { top: 8, bottom: 8, left: 8, right: 8 } as any,
});
