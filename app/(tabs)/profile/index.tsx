// app/(tabs)/profile.tsx
import React from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Image,
  Pressable,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Text } from '@/components/ui';

export default function ProfileScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  // mock user
  const user = {
    fullName: 'John Appleseed',
    email: 'john.appleseed@example.com',
    avatar:
      'https://prium.github.io/falcon/v3.24.0/assets/img/team/4.jpg', // un template avatar
  };

  const onLogout = () => {
    // TODO: logout logic
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>
        {/* Header cu avatar și nume */}
        <View style={styles.header}>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          <Text variant="title" color="onBackground" style={styles.name}>
            {user.fullName}
          </Text>
          <Text variant="body" color="onSurfaceVariant">
            {user.email}
          </Text>
        </View>

        {/* Info card */}
        <View style={styles.card}>
          <Text
            variant="headline"
            color="onSurface"
            style={styles.sectionTitle}
          >
            Account info
          </Text>

          <View style={styles.infoRow}>
            <Text variant="body" color="onSurfaceVariant">
              Member since
            </Text>
            <Text variant="body" color="onSurface">
              Jan 2023
            </Text>
          </View>

       
        </View>

        {/* Logout button */}
        <Pressable
          onPress={onLogout}
          style={({ pressed }) => [
            styles.logoutBtn,
            pressed && styles.logoutBtnPressed,
          ]}
        >
          <Text variant="button" color="primary" style={styles.logoutText}>
            Log out
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => {
  const radius = theme?.radius?.xl ?? 16;
  const spacing = theme?.spacing ?? {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  };
  const colors = theme?.colors ?? {
    background: '#F7F8FA',
    surface: '#FFFFFF',
    onBackground: '#111111',
    onSurface: '#111111',
    onSurfaceVariant: '#6B7280',
    primary: '#0A84FF',
    outline: '#E5E7EB',
  };

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    wrapper: {
      flex: 1,
      padding: spacing.lg,
    },
    header: {
      alignItems: 'center',
      marginBottom: spacing.xl,
    },
    avatar: {
      width: 96,
      height: 96,
      borderRadius: 48,
      marginBottom: spacing.md,
    },
    name: {
      marginBottom: spacing.xs,
    },

    card: {
      borderRadius: radius,
      padding: spacing.lg,
      marginBottom: spacing.xl,
    },
    sectionTitle: {
      marginBottom: spacing.md,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: spacing.sm,
    },

    logoutBtn: {
      borderWidth: 1,
      borderColor: colors.outline,
      borderRadius: radius,
      paddingVertical: spacing.md,
      alignItems: 'center',
    },
    logoutBtnPressed: { opacity: 0.9 },
    logoutText: {
      textAlign: 'center',
    },
  });
};
