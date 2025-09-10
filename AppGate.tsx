import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, ActivityIndicator, Alert, AppState, AppStateStatus, StyleSheet, TouchableOpacity } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';

import { useTheme } from '@/contexts/ThemeContext';
import { Text } from '@/components/ui';
import { SERVER_AJAX_URL, useRequests } from '@/hooks/useRequests';
import { hasLocalBiometric } from '@/lib/secure';
import { isAuthenticated, logout } from '@/utils/Auth';
import { shouldSuppressGate } from '@/lib/gateControl';

type ApiBiometricGet = { success: boolean; isBiometricEnabled: boolean };

export default function AppGate({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { sendDefaultRequest } = useRequests();
  const ignoreFirstActiveRef = useRef(true);
  const [checking, setChecking] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [forcing, setForcing] = useState(false);

  const forcingRef = useRef(false);
  const unlockedRef = useRef(false);
  useEffect(() => { forcingRef.current = forcing; }, [forcing]);
  useEffect(() => { unlockedRef.current = unlocked; }, [unlocked]);

  const [error, setError] = useState<string | null>(null);
  const lastAttemptRef = useRef<number>(0);

  const mountedRef = useRef(true);
  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  const fetchServerFlag = useCallback(async (): Promise<boolean> => {
    try {
      const res = await sendDefaultRequest<ApiBiometricGet>({
        url: `${SERVER_AJAX_URL}/user/security_get.php`,
        data: {},
        showOptions: { success: false },
      });
      return !!res?.isBiometricEnabled;
    } catch {
      return false;
    }
  }, [sendDefaultRequest]);

  const promptBiometric = useCallback(async (): Promise<boolean> => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!compatible || !enrolled) {
      setError('Biometrics unavailable on this device.');
      return false;
    }

    const res = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock the app',
      fallbackLabel: 'Use device code',
      cancelLabel: 'Cancel',
      // disableDeviceFallback: true, // iOS only, dacă vrei strict Face ID/Touch ID
    });

    if (!res.success) {
      // anulare de către utilizator / sistem → nu afișăm eroare roșie
      if (res.error === 'user_cancel' || res.error === 'system_cancel') {
        setError(null);
        return false;
      }
      // senzor blocat
      if (res.error === 'lockout' || res.error === 'lockout_permanent') {
        setError('Biometrics are locked. Unlock your device with passcode and try again.');
        return false;
      }
      // alt eșec
      setError('Authentication failed. Try again.');
      return false;
    }

    setError(null);
    return true;
  }, []);


  const runGate = useCallback(async () => {
    if (!mountedRef.current) return;
    if (forcingRef.current) return;
    if (unlockedRef.current) return;
    if (shouldSuppressGate()) return;
    setChecking(true);
    setError(null);

    try {
      if (!isAuthenticated()) { 
        setUnlocked(true); 
        unlockedRef.current = true;
        setChecking(false);
        return; 
      }

    const serverEnabled = await fetchServerFlag();
      if (!serverEnabled) { 
        setUnlocked(true); 
        unlockedRef.current = true;
        setChecking(false);
        return; 
      }
    setChecking(true);
    setForcing(true);
    forcingRef.current = true;
    const ok = await promptBiometric();
    setForcing(false);
    forcingRef.current = false;

    setUnlocked(!!ok);
    unlockedRef.current = !!ok;
    if (!ok) setError('Login failed. Please try again.');
  } catch (e:any) {
    setUnlocked(false);
    unlockedRef.current = false;
    setError(e?.message ?? 'Biometric verification error.');
  } finally {
    setChecking(false);
    lastAttemptRef.current = Date.now();
  }
}, [fetchServerFlag, promptBiometric]);

useEffect(() => { runGate(); }, []);

useEffect(() => {
  const sub = AppState.addEventListener('change', (state) => {
     if (state === 'background') {
      if (!forcingRef.current) {
        setUnlocked(false);
        unlockedRef.current = false;
      }
       return;
     }
    if (state === 'active') {
       if (ignoreFirstActiveRef.current) {
          ignoreFirstActiveRef.current = false;
          return;
       }
      if (forcingRef.current) return;
      if (unlockedRef.current) return;
       if (shouldSuppressGate()) return;
       const now = Date.now();
       if (now - lastAttemptRef.current > 800) {
         runGate();
       }
    }
  });
  return () => sub.remove();
}, [runGate]);

  if (checking) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text variant="caption" color="onSurfaceVariant" style={{ marginTop: 8 }}>
          Checking security settings...
        </Text>
      </View>
    );
  }

  if (!unlocked) {
    return (
      <View style={styles.lockContainer}>
        <Text variant="title" color="onBackground" style={{ marginBottom: 8 }}>The application is blocked.</Text>
        <Text variant="body" color="onSurfaceVariant" style={{ textAlign: 'center', marginHorizontal: 24 }}>
          {error ?? 'Requires biometric authentication to continue.'}
        </Text>

        <TouchableOpacity
          style={[styles.primaryBtn, forcing && styles.btnDisabled]}
          onPress={() => runGate()}
          disabled={forcing}
          accessibilityRole="button"
        >
          {forcing ? <ActivityIndicator /> : <Text variant="body" style={{ color: '#fff' }}>Unlocked</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => {
            try { logout?.(); } catch {}
            runGate();
          }}
          accessibilityRole="button"
        >
          <Text variant="body" color="primary">Change account</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <>{children}</>;
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background },

    lockContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background,
    },
    primaryBtn: {
      marginTop: 16,
      minWidth: 160,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 10,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
    },
    btnDisabled: { opacity: 0.7 },
    secondaryBtn: {
      marginTop: 16,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
  });
