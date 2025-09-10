// SettingsScreen.tsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { Text, Card, Spacer } from "@/components/ui";
import { useHaptics } from "@/hooks/useHaptics";
import { Ionicons } from "@expo/vector-icons";
import { useData } from "@/contexts/DataContext";
import { useRouter } from "expo-router";

import * as LocalAuthentication from "expo-local-authentication";
import { SERVER_AJAX_URL, useRequests } from "@/hooks/useRequests";
import { enableLocalBiometric, disableLocalBiometric } from "@/lib/secure";
import { isAuthenticated } from "@/utils/Auth";
import { suppressNextGatePrompt } from '@/lib/gateControl';

// ---------------- UI pieces you already have ----------------
interface SettingRowProps {
  title: string;
  subtitle?: string;
  leftIcon?: string;
  rightComponent?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  showChevron?: boolean;
}
function SettingRow({
  title,
  subtitle,
  leftIcon,
  rightComponent,
  onPress,
  disabled,
  isFirst,
  isLast,
  showChevron = false,
}: SettingRowProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const Component: any = onPress ? TouchableOpacity : View;
  return (
    <Component
      style={[
        styles.settingRow,
        disabled && styles.disabledRow,
        isFirst && styles.firstRow,
        isLast && styles.lastRow,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole={onPress ? "button" : "text"}
      accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title}
      accessibilityState={disabled ? { disabled: true } : undefined}
      hitSlop={onPress ? { top: 8, bottom: 8, left: 8, right: 8 } : undefined}
    >
      <View style={styles.rowContent}>
        {leftIcon && (
          <View style={styles.iconContainer}>
            <Ionicons
              name={leftIcon as any}
              size={22}
              color={
                disabled ? theme.colors.onSurfaceVariant : theme.colors.primary
              }
            />
          </View>
        )}
        <View style={styles.textContainer}>
          <Text
            variant="body"
            color={disabled ? "onSurfaceVariant" : "onSurface"}
            style={styles.rowTitle}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              variant="caption"
              color="onSurfaceVariant"
              style={styles.rowSubtitle}
            >
              {subtitle}
            </Text>
          )}
        </View>
        <View style={styles.rightContainer}>
          {rightComponent}
          {showChevron && (
            <Ionicons
              name="chevron-forward"
              size={18}
              color={theme.colors.onSurfaceVariant}
              style={styles.chevron}
            />
          )}
        </View>
      </View>
      {!isLast && <View style={styles.separator} />}
    </Component>
  );
}

interface ToggleSwitchProps {
  value: boolean;
  onValueChange?: (value: boolean) => void;
  disabled?: boolean;
  busy?: boolean;
}
function ToggleSwitch({
  value,
  onValueChange,
  disabled,
  busy,
}: ToggleSwitchProps) {
  const { theme } = useTheme();
  const { triggerHaptic } = useHaptics();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <TouchableOpacity
      style={[
        styles.toggle,
        value && styles.toggleActive,
        (disabled || busy) && styles.toggleDisabled,
      ]}
      onPress={() => {
        if (!disabled && !busy && onValueChange) {
          triggerHaptic("light");
          onValueChange(!value);
        }
      }}
      disabled={disabled || busy}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled: disabled || busy }}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
    >
      <View style={[styles.toggleThumb, value && styles.toggleThumbActive]} />
      {busy && (
        <ActivityIndicator
          size="small"
          style={{ position: "absolute", alignSelf: "center" }}
        />
      )}
    </TouchableOpacity>
  );
}

// ---------------- Screen ----------------
type ApiBiometricGet = { success: boolean; isBiometricEnabled: boolean };
type ApiBiometricSet = { success: boolean; isBiometricEnabled: boolean };

export default function SettingsScreen() {
  const { theme, toggleTheme } = useTheme();
  const { uiPreferences, updateUIPreferences } = useData();
  const { triggerHaptic } = useHaptics();
  const router = useRouter();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { sendDefaultRequest } = useRequests();

  const isAuth = isAuthenticated();

  // Biometric state
  const [bioEnabled, setBioEnabled] = useState(false);
  const [bioBusy, setBioBusy] = useState(false);
  const [bioAvailable, setBioAvailable] = useState<boolean | null>(null); // null = checking
  const [bioError, setBioError] = useState<string | null>(null);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchBiometricStatus = useCallback(async (): Promise<boolean> => {
    const data = await sendDefaultRequest<ApiBiometricGet>({
      url: `${SERVER_AJAX_URL}/user/security_get.php`,
      data: {},
      showOptions: { success: false },
    });
    return !!data?.isBiometricEnabled;
  }, [sendDefaultRequest]);

  const saveBiometricStatus = useCallback(
    async (status: boolean): Promise<boolean> => {
      const data = await sendDefaultRequest<ApiBiometricSet>({
        url: `${SERVER_AJAX_URL}/user/security_set.php`,
        data: { isBiometricEnabled: status },
        showOptions: { success: false },
      });
      return !!data?.success;
    },
    [sendDefaultRequest]
  );

  // Load initial states
  useEffect(() => {
    (async () => {
      try {
        // hardware availability
        const compatible = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        setBioAvailable(compatible && enrolled);

        if (!isAuth) return;
        // server flag
        const enabled = await fetchBiometricStatus();
        if (mountedRef.current) setBioEnabled(enabled);
      } catch (e: any) {
        if (mountedRef.current)
          setBioError(e?.message ?? "Failed to load biometric settings");
      }
    })();
  }, [isAuth, fetchBiometricStatus]);

  const handleToggleBiometrics = useCallback(
    async (next: boolean) => {
      try {
        setBioBusy(true);
        setBioError(null);

        // Re-check availability on enable
        if (next) {
          const compatible = await LocalAuthentication.hasHardwareAsync();
          const enrolled = await LocalAuthentication.isEnrolledAsync();
          if (!compatible || !enrolled) {
            setBioAvailable(false);
            Alert.alert(
              "Biometrie indisponibilă",
              "Activează Face ID / amprentă în setările telefonului."
            );
            return;
          }
          const res = await LocalAuthentication.authenticateAsync({
            promptMessage: "Activează autentificarea biometrică",
            fallbackLabel: "Folosește parola",
          });
          if (!res.success) return;
        }

        // 1) server
        const ok = await saveBiometricStatus(next);
        if (!ok) {
          Alert.alert("Eroare", "Nu am putut salva preferința pe server.");
          return;
        }

        // 2) local token
        if (next) {
          await enableLocalBiometric();
          suppressNextGatePrompt(2000);
        } else {
          await disableLocalBiometric();
        }

        setBioEnabled(next);
        triggerHaptic("light");
      } catch (e: any) {
        setBioError(
          e?.message ?? "A apărut o problemă la actualizarea biometrei."
        );
        Alert.alert("Eroare", "A apărut o problemă la actualizarea biometrei.");
      } finally {
        setBioBusy(false);
      }
    },
    [saveBiometricStatus, triggerHaptic]
  );

  const handleThemeToggle = () => {
    triggerHaptic("light");
    if (!uiPreferences.useSystemTheme) toggleTheme();
  };
  const handlePreferenceChange = (
    key: keyof typeof uiPreferences,
    value: boolean
  ) => {
    updateUIPreferences({ [key]: value });
  };
  const openUrl = (url: string) =>
    Linking.openURL(url).catch((err) =>
      console.error("Couldn't load page", err)
    );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text variant="title" color="onBackground" style={styles.title}>
            Settings
          </Text>
          <Text variant="body" color="onSurfaceVariant" style={styles.subtitle}>
            Customize your app experience
          </Text>
        </View>

        {/* Appearance */}
        <SectionHeader title="Appearance" />
        <Card style={styles.section}>
          <SettingRow
            title="Theme"
            subtitle={`${theme.mode === "light" ? "Light" : "Dark"} mode`}
            leftIcon="color-palette"
            rightComponent={
              <TouchableOpacity
                style={styles.themeButton}
                onPress={handleThemeToggle}
                disabled={uiPreferences.useSystemTheme}
                accessibilityRole="button"
                accessibilityLabel={`Switch to ${
                  theme.mode === "light" ? "dark" : "light"
                } theme`}
                accessibilityState={{ disabled: uiPreferences.useSystemTheme }}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons
                  name={theme.mode === "light" ? "moon" : "sunny"}
                  size={18}
                  color={
                    uiPreferences.useSystemTheme
                      ? theme.colors.onSurfaceVariant
                      : theme.colors.primary
                  }
                />
              </TouchableOpacity>
            }
            disabled={uiPreferences.useSystemTheme}
            isFirst
          />
          <SettingRow
            title="Use System Theme"
            subtitle="Follow device settings"
            leftIcon="phone-portrait"
            rightComponent={
              <ToggleSwitch
                value={uiPreferences.useSystemTheme}
                onValueChange={(value) =>
                  handlePreferenceChange("useSystemTheme", value)
                }
              />
            }
          />
          {/* ✅ Face ID moved here */}
          <SettingRow
            title="Activate Face ID"
            subtitle={
              bioAvailable === false
                ? "Unavailable on this device"
                : "Use biometrics to unlock"
            }
            leftIcon="lock-closed"
            rightComponent={
              <ToggleSwitch
                value={bioEnabled}
                onValueChange={(val) => handleToggleBiometrics(val)}
                disabled={!isAuth || bioAvailable === false}
                busy={bioBusy}
              />
            }
            isLast
          />
        </Card>

        <Spacer size="lg" />

        {/* Links */}
        <View style={styles.menuContainer}>
          <View style={styles.menuGroup}>

          {/*<TouchableOpacity
            style={[styles.menuRow, styles.firstMenuRow]}
            onPress={() => router.push('/settings/more')}
            accessibilityRole="button"
            accessibilityLabel="Open more settings"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text variant="body" color="onSurface" style={styles.menuLabel}>
              More Settings
            </Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={theme.colors.onSurfaceVariant}
            />
          </TouchableOpacity>
          
          <View style={styles.menuSeparator} />
          
          <TouchableOpacity
            style={[styles.menuRow, styles.lastMenuRow]}
            onPress={() => router.push('/settings/preferences')}
            accessibilityRole="button"
            accessibilityLabel="Open preferences settings"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text variant="body" color="onSurface" style={styles.menuLabel}>
              Preferences
            </Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={theme.colors.onSurfaceVariant}
            />
          </TouchableOpacity>*/}


          {/*<View style={styles.menuSeparator} />
          <TouchableOpacity style={[styles.menuRow, styles.lastMenuRow]} accessibilityRole="button" hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text variant="body" color="onSurface" style={styles.menuLabel}>Camera access</Text>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.onSurfaceVariant}/>
          </TouchableOpacity>*/}

          {/*<View style={styles.menuSeparator} />
          <TouchableOpacity style={[styles.menuRow, styles.lastMenuRow]} accessibilityRole="button" hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text variant="body" color="onSurface" style={styles.menuLabel}>Rate Us</Text>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.onSurfaceVariant}/>
          </TouchableOpacity>*/}

          {/*<View style={styles.menuSeparator} />
          <TouchableOpacity style={[styles.menuRow, styles.lastMenuRow]} accessibilityRole="button" hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text variant="body" color="onSurface" style={styles.menuLabel}>Share App</Text>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.onSurfaceVariant}/>
          </TouchableOpacity>*/}

            <View style={styles.menuSeparator} />
            <TouchableOpacity
              style={[styles.menuRow, styles.lastMenuRow]}
              accessibilityRole="button"
              onPress={() => openUrl("https://biosign-app.com/")}
            >
              <Text variant="body" color="onSurface" style={styles.menuLabel}>
                Web site
              </Text>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={theme.colors.onSurfaceVariant}
              />
            </TouchableOpacity>

            <View style={styles.menuSeparator} />
            <TouchableOpacity
              style={[styles.menuRow, styles.lastMenuRow]}
              accessibilityRole="button"
              onPress={() => openUrl("https://biosign-app.com/contact")}
            >
              <Text variant="body" color="onSurface" style={styles.menuLabel}>
                Contact Us
              </Text>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={theme.colors.onSurfaceVariant}
              />
            </TouchableOpacity>

            <View style={styles.menuSeparator} />
            <TouchableOpacity
              style={[styles.menuRow, styles.lastMenuRow]}
              accessibilityRole="button"
              onPress={() => openUrl("https://biosign-app.com/privacy-policy")}
            >
              <Text variant="body" color="onSurface" style={styles.menuLabel}>
                Privacy Policy
              </Text>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={theme.colors.onSurfaceVariant}
              />
            </TouchableOpacity>

            <View style={styles.menuSeparator} />
            <TouchableOpacity
              style={[styles.menuRow, styles.lastMenuRow]}
              accessibilityRole="button"
              onPress={() => openUrl("https://biosign-app.com/term")}
            >
              <Text variant="body" color="onSurface" style={styles.menuLabel}>
                Terms of Use
              </Text>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={theme.colors.onSurfaceVariant}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* About */}
        <SectionHeader title="About" />
        <Card style={styles.section}>
          <View style={styles.aboutContent}>
            <View style={styles.appIconContainer}>
              <Ionicons
                name="document-text"
                size={40}
                color={theme.colors.primary}
              />
            </View>
            <Spacer size="md" />
            <Text variant="headline" color="onSurface" style={styles.appName}>
              BioSign
            </Text>
            <Text
              variant="caption"
              color="onSurfaceVariant"
              style={styles.appVersion}
            >
              Version 1.0.0 • UI Prototype
            </Text>
            <Spacer size="sm" />
            <Text
              variant="body"
              color="onSurface"
              style={styles.appDescription}
            >
              A modern document signing application with biometric
              authentication capabilities.
            </Text>
            {bioError && (
              <>
                <Spacer size="sm" />
                <Text variant="caption" color="error">
                  ⚠️ {bioError}
                </Text>
              </>
            )}
          </View>
        </Card>

        <Spacer size="xxl" />
      </ScrollView>
    </View>
  );
}

// simple SectionHeader component
function SectionHeader({ title }: { title: string }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <Text
      variant="caption"
      color="onSurfaceVariant"
      style={styles.sectionHeader}
    >
      {title.toUpperCase()}
    </Text>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { paddingTop: theme.spacing.xxl, paddingBottom: theme.spacing.md },
    title: { fontSize: 32, fontWeight: "700", marginBottom: theme.spacing.xs },
    subtitle: { fontSize: 15, opacity: 0.8 },
    scrollView: { flex: 1 },
    content: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xl,
    },

    sectionHeader: {
      fontSize: 13,
      fontWeight: "500",
      letterSpacing: 0.5,
      marginBottom: theme.spacing.sm,
      marginLeft: theme.spacing.xs,
    },
    section: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 0,
      marginBottom: theme.spacing.xs,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },

    settingRow: {
      minHeight: 50,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
    },
    firstRow: { borderTopLeftRadius: 16, borderTopRightRadius: 16 },
    lastRow: { borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
    disabledRow: { opacity: 0.5 },
    rowContent: { flexDirection: "row", alignItems: "center", minHeight: 22 },
    iconContainer: { width: 32, height: 32 },
    textContainer: { flex: 1 },
    rowTitle: { fontSize: 16, fontWeight: "400", lineHeight: 22 },
    rowSubtitle: { fontSize: 13, lineHeight: 18, marginTop: 1 },
    rightContainer: { flexDirection: "row", alignItems: "center" },
    chevron: { marginLeft: theme.spacing.sm },
    separator: {
      height: 0.5,
      backgroundColor: theme.colors.outline,
      marginLeft: theme.spacing.lg + 32 + theme.spacing.md,
      opacity: 0.3,
    },

    themeButton: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: theme.colors.surfaceVariant,
      justifyContent: "center",
      alignItems: "center",
    },

    toggle: {
      width: 44,
      height: 26,
      borderRadius: 13,
      backgroundColor: theme.colors.outline,
      justifyContent: "center",
      paddingHorizontal: 2,
    },
    toggleActive: { backgroundColor: theme.colors.primary },
    toggleDisabled: { opacity: 0.4 },
    toggleThumb: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    toggleThumbActive: { transform: [{ translateX: 18 }] },

    menuContainer: { paddingBottom: theme.spacing.lg },
    menuGroup: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      overflow: "hidden",
    },
    menuRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      minHeight: 50,
      backgroundColor: theme.colors.surface,
    },
    lastMenuRow: { borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
    menuLabel: { fontSize: 16, fontWeight: "400" },
    menuSeparator: {
      height: 0.5,
      backgroundColor: theme.colors.outline,
      marginLeft: theme.spacing.lg,
      opacity: 0.3,
    },

    aboutContent: {
      alignItems: "center",
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.md,
    },
    appIconContainer: {
      width: 64,
      height: 64,
      borderRadius: 16,
      backgroundColor: theme.colors.primaryContainer,
      justifyContent: "center",
      alignItems: "center",
    },
    appName: { fontSize: 20, fontWeight: "600" },
    appVersion: { fontSize: 13, fontWeight: "500", opacity: 0.7 },
    appDescription: {
      textAlign: "center",
      lineHeight: 22,
      maxWidth: 260,
      fontSize: 15,
    },
  });
