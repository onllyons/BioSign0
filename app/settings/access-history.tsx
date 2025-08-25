import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Text, Card, Spacer } from '@/components/ui';

const AccessHistoryScreen: React.FC = () => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  // Mock data for demonstration
  const activeDevices = [
    { id: '1', name: 'iPhone 15 Pro', lastActive: '2024-01-20T10:30:00Z', current: true },
    { id: '2', name: 'MacBook Pro', lastActive: '2024-01-19T16:45:00Z', current: false },
    { id: '3', name: 'iPad Air', lastActive: '2024-01-18T09:15:00Z', current: false },
  ];

  const loginHistory = [
    { id: '1', device: 'iPhone 15 Pro', location: 'San Francisco, CA', timestamp: '2024-01-20T10:30:00Z' },
    { id: '2', device: 'MacBook Pro', location: 'San Francisco, CA', timestamp: '2024-01-19T16:45:00Z' },
    { id: '3', device: 'iPad Air', location: 'San Francisco, CA', timestamp: '2024-01-18T09:15:00Z' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Text variant="headline" color="onSurface" style={styles.sectionTitle}>
            Active Devices
          </Text>
          <Spacer size="md" />
          <Text variant="body" color="onSurfaceVariant" style={styles.sectionDescription}>
            Devices currently signed in to your account:
          </Text>
          <Spacer size="md" />
          
          {activeDevices.map((device, index) => (
            <View key={device.id} style={styles.deviceItem}>
              <View style={styles.deviceInfo}>
                <Text variant="body" color="onSurface" style={styles.deviceName}>
                  {device.name}
                  {device.current && (
                    <Text variant="caption" color="success"> (This device)</Text>
                  )}
                </Text>
                <Text variant="caption" color="onSurfaceVariant">
                  Last active: {new Date(device.lastActive).toLocaleDateString()}
                </Text>
              </View>
            </View>
          ))}
        </Card>

        <Spacer size="lg" />

        <Card style={styles.card}>
          <Text variant="headline" color="onSurface" style={styles.sectionTitle}>
            Login History
          </Text>
          <Spacer size="md" />
          <Text variant="body" color="onSurfaceVariant" style={styles.sectionDescription}>
            Recent sign-in activity:
          </Text>
          <Spacer size="md" />
          
          {loginHistory.map((login, index) => (
            <View key={login.id} style={styles.loginItem}>
              <View style={styles.loginInfo}>
                <Text variant="body" color="onSurface" style={styles.loginDevice}>
                  {login.device}
                </Text>
                <Text variant="caption" color="onSurfaceVariant">
                  {login.location} • {new Date(login.timestamp).toLocaleString()}
                </Text>
              </View>
            </View>
          ))}
        </Card>

        <Spacer size="lg" />
        
        <Text variant="caption" color="onSurfaceVariant" style={styles.disclaimer}>
          TODO: This is placeholder data. In a real app, this would show actual device and login information from your account.
        </Text>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  sectionDescription: {
    fontSize: 15,
    lineHeight: 22,
  },
  deviceItem: {
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.outline,
    opacity: 0.3,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: theme.spacing.xs,
  },
  loginItem: {
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.outline,
    opacity: 0.3,
  },
  loginInfo: {
    flex: 1,
  },
  loginDevice: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: theme.spacing.xs,
  },
  disclaimer: {
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 18,
  },
});

export default AccessHistoryScreen;