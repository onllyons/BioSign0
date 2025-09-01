import { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet, Platform } from "react-native";
import { Text, Card, Spacer, Badge, PressableButton } from "@/components/ui";
import { useLocalSearchParams } from "expo-router";
import { SERVER_AJAX_URL, useRequests } from "@/hooks/useRequests";
import * as FileSystem from "expo-file-system";
import FileViewer from "react-native-file-viewer";

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

  useEffect(() => {
    (async () => {
      if (!isValidUUID(id)) {
        setError("Invalid document id");
        setLoading(false);
        return;
      }
      try {
        const res = await sendDefaultRequest<{
          success: boolean;
          document?: any;
          message?: string;
          debug?: any;
        }>({
          url: `${SERVER_AJAX_URL}/documents/item.php`,
          method: "POST",
          data: { id }, // UUID ca string (serverul tău așteaptă string)
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
    // storage_key vine din DB, ex: "uploads/docs/abc.pdf"
    let key: string = doc?.storage_key || "";
    if (!key) return null;
    // asigură-te că nu dublezi / între BASE_URL și key
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

      // nume de fișier local (fallback dacă nu avem nume în URL)
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

      // progress callback (opțional)
      const dl = FileSystem.createDownloadResumable(
        fileUrl,
        fileUri,
        {},
        (p) => {
          if (p.totalBytesExpectedToWrite > 0) {
            setProgress(p.totalBytesWritten / p.totalBytesExpectedToWrite);
          }
        }
      );

      const download = await dl.downloadAsync();

      if (!download?.uri) {
        throw new Error("Failed to download file.");
      }

      // Android cere uneori mimeType corect:
      const mime = guessMime(download.uri) || guessMime(filenameFromUrl);

      await FileViewer.open(download.uri, {
        showOpenWithDialog: true, // pe Android oferă alegere app
        showAppsSuggestions: true,
        displayName: doc?.filename || filenameFromUrl, // iOS only
        type: Platform.OS === "android" ? mime : undefined,
      });

    } catch (e: any) {
      // mesaje frecvente:
      // - "No app associated with this mime type" pe Android dacă nu există viewer
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
        <Text variant="body" color="error">{error}</Text>
        <Spacer size="md" />
        {/* opțional: buton retry */}
        {/* <PressableButton title="Retry" variant="outline" onPress={() => { setLoading(true); setError(null); /* re-trigger useEffect by changing id or use a separate loader */ /* }} /> */}
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
          title={opening ? (progress > 0 ? `Downloading ${Math.round(progress * 100)}%` : "Opening...") : "Open document"}
          onPress={openDocument}
          disabled={opening}
          variant="primary"
        />
        {/* opțional: arată URL-ul construit în dev */}
        {/* <Spacer size="sm" />
        <Text variant="caption" color="onSurfaceVariant">{buildFileUrl()}</Text> */}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { padding: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
