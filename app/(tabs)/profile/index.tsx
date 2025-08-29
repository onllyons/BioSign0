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
import { getUser, isAuthenticated, logout } from '@/utils/Auth';
import { useRouter } from 'expo-router';
import { useData } from '@/contexts/DataContext';

export default function ProfileScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const router = useRouter();
  const { restartApp } = useData();

  const currentUser = getUser();
  const isAuth = isAuthenticated();

  const handleGoToLogin = () => router.push('/login');
  const handleGoToChangePassword = () => router.push('/change-password');

  const handleLogout = async () => {
    await logout();
    restartApp();
  };

  // Fallbacks
  const displayName =
    isAuth
      ? (currentUser?.fullName ||
         (currentUser?.firstName && currentUser?.lastName
           ? `${currentUser.firstName} ${currentUser.lastName}`
           : currentUser?.email?.split('@')?.[0] || 'User'))
      : 'Guest';

  const displayEmail = isAuth ? currentUser?.email || '—' : 'Not logged in';

  const avatarUri =
    currentUser?.avatar ||
    'https://prium.github.io/falcon/v3.24.0/assets/img/team/4.jpg';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>
        {/* Header */}
        <View style={styles.header}>
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
          <Text variant="title" color="onBackground" style={styles.name}>
            {displayName}
          </Text>
          <Text variant="body" color="onSurfaceVariant">
            {displayEmail}
          </Text>
        </View>

        {isAuth ? (
          <>
            <Pressable
              onPress={handleGoToChangePassword}
              style={({ pressed }) => [
                styles.logoutBtn,
                pressed && styles.logoutBtnPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Change Password"
            >
              <Text variant="button" color="primary" style={styles.logoutText}>
                Change Password
              </Text>
            </Pressable>

            <Pressable
              onPress={handleLogout}
              style={({ pressed }) => [
                styles.logoutBtn,
                pressed && styles.logoutBtnPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Logout"
              testID="profile-logout-button"
            >
              <Text variant="button" color="primary" style={styles.logoutText}>
                Log out
              </Text>
            </Pressable>
          </>
        ) : (
          <Pressable
            onPress={handleGoToLogin}
            style={({ pressed }) => [
              styles.logoutBtn,
              pressed && styles.logoutBtnPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Go to Login"
            testID="profile-login-button"
          >
            <Text variant="button" color="primary" style={styles.logoutText}>
              Go to Login
            </Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => {
  const radius = theme?.radius?.xl ?? 16;
  const spacing = theme?.spacing ?? {
    xs: 4,         // ✅ adăugat
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
    container: { flex: 1, backgroundColor: colors.background },
    wrapper: { flex: 1, padding: spacing.lg },
    header: { alignItems: 'center', marginBottom: spacing.xl },
    avatar: { width: 96, height: 96, borderRadius: 48, marginBottom: spacing.md },
    name: { marginBottom: spacing.xs }, // ✅ acum xs există
    logoutBtn: {
      borderWidth: 1,
      borderColor: colors.outline,
      borderRadius: radius,
      paddingVertical: spacing.md,
      alignItems: 'center',
      marginTop: spacing.md,
    },
    logoutBtnPressed: { opacity: 0.9 },
    logoutText: { textAlign: 'center' },
  });
};
