// app/(auth)/forgot-password.tsx
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Pressable,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { Text, Spacer } from '@/components/ui';

export default function ForgotPasswordScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const styles = createStyles(theme);

  const [email, setEmail] = useState('');

  const onSend = () => {
    // TODO: trimite email de reset
    // ex. dupa succes: router.push('/login');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <SafeAreaView style={styles.container}>
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[styles.scrollContent, { paddingBottom: (theme?.spacing?.xl ?? 24) }]}
          >
            <View style={styles.wrapper}>
              {/* Header simpatic */}
              <View style={styles.header}>
                <Text variant="title" color="onBackground" style={styles.title}>
                  Forgot password
                </Text>
                <Text variant="body" color="onSurfaceVariant" style={styles.subtitle}>
                  Enter your email and we’ll send you a reset link.
                </Text>
              </View>

              {/* Card */}
              <View style={styles.card}>
                <View style={styles.field}>
                  <Text variant="caption" color="onSurfaceVariant" style={styles.label}>
                    Email
                  </Text>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="name@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="emailAddress"
                    returnKeyType="done"
                    onSubmitEditing={onSend}
                    style={styles.input}
                    placeholderTextColor={styles._pColor}
                    accessibilityLabel="Email"
                  />
                </View>

                <Pressable
                  onPress={onSend}
                  accessibilityRole="button"
                  accessibilityLabel="Send reset link"
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    pressed && styles.primaryBtnPressed,
                  ]}
                >
                  <Text variant="button" color="onPrimary" style={styles.primaryBtnText}>
                    Send reset link
                  </Text>
                </Pressable>
                <Spacer size="lg" />
                <Link href="/login" asChild>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Back to login"
                    style={({ pressed }) => [
                      styles.secondaryBtn,
                      pressed && styles.secondaryBtnPressed,
                    ]}
                  >
                    <Text variant="button" color="primary" style={styles.secondaryBtnText}>
                      Back to login
                    </Text>
                  </Pressable>
                </Link>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const createStyles = (theme: any) => {
  const radius = theme?.radius?.xl ?? 16;
  const spacing = theme?.spacing ?? { xs: 6, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
  const colors = theme?.colors ?? {
    background: '#F7F8FA',
    surface: '#FFFFFF',
    onBackground: '#111111',
    onSurface: '#111111',
    onSurfaceVariant: '#6B7280',
    primary: '#0A84FF',
    onPrimary: '#FFFFFF',
    outline: '#E5E7EB',
  };
  const placeholder = Platform.select({ ios: '#9AA0A6', android: '#9AA0A6', default: '#9AA0A6' });

  return StyleSheet.create({
    _pColor: placeholder as any,

    container: { flex: 1, backgroundColor: colors.background },
    scrollContent: { flexGrow: 1 },
    wrapper: { flexGrow: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.xl },

    header: { marginBottom: spacing.xl },
    subtitle: {},

    card: {
      
    },

    field: { marginBottom: spacing.lg },
    label: { marginBottom: spacing.sm, fontSize: 15 },

    input: {
      borderWidth: 1,
      borderColor: colors.outline,
      backgroundColor: colors.surface,
      color: colors.onSurface,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: radius,
      fontSize: 16,
    },

    primaryBtn: {
      backgroundColor: colors.primary,
      borderRadius: radius,
      paddingVertical: spacing.md + 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryBtnPressed: { opacity: 0.9 },
    primaryBtnText: { textAlign: 'center', color: 'white', },

    secondaryBtn: {
      marginTop: spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondaryBtnPressed: { opacity: 0.95 },
    secondaryBtnText: { textAlign: 'center' },
  });
};
