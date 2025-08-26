// app/(auth)/register.tsx
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Pressable,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback, ScrollView,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, Link } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { Text, Spacer } from '@/components/ui';

export default function RegisterScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const styles = createStyles(theme);
  const insets = useSafeAreaInsets();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [secure1, setSecure1] = useState(true);
  const [secure2, setSecure2] = useState(true);


  const onCreateProfile = () => {
    // TODO: integrate sign-up logic
    // de test, poți face: router.replace('/');
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
            // flexGrow ca să permită scroll când tastatura apare
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: (theme?.spacing?.xxl ?? 32) * 2 },
            ]}
          >
          <View style={styles.wrapper}>
            <Text variant="title" color="onBackground" style={styles.title}>
              Create account
            </Text>
            <Text variant="body" color="onSurfaceVariant" style={styles.subtitle}>
              Fill in your details to continue
            </Text>

            <View style={styles.card}>
              {/* Full name */}
              <View style={styles.field}>
                <Text variant="caption" color="onSurfaceVariant" style={styles.label}>
                  Full name
                </Text>
                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="John Appleseed"
                  autoCapitalize="words"
                  autoCorrect
                  textContentType="name"
                  style={styles.input}
                  placeholderTextColor={styles._pColor}
                  accessibilityLabel="Full name"
                  returnKeyType="next"
                />
              </View>

              {/* Email */}
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
                  style={styles.input}
                  placeholderTextColor={styles._pColor}
                  accessibilityLabel="Email"
                  returnKeyType="next"
                />
              </View>

              {/* Password */}
              <View style={styles.field}>
                <Text variant="caption" color="onSurfaceVariant" style={styles.label}>
                  Password
                </Text>
                <View style={styles.passwordRow}>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Create a password"
                    secureTextEntry={secure1}
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="newPassword"
                    style={[styles.input, styles.inputPassword]}
                    placeholderTextColor={styles._pColor}
                    accessibilityLabel="Password"
                    returnKeyType="next"
                  />
                  <Pressable
                    onPress={() => setSecure1(s => !s)}
                    accessibilityRole="button"
                    accessibilityLabel={secure1 ? 'Show password' : 'Hide password'}
                    style={styles.showBtn}
                  >
                    <Text variant="body" color="primary">
                      {secure1 ? 'Show' : 'Hide'}
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* Repeat password */}
              <View style={styles.field}>
                <Text variant="caption" color="onSurfaceVariant" style={styles.label}>
                  Repeat password
                </Text>
                <View style={styles.passwordRow}>
                  <TextInput
                    value={repeatPassword}
                    onChangeText={setRepeatPassword}
                    placeholder="Repeat your password"
                    secureTextEntry={secure2}
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="newPassword"
                    style={[styles.input, styles.inputPassword]}
                    placeholderTextColor={styles._pColor}
                    accessibilityLabel="Repeat password"
                    returnKeyType="done"
                    blurOnSubmit
                    onSubmitEditing={Keyboard.dismiss}
                  />
                  <Pressable
                    onPress={() => setSecure2(s => !s)}
                    accessibilityRole="button"
                    accessibilityLabel={secure2 ? 'Show password' : 'Hide password'}
                    style={styles.showBtn}
                  >
                    <Text variant="body" color="primary">
                      {secure2 ? 'Show' : 'Hide'}
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* Create profile */}
              <Pressable
                onPress={onCreateProfile}
                accessibilityRole="button"
                accessibilityLabel="Create profile"
                style={({ pressed }) => [
                  styles.primaryBtn,
                  pressed && styles.primaryBtnPressed,
                ]}
              >
                <Text variant="button" color="onPrimary" style={styles.primaryBtnText}>
                  Create profile
                </Text>
              </Pressable>
              <Spacer size="lg" />
              <Link href="/login" asChild>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="I already have an account"
                  style={({ pressed }) => [
                    styles.secondaryBtn,
                    pressed && styles.secondaryBtnPressed,
                  ]}
                >
                  <Text variant="button" color="primary" style={styles.secondaryBtnText}>
                    I already have an account
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
  const spacing = theme?.spacing ?? {
    xs: 6, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32,
  };
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

    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    wrapper: {
      flex: 1,
      paddingHorizontal: spacing.lg,
    },
    title: {
      marginTop: spacing.xl,
    },
    subtitle: {
      marginBottom: spacing.xl,
    },

    card: {
    },

    field: {
      marginBottom: spacing.lg,
    },
    label: {
      marginBottom: spacing.sm,
      fontSize: 15,
    },
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

    passwordRow: {
      position: 'relative',
      justifyContent: 'center',
    },
    inputPassword: {
      paddingRight: 72,
    },
    showBtn: {
      position: 'absolute',
      right: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 999,
      justifyContent: 'center',
      alignItems: 'center',
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
    secondaryBtnText: { textAlign: 'center' },
  });
};
