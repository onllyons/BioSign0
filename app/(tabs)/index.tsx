import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Text, Card, Button, Spacer, PressableButton } from '@/components/ui';
import { useRouter } from 'expo-router';
import { useData } from '@/contexts/DataContext';

export default function HomeScreen() {
  const { theme } = useTheme();
  const { documents } = useData();
  const router = useRouter();
  const styles = createStyles(theme);
 
  // Calculate statistics
  const totalDocuments = documents.length;
  const signedDocuments = documents.filter(doc => doc.signed).length;
  const pendingDocuments = totalDocuments - signedDocuments;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="title" color="onBackground" style={styles.title}>
          BioSign
        </Text>
        <Text variant="body" color="onSurfaceVariant" style={styles.subtitle}>
          Welcome to your biometric signature app
        </Text>
      </View>
      <View style={styles.content}>
        <Card style={styles.quickActions}>
          <Text variant="headline" color="onSurface" style={styles.sectionTitle}>
            Quick Actions
          </Text>
          <Spacer size="md" />
          <PressableButton
            title="Create New Document"
            onPress={() => router.push('/documents/create')}
            variant="primary"
            style={styles.actionButton}
            accessibilityLabel="Create new document"
            testID="quick-action-create-document"
          />
          <Spacer size="sm" />
          <PressableButton
            title="View Recent Documents"
            onPress={() => router.push('/documents')}
            variant="outline"
            style={styles.actionButton}
            accessibilityLabel="View recent documents"
            testID="quick-action-view-documents"
          />
        </Card>
        <Spacer size="lg" />
        <Card style={styles.statsCard}>
          <Text variant="headline" color="onSurface" style={styles.sectionTitle}>
            Overview
          </Text>
          <Spacer size="md" />
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text variant="title" color="primary">{totalDocuments}</Text>
              <Text variant="caption" color="onSurfaceVariant">Documents</Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="title" color="success">{signedDocuments}</Text>
              <Text variant="caption" color="onSurfaceVariant">Signed</Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="title" color="secondary">{pendingDocuments}</Text>
              <Text variant="caption" color="onSurfaceVariant">Pending</Text>
            </View>
          </View>
        </Card>
      </View>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingTop: theme.spacing.xxl + theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  title: {
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    textAlign: 'left',
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  quickActions: {
    padding: theme.spacing.xl,
  },
  sectionTitle: {
    marginBottom: theme.spacing.lg,
  },
  actionButton: {
    width: '100%',
  },
  statsCard: {
    padding: theme.spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
});