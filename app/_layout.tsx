import React, { useEffect, useState } from "react";
import { Stack, useSegments, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { useFrameworkReady } from "@/hooks/useFrameworkReady";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { DataProvider } from "@/contexts/DataContext";

import Toast, { BaseToast, BaseToastProps, ErrorToast } from "react-native-toast-message";
import { initAuthFromStorage, isAuthenticated } from "@/utils/Auth";
import { Analytics } from "@/components/analytics/Analytics";
import AppGate from "../AppGate";

/** ------- Toast config ------- */
const toastConfig = {
  success: (props: BaseToastProps) => (
    <BaseToast
      {...props}
      text1NumberOfLines={3}
      style={{ borderLeftColor: "#57cc04", width: "90%", marginTop: 10 }}
      text1Style={{ fontSize: 12, color: "#494949" }}
    />
  ),
  error: (props: BaseToastProps) => (
    <ErrorToast
      {...props}
      text1NumberOfLines={3}
      style={{ borderLeftColor: "#ca3431", width: "90%", marginTop: 10, flexWrap: "wrap" }}
      text1Style={{ fontSize: 12, color: "#494949" }}
    />
  ),
  info: (props: BaseToastProps) => (
    <ErrorToast
      {...props}
      text1NumberOfLines={3}
      style={{ borderLeftColor: "#1cb0f6", width: "90%", marginTop: 10 }}
      text1Style={{ fontSize: 12, color: "#494949" }}
    />
  ),
};

/**
 * Efectul de guard care:
 * - așteaptă hidratarea auth din storage
 * - redirecționează în funcție de auth + segmentul curent
 */
function GuardEffect() {
  const segments = useSegments();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      await initAuthFromStorage(); // hidratează user + tokens
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;

    const authed = isAuthenticated();
    const inAuthGroup = segments[0] === "(auth)";

    if (!authed && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (authed && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [segments, ready, router]);

  // nu randăm nimic – doar efecte de navigație
  return null;
}

export default function RootLayout() {
  useFrameworkReady();

  return (
    <ThemeProvider>
      <DataProvider>
        {/* Rulează redirect-urile de auth */}
        <GuardEffect />

        {/* Biometric gate – NU blochează (auth) când nu ești logat */}
        <AppGate>
          <Stack screenOptions={{ headerShown: false }}>
            {/* conținutul aplicației */}
            <Stack.Screen name="(tabs)" options={{ headerShown: false, title: "Tabs" }} />

            {/* grupul de autentificare – lăsat mereu în navigator */}
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />

            {/* restul ecranelor */}
            <Stack.Screen name="mail-verify" options={{ headerShown: true, title: "Verify email" }} />
            <Stack.Screen name="reset-password" options={{ headerShown: true, title: "Reset password" }} />
            <Stack.Screen name="sign/[id]" options={{ headerShown: true, title: "Sign" }} />
            <Stack.Screen name="+not-found" />
          </Stack>
        </AppGate>

        <StatusBar style="auto" />
        <Toast position="top" config={toastConfig} onPress={() => Toast.hide()} />
        <Analytics />
      </DataProvider>
    </ThemeProvider>
  );
}
