import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import * as LocalAuthentication from "expo-local-authentication";
import {
  View,
  StyleSheet,
  Button,
  Alert,
  ScrollView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";

import { useTheme } from "@/contexts/ThemeContext";
import {
  Text,
  Card,
  Spacer,
  Badge,
  Icon,
  PressableButton,
} from "@/components/ui";
import { useData } from "@/contexts/DataContext";
import { SERVER_AJAX_URL, useRequests } from "@/hooks/useRequests";
import { enableLocalBiometric, disableLocalBiometric } from "@/lib/secure";
import { isAuthenticated, getUser } from "@/utils/Auth";
import { Ionicons } from "@expo/vector-icons";

type DocumentRow = {
  id: string;
  filename: string;
  created: string;
  status: string;
};

export default function HomeScreen() {
  const { theme } = useTheme();
  const { documents } = useData();
  const router = useRouter();
  const styles = createStyles(theme);
  const { sendDefaultRequest } = useRequests();
  const [refreshing, setRefreshing] = useState(false);
  const totalDocuments = documents.length;
  const signedDocuments = documents.filter((doc) => doc.signed).length;
  const pendingDocuments = totalDocuments - signedDocuments;

  const [loader, setLoader] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);

  const isAuth = isAuthenticated();
  const currentUser = isAuth ? getUser() : null;

  const [loading, setLoading] = useState(true);
  const [docs, setDocs] = useState<DocumentRow[]>([]);

  // --- API helpers (UNICE) ---
  const fetchBiometricStatus = async () => {
    const data = await sendDefaultRequest<{
      success: boolean;
      isBiometricEnabled: boolean;
    }>({
      url: `${SERVER_AJAX_URL}/user/security_get.php`,
      data: {},
      showOptions: { success: false },
    });
    return !!data?.isBiometricEnabled;
  };

useFocusEffect(
  useCallback(() => {
    let mounted = true;
    (async () => {
      // doar refetch, fără să pornești RefreshControl
      await fetchDocuments();
    })();
    return () => { mounted = false; };
  }, [])
);


  const saveBiometricStatus = async (status: boolean) => {
    const data = await sendDefaultRequest<{
      success: boolean;
      isBiometricEnabled: boolean;
    }>({
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
        console.log("Failed to fetch biometric flag", e);
      } finally {
        setLoader(false);
      }
    })();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await sendDefaultRequest<{
        success: boolean;
        documents: DocumentRow[];
      }>({
        url: `${SERVER_AJAX_URL}/documents/list.php`,
        data: {},
        showOptions: { success: false },
      });
      if (res.success) {
        setDocs(res.documents);
      }
    } catch (e) {
      console.log("Failed to load documents", e);
    }
  };
  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchDocuments();
      setLoading(false);
    })();
  }, []);
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDocuments();
    setRefreshing(false);
  };
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

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
        Alert.alert(
          "Biometrie indisponibilă",
          "Activează Face ID / amprentă în setările telefonului."
        );
        return;
      }

      // Cere o dată biometria la activare (confirmare)
      const res = await LocalAuthentication.authenticateAsync({
        promptMessage: "Activează autentificarea biometrică",
        fallbackLabel: "Folosește parola",
      });
      if (!res.success) return;

      // 1) salvează preferința pe server
      const ok = await saveBiometricStatus(true);
      if (!ok) {
        Alert.alert("Eroare", "Nu am putut salva preferința pe server.");
        return;
      }

      // 2) salvează token local care cere biometrie la pornire
      await enableLocalBiometric();

      setIsBiometricEnabled(true);
    } finally {
      setLoader(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch ((status || "").toLowerCase()) {
      case "signed":
        return "success";
      case "pending":
        return "primary";
      case "draft":
        return "secondary";
      case "rejected":
      case "failed":
        return "error";
      case "expired":
        return "warning";
      default:
        return "secondary";
    }
  };

  const getStatusBadgeLabel = (status: string, signed?: boolean) => {
    if (signed || status?.toLowerCase() === "signed") return "signed";
    return (status || "unknown").toLowerCase();
  };

  const formatDate = (s?: string) =>
    s ? new Date(s.replace(" ", "T")).toLocaleString() : "-";

  return (
    <FlatList
      contentContainerStyle={{ paddingBottom: 120 }}
      style={styles.container}
      data={docs}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListHeaderComponent={
        <>
          <View>
            <Text variant="title" color="onBackground">
              BioSign
            </Text>
            <Text variant="body" color="onSurfaceVariant">
              Welcome to your biometric signature app
            </Text>
          </View>

{/*          {isAuth && (
            <Button
              title={
                isBiometricEnabled ? "Disable Biometric" : "Enable Biometric"
              }
              onPress={handleSetBiometricAuth}
              disabled={loader}
            />
          )}*/}

          <View style={styles.content}>
            <Card>
              <Text variant="headline" color="onSurface">
                Quick Actions
              </Text>
              <Spacer size="md" />
              <PressableButton
                title="Create New Document"
                onPress={() => router.push("/sign/create")}
                variant="primary"
                style={styles.actionButton}
              />
              <Spacer size="sm" />
              {/*<PressableButton
                title="View Recent Documents"
                onPress={() => router.push("/documents")}
                variant="outline"
                style={styles.actionButton}
              />*/}
            </Card>
          </View>
        </>
      }
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => router.push(`/sign/${item.id}`)}>
          <Card style={styles.documentCard}>
            <View style={styles.documentHeader}>
              <View style={styles.documentInfo}>
                <Text variant="headline" color="onSurface" numberOfLines={1}>
                  {item.title}
                  {/*{item.filename}*/}
                </Text>
                <Spacer size="xs" />
                <Text variant="caption" color="onSurfaceVariant">
                  {formatDate(item.created)}
                </Text>
              </View>

              <View style={styles.documentActions}>
                <Badge
                  label={getStatusBadgeLabel(item.status, item.signed)}
                  variant={getStatusBadgeVariant(item.status, item.signed)}
                />
                <Spacer size="sm" horizontal />
                <Icon
                  name="chevron-forward"
                  size="medium"
                  color="onSurfaceVariant"
                />
              </View>
            </View>
          </Card>
        </TouchableOpacity>
      )}
    />
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingTop: theme.spacing.xxl + theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xs,
    },

    title: {},
    subtitle: {
      textAlign: "left",
    },
    content: {
      flex: 1,
    },
    sectionTitle: {
      marginBottom: theme.spacing.lg,
    },
    actionButton: {
      width: "100%",
    },
    statsCard: {
      padding: theme.spacing.xl,
    },
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-around",
    },
    statItem: {
      alignItems: "center",
    },

    documentCard: {
      marginTop: theme.spacing.sm,
      padding: theme.spacing.lg,
    },
    documentHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    documentInfo: {
      flex: 1,
      marginRight: theme.spacing.md,
    },
    documentActions: {
      flexDirection: "row",
      alignItems: "center",
    },

    center: { flex: 1, alignItems: "center", justifyContent: "center" },
  });
