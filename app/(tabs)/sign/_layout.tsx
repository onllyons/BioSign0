import { Stack } from "expo-router";

export default function SignStack() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Sign", headerShown: false }} />
      <Stack.Screen name="[id]" options={{ title: "Document Details" }} />
      <Stack.Screen name="create" options={{ title: "Documents", presentation: "modal" }} />
      <Stack.Screen name="view_all" options={{ title: "All Signatures" }} />
      <Stack.Screen name="settings_sign" options={{ title: "Sign Settings" }} />
    </Stack>
  );
}
