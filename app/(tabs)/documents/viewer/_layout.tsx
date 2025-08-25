import { Stack } from 'expo-router';

export default function ViewerStack() {
  return (
    <Stack>
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
    </Stack>
  );
}