import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  Image,
  Button,
  Pressable,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { Text } from "@/components/ui";
import { getUser, isAuthenticated, logout } from "@/utils/Auth";
import { useRouter } from "expo-router";
import { useData } from "@/contexts/DataContext";
import Loader from "@/components/modals/Loader";
import { SERVER_AJAX_URL, useRequests } from "@/hooks/useRequests";

export default function ProfileScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const router = useRouter();
  const { restartApp } = useData();
  const currentUser = getUser();
  const isAuth = isAuthenticated();
  const [loader, setLoader] = useState(false);
  const { sendDefaultRequest } = useRequests();
  const [refreshing, setRefreshing] = useState(false);
  const [version, setVersion] = useState(0);

  const handleGoToLogin = () => router.push("/login");
  const handleGoToChangePassword = () => router.push("/change-password");
  const handleLogout = async () => {
    await logout();
    restartApp();
  };

  const handleConfirmEmail = async () => {
    setLoader(true);
    try {
      await sendDefaultRequest({
        url: `${SERVER_AJAX_URL}/user/send_confirm_email_v2.php`,
      });
    } finally {
      setLoader(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      setVersion((v) => v + 1);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // 👉 Fake Delete Profile
  const handleDeleteProfile = () => {
    Alert.alert(
      "Delete Profile",
      "Are you sure you want to delete your profile?",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: () =>
            Alert.alert(
              "Profile Scheduled for Deletion",
              "Your profile will be deleted within 24 hours and all your data will be removed."
            ),
        },
      ]
    );
  };

  const displayName = isAuth
    ? currentUser?.name || currentUser?.email?.split("@")?.[0] || "User"
    : "Guest";

  const displayEmail = isAuth ? currentUser?.email || "—" : "";

  const avatarUri =
    "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_1280.png";

  const showConfirmEmailButton =
    !!isAuth &&
    !!currentUser &&
    !currentUser.emailVerified &&
    !currentUser.byGoogle &&
    !currentUser.byApple;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.wrapper}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Loader visible={loader} />

        <View style={styles.header}>
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
          <Text variant="title" color="onBackground" style={styles.name}>
            {displayName}
          </Text>
          <Text variant="body" color="onSurfaceVariant">
            {displayEmail}
          </Text>
        </View>

        {isAuth && currentUser && (
          <View style={styles.card}>
            <InfoRow label="ID" value={String(currentUser.id)} />
            <InfoRow label="Name" value={currentUser.name || "—"} />
            <InfoRow label="Email" value={currentUser.email || "—"} />
          </View>
        )}

        {showConfirmEmailButton && (
          <Button title="Confirm email" onPress={handleConfirmEmail} />
        )}

        {isAuth ? (
          <>
            <Pressable
              onPress={handleGoToChangePassword}
              style={({ pressed }) => [
                styles.logoutBtn,
                pressed && styles.logoutBtnPressed,
              ]}
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
              testID="profile-logout-button"
            >
              <Text variant="button" color="primary" style={styles.logoutText}>
                Log out
              </Text>
            </Pressable>

            {/* 👇 Fake Delete Profile Button */}
            <Pressable
              onPress={handleDeleteProfile}
              style={({ pressed }) => [
                styles.logoutBtn,
                pressed && styles.logoutBtnPressed,
              ]}
            >
              <Text variant="button" color="error" style={styles.logoutText}>
                Delete Profile
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
            testID="profile-login-button"
          >
            <Text variant="button" color="primary" style={styles.logoutText}>
              Go to Login
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={infoStyles.row}>
    <Text variant="body" color="onSurfaceVariant" style={infoStyles.label}>
      {label}
    </Text>

    <View style={infoStyles.valueWrap}>
      <Text
        variant="body"
        color="onBackground"
        style={infoStyles.value}
        numberOfLines={1}
        ellipsizeMode="middle"
        selectable
      >
        {value}
      </Text>
    </View>
  </View>
);

const infoStyles = StyleSheet.create({
  row: {
    paddingVertical: 8,
    flexDirection: "row",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
    gap: 12,
  },
  label: {
    width: 80,
  },
  valueWrap: {
    flex: 1,
    minWidth: 0,
  },
  value: {
    fontWeight: "600",
    flexShrink: 1,
    textAlign: 'right'
  },
});

const createStyles = (theme: any) => {
  const radius = theme?.radius?.xl ?? 16;
  const spacing = theme?.spacing ?? {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  };
  const colors = theme?.colors ?? {
    background: "#F7F8FA",
    surface: "#FFFFFF",
    onBackground: "#111111",
    onSurface: "#111111",
    onSurfaceVariant: "#6B7280",
    primary: "#0A84FF",
    outline: "#E5E7EB",
  };

  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    wrapper: { flex: 1, padding: spacing.lg },
    header: { alignItems: "center", marginBottom: spacing.xl },
    avatar: {
      width: 96,
      height: 96,
      borderRadius: 48,
      marginBottom: spacing.md,
    },
    name: { marginBottom: spacing.xs },
    card: {
      backgroundColor: colors.surface,
      borderRadius: radius,
      borderWidth: 1,
      borderColor: colors.outline,
      padding: spacing.lg,
      marginBottom: spacing.lg,
    },
    logoutBtn: {
      borderWidth: 1,
      borderColor: colors.outline,
      borderRadius: radius,
      paddingVertical: spacing.md,
      alignItems: "center",
      marginTop: spacing.md,
    },
    logoutBtnPressed: { opacity: 0.9 },
    logoutText: { textAlign: "center" },
  });
};
