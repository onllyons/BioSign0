import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Button, Alert } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';

import { useTheme } from '@/contexts/ThemeContext';
import { Text, Card, Spacer, PressableButton } from '@/components/ui';
import { useRouter } from 'expo-router';
import { useData } from '@/contexts/DataContext';
import { SERVER_AJAX_URL, useRequests } from '@/hooks/useRequests';
import { enableLocalBiometric, disableLocalBiometric } from '@/lib/secure';

export default function HomeScreen() {
  const { theme } = useTheme();
  const { documents } = useData();
  const router = useRouter();
  const styles = createStyles(theme);
  const { sendDefaultRequest } = useRequests();

  const totalDocuments = documents.length;
  const signedDocuments = documents.filter(doc => doc.signed).length;
  const pendingDocuments = totalDocuments - signedDocuments;

  const [loader, setLoader] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);

  // --- API helpers (UNICE) ---
  const fetchBiometricStatus = async () => {
    const data = await sendDefaultRequest<{ success: boolean; isBiometricEnabled: boolean }>({
      url: `${SERVER_AJAX_URL}/user/security_get.php`,
      data: {},
      showOptions: { success: false },
    });
    return !!data?.isBiometricEnabled;
  };

  const saveBiometricStatus = async (status: boolean) => {
    const data = await sendDefaultRequest<{ success: boolean; isBiometricEnabled: boolean }>({
      url: `${SERVER_AJAX_URL}/user/security_set.php`,
      data: { isBiometricEnabled: status },
      showOptions: { success: false },
    });
    return !!data?.success;
  };

  // --- la mount: ia flag-ul din DB ---
  useEffect(() => {
    (async () => {
      try {
        setLoader(true);
        const s = await fetchBiometricStatus();
        setIsBiometricEnabled(s);
      } catch (e) {
        console.log('Failed to fetch biometric flag', e);
      } finally {
        setLoader(false);
      }
    })();
  }, []);

    const handleSetBiometricAuth = async () => {
      try {
        setLoader(true);

        if (isBiometricEnabled) {
          // Dezactivare: server + local
          const ok = await saveBiometricStatus(false);
          if (ok) {
            await disableLocalBiometric();
            setIsBiometricEnabled(false);
          }
          return;
        }

        // Activare
        const compatible = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        if (!compatible || !enrolled) {
          Alert.alert('Biometrie indisponibilă', 'Activează Face ID / amprentă în setările telefonului.');
          return;
        }

        // Cere o dată biometria la activare (confirmare)
        const res = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Activează autentificarea biometrică',
          fallbackLabel: 'Folosește parola',
        });
        if (!res.success) return;

        // 1) salvează preferința pe server
        const ok = await saveBiometricStatus(true);
        if (!ok) {
          Alert.alert('Eroare', 'Nu am putut salva preferința pe server.');
          return;
        }

        // 2) salvează token local care cere biometrie la pornire
        await enableLocalBiometric();

        setIsBiometricEnabled(true);
      } finally {
        setLoader(false);
      }
    };

  return (
    <View style={styles.container}>
      {/* dacă loader-ul tău este modal, îl poți lăsa așa */}
      {/* <Loader visible={loader} /> */}

      <View style={styles.header}>
        <Text variant="title" color="onBackground" style={styles.title}>
          BioSign
        </Text>
        <Text variant="body" color="onSurfaceVariant" style={styles.subtitle}>
          Welcome to your biometric signature app
        </Text>
      </View>

      <Text>
        Biometric Authentication: {isBiometricEnabled ? 'Enabled' : 'Disabled'}
      </Text>
      <Button
        title={
          isBiometricEnabled
            ? 'Disable Biometric Authentication'
            : 'Enable Biometric Authentication'
        }
        onPress={handleSetBiometricAuth}
        disabled={loader}
      />

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

        {/* Secțiunea de statistici e comentată – o poți reactiva când vrei */}
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
        paddingBottom: theme.spacing.xs,
    },
    title: {
    },
    subtitle: {
        textAlign: 'left',
    },
    content: {
        flex: 1,
        paddingHorizontal: theme.spacing.lg,
    },
    quickActions: {
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