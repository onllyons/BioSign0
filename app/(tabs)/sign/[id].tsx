import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { Text } from "@/components/ui";
import { useLocalSearchParams } from "expo-router";
import { SERVER_AJAX_URL, useRequests } from "@/hooks/useRequests";

export default function DocumentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { sendDefaultRequest } = useRequests();
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await sendDefaultRequest<{
          success: boolean;
          document: any;
        }>({
          url: `${SERVER_AJAX_URL}/documents/item.php`,
          data: { id },
        });
        if (res.success) {
          setDoc(res.document);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return <ActivityIndicator />;
  }

  if (!doc) {
    return <Text>Document not found</Text>;
  }

  return (
    <View>
      <Text variant="headline">{doc.filename}</Text>
      <Text>{doc.status}</Text>
      <Text>{new Date(doc.created.replace(" ", "T")).toLocaleString()}</Text>
    </View>
  );
}
