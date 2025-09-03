import { useEffect, useState, useMemo } from "react";
import { View, ActivityIndicator, StyleSheet, Platform, Alert } from "react-native";
import { Text, Card, Spacer, Badge, PressableButton } from "@/components/ui";
import { useLocalSearchParams } from "expo-router";
import { SERVER_AJAX_URL, useRequests } from "@/hooks/useRequests";
import * as FileSystem from "expo-file-system";
import FileViewer from "react-native-file-viewer";

import * as Device from "expo-device";
import * as Application from "expo-application";
import * as Localization from "expo-localization";
import { getTokens } from "@/utils/Auth"; // ⬅️ asigură-te că ai asta

const isValidUUID = (id?: string) => !!id && /^[0-9a-fA-F-]{36}$/.test(id);
const BASE_URL = "https://biosign-app.com/";

// în funcție de extensie returnează o sugestie de mime (util pe Android)
const guessMime = (urlOrName: string) => {
  const ext = (urlOrName.split(".").pop() || "").toLowerCase();
  switch (ext) {
    case "pdf": return "application/pdf";
    case "png": return "image/png";
    case "jpg":
    case "jpeg": return "image/jpeg";
    case "webp": return "image/webp";
    case "doc": return "application/msword";
    case "docx": return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "xls": return "application/vnd.ms-excel";
    case "xlsx": return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    default: return undefined;
  }
};

export default function DocumentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { sendDefaultRequest } = useRequests();

  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [opening, setOpening] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [signing, setSigning] = useState(false);

  const timezone = useMemo(() => Localization.timezone ?? "UTC", []);

const handleSignConsent = async () => {
  try {
    const device = {
      model: `${Device.manufacturer ?? ""} ${Device.modelName ?? ""}`.trim(),
      os: `${Device.osName ?? (Platform.OS === "ios" ? "iOS" : "Android")} ${Device.osVersion ?? ""}`,
      appVersion: Application.nativeApplicationVersion ?? Application.nativeBuildVersion ?? "unknown",
    };
    const timezone = Localization.timezone ?? "UTC";

    await sendDefaultRequest({
      url: `${SERVER_AJAX_URL}/documents/consent.php`,
      showOptions: { success: true, error: true },
      data: {
        documentId: id,
        timezone,
        device, // hook-ul tău îl stringify-uiește în FormData
      },
    });

    setDoc((d: any) => ({ ...d, status: "signed" }));
  } catch (e: any) {
    Alert.alert("Error", e?.message ?? "Sign failed");
  }
};


  useEffect(() => {
    (async () => {
      if (!isValidUUID(id)) {
        setError("Invalid document id");
        setLoading(false);
        return;
      }
      try {
        const tokens = getTokens?.();
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (tokens?.accessToken) headers.Authorization = `Bearer ${tokens.accessToken}`;

        const res = await sendDefaultRequest<{
          success: boolean;
          document?: any;
          message?: string;
          debug?: any;
        }>({
          url: `${SERVER_AJAX_URL}/documents/item.php`,
          method: "POST",
          data: { id }, // UUID ca string
          headers,
        });

        if (res.success && res.document) {
          setDoc(res.document);
        } else {
          setError(res.message ?? "Document not found");
        }
      } catch (e: any) {
        setError(e?.message ?? "Server error");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const buildFileUrl = () => {
    let key: string = doc?.storage_key || "";
    if (!key) return null;
    const hasSlash = BASE_URL.endsWith("/") || key.startsWith("/");
    return hasSlash ? `${BASE_URL}${key.replace(/^\//, "")}` : `${BASE_URL}/${key}`;
  };

  const openDocument = async () => {
    try {
      const fileUrl = buildFileUrl();
      if (!fileUrl) {
        setError("Missing storage_key for this document.");
        return;
      }

      setOpening(true);
      setError(null);
      setProgress(0);

      const filenameFromUrl = (() => {
        try {
          const u = new URL(fileUrl);
          const last = u.pathname.split("/").pop();
          return last || "document";
        } catch {
          const parts = fileUrl.split("/");
          return parts[parts.length - 1] || "document";
        }
      })();

      const fileUri = `${FileSystem.documentDirectory}${filenameFromUrl}`;

      const dl = FileSystem.createDownloadResumable(fileUrl, fileUri, {}, (p) => {
        if (p.totalBytesExpectedToWrite > 0) {
          setProgress(p.totalBytesWritten / p.totalBytesExpectedToWrite);
        }
      });

      const download = await dl.downloadAsync();
      if (!download?.uri) throw new Error("Failed to download file.");

      const mime = guessMime(download.uri) || guessMime(filenameFromUrl);

      await FileViewer.open(download.uri, {
        showOpenWithDialog: true,
        showAppsSuggestions: true,
        displayName: doc?.filename || filenameFromUrl, // iOS only
        type: Platform.OS === "android" ? mime : undefined,
      });
    } catch (e: any) {
      setError(e?.message || "Failed to open file");
    } finally {
      setOpening(false);
      setProgress(0);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text variant="body" color="error">{String(error)}</Text>
        <Spacer size="md" />
      </View>
    );
  }

  if (!doc) {
    return (
      <View style={styles.center}>
        <Text variant="body">Document not found</Text>
      </View>
    );
  }

  const createdText = doc.created_at
    ? new Date(String(doc.created_at).replace(" ", "T")).toLocaleString()
    : "-";

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Text variant="headline" color="onSurface">
          {doc.filename ?? "Untitled Document"}
        </Text>
        <Spacer size="xs" />
        <Text variant="caption" color="onSurfaceVariant">{createdText}</Text>
        <Spacer size="md" />
        <Badge
          label={doc.status ?? "unknown"}
          variant={
            (doc.status || "").toLowerCase() === "signed" ? "success"
            : (doc.status || "").toLowerCase() === "pending" ? "primary"
            : "secondary"
          }
        />
        <Spacer size="lg" />
        <PressableButton
          title={
            opening
              ? (progress > 0 ? `Downloading ${Math.round(progress * 100)}%` : "Opening...")
              : "Open document"
          }
          onPress={openDocument}
          disabled={opening}
          variant="primary"
        />

        {String(doc.status).toLowerCase() !== "signed" && (
          <>
            <Spacer size="md" />
            <PressableButton
              title={signing ? "Signing..." : "Sign Document"}
              onPress={handleSignConsent}
              disabled={signing}
              variant="primary"
            />
          </>
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { padding: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
