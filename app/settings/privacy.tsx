import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Text, Card, Spacer } from '@/components/ui';

const PrivacySettingsScreen: React.FC = () => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Text variant="headline" color="onSurface" style={styles.title}>
            Privacy & Security Settings
          </Text>
          <Spacer size="md" />
          <Text variant="body" color="onSurfaceVariant">
            TODO: Privacy and security options will be available here.
            This includes permissions, password management, two-factor authentication, and data privacy controls.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

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

export default PrivacySettingsScreen;