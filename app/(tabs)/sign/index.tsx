// HomeScreen.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { Text, Card, Spacer, Badge, Icon, PressableButton } from "@/components/ui";
import { SERVER_AJAX_URL, useRequests } from "@/hooks/useRequests";
import { isAuthenticated } from "@/utils/Auth";

type DocumentStatus = "signed" | "pending" | "draft" | "rejected" | "failed" | "expired" | "unknown";
type DocumentRow = {
  id: string;
  title?: string;
  filename?: string;
  created?: string;
  status?: DocumentStatus;
  signed?: boolean;
};

type ApiListDocuments = { success: boolean; documents: DocumentRow[] };

export default function HomeScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const { sendDefaultRequest } = useRequests();

  const isAuth = isAuthenticated();

  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [docs, setDocs] = useState<DocumentRow[]>([]);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const fetchDocuments = useCallback(async (): Promise<void> => {
    const res = await sendDefaultRequest<ApiListDocuments>({
      url: `${SERVER_AJAX_URL}/documents/list.php`,
      data: {},
      showOptions: { success: false },
    });
    if (res?.success && Array.isArray(res.documents)) {
      setDocs(res.documents);
      setError(null);
    } else {
      throw new Error("Invalid response");
    }
  }, [sendDefaultRequest]);

  useEffect(() => {
    if (!isAuth) { setInitialLoading(false); return; }
    (async () => {
      try {
        setInitialLoading(true);
        await fetchDocuments();
      } catch (e: any) {
        if (mountedRef.current) setError(e?.message ?? "Failed to load documents");
      } finally {
        if (mountedRef.current) setInitialLoading(false);
      }
    })();
  }, [isAuth, fetchDocuments]);

  useFocusEffect(useCallback(() => {
    if (!isAuth) return;
    let active = true;
    (async () => { try { await fetchDocuments(); } catch { active && setError("Failed to refresh documents"); } })();
    return () => { active = false; };
  }, [isAuth, fetchDocuments]));

  const onRefresh = useCallback(async () => {
    if (!isAuth) return;
    try { setRefreshing(true); await fetchDocuments(); } 
    catch (e: any) { setError(e?.message ?? "Failed to refresh documents"); } 
    finally { setRefreshing(false); }
  }, [isAuth, fetchDocuments]);

  const getStatusBadgeVariant = (status?: string, signed?: boolean) => {
    const s = (status ?? (signed ? "signed" : "unknown")).toLowerCase();
    switch (s) {
      case "signed": return "success";
      case "pending": return "primary";
      case "draft": return "secondary";
      case "rejected":
      case "failed": return "error";
      case "expired": return "warning";
      default: return "secondary";
    }
  };
  const getStatusBadgeLabel = (status?: string, signed?: boolean) => (signed || status?.toLowerCase() === "signed") ? "signed" : (status ?? "unknown").toLowerCase();
  const formatDate = (s?: string) => {
    if (!s) return "-";
    const iso = s.includes("T") ? s : s.replace(" ", "T");
    const d = new Date(iso);
    return isNaN(d.getTime()) ? s : d.toLocaleString();
  };

  if (!isAuth) {
    return (
      <View style={styles.center}>
        <Text variant="body">Please sign in to view your documents.</Text>
        <Spacer size="md" />
        <PressableButton title="Go to Sign In" onPress={() => router.replace("/login")} />
      </View>
    );
  }

  if (initialLoading) {
    return (<View style={styles.center}><ActivityIndicator size="large" /></View>);
  }

  return (
    <FlatList
      contentContainerStyle={{ paddingBottom: 120 }}
      style={styles.container}
      data={docs}
      keyExtractor={(item) => item.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListHeaderComponent={
        <>
          <View>
            <Text variant="title" color="onBackground">BioSign</Text>
            <Text variant="body" color="onSurfaceVariant">Welcome to your biometric signature app</Text>
          </View>
          <View style={styles.content}>
            <Card>
              <Text variant="headline" color="onSurface">Quick Actions</Text>
              <Spacer size="md" />
              <PressableButton
                title="Create New Document"
                onPress={() => router.push("/sign/create")}
                variant="primary"
                style={styles.actionButton}
              />
            </Card>
          </View>
          {error && (
            <>
              <Spacer size="md" />
              <Card>
                <Text variant="body" color="error">⚠️ {error}</Text>
                <Spacer size="sm" />
                <PressableButton title="Retry" onPress={onRefresh} />
              </Card>
            </>
          )}
        </>
      }
      ListEmptyComponent={
        <Card style={{ marginTop: theme.spacing.md, padding: theme.spacing.lg }}>
          <Text variant="body" color="onSurfaceVariant">No documents yet.</Text>
          <Spacer size="sm" />
          <PressableButton title="Create your first document" onPress={() => router.push("/sign/create")} />
        </Card>
      }
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => router.push(`/sign/${item.id}`)} activeOpacity={0.7}>
          <Card style={styles.documentCard}>
            <View style={styles.documentHeader}>
              <View style={styles.documentInfo}>
                <Text variant="headline" color="onSurface" numberOfLines={1}>
                  {item.title || item.filename || "Untitled document"}
                </Text>
                <Spacer size="xs" />
                <Text variant="caption" color="onSurfaceVariant">{formatDate(item.created)}</Text>
              </View>
              <View style={styles.documentActions}>
                <Badge label={getStatusBadgeLabel(item.status, item.signed)} variant={getStatusBadgeVariant(item.status, item.signed)} />
                <Spacer size="sm" horizontal />
                <Icon name="chevron-forward" size="medium" color="onSurfaceVariant" />
              </View>
            </View>
          </Card>
        </TouchableOpacity>
      )}
      initialNumToRender={8}
      windowSize={11}
      removeClippedSubviews
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
    content: { flex: 1 },
    actionButton: { width: "100%" },
    documentCard: { marginTop: theme.spacing.sm, padding: theme.spacing.lg },
    documentHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    documentInfo: { flex: 1, marginRight: theme.spacing.md },
    documentActions: { flexDirection: "row", alignItems: "center" },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
  });
