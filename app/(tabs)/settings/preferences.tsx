import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Text, Card, Spacer } from '@/components/ui';

export default function PreferencesScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Text variant="headline" color="onSurface" style={styles.title}>
            Preferences Settings
          </Text>
          <Spacer size="md" />
          <Text variant="body" color="onSurfaceVariant">
            App behavior and preference options will be available here.
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
  },
  card: {
    padding: theme.spacing.lg,
  },
  title: {
    textAlign: 'center',
  },
});