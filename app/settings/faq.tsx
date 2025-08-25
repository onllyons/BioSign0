import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Text, Card, Spacer } from '@/components/ui';

const FAQScreen: React.FC = () => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Text variant="headline" color="onSurface" style={styles.title}>
            FAQ
          </Text>
          <Spacer size="md" />
          <Text variant="body" color="onSurfaceVariant">
            TODO: Frequently asked questions will be available here.
            This includes common questions about document signing, biometric setup, and app usage.
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

export default FAQScreen;