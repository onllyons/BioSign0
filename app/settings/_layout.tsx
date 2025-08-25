import { Stack } from 'expo-router';

export default function SettingsStack() {
  return (
    <Stack>
      <Stack.Screen 
        name="more" 
        options={{ 
          title: 'More Settings',
        }} 
      />
      <Stack.Screen name="profile" options={{ title: 'Profile' }} />
      <Stack.Screen name="privacy" options={{ title: 'Privacy & Security' }} />
      <Stack.Screen name="access-history" options={{ title: 'Access History' }} />
      <Stack.Screen 
        name="feedback" 
        options={{ 
          title: 'Feedback & Suggestions',
        }} 
      />
      <Stack.Screen 
        name="faq" 
        options={{ 
          title: 'FAQ',
        }} 
      />
      <Stack.Screen 
        name="report-bug" 
        options={{ 
          title: 'Report a Bug',
        }} 
      />
    </Stack>
  );
}