import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Text, Input, Button, Card, Spacer } from '@/components/ui';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import { SERVER_AJAX_URL, useRequests } from "@/hooks/useRequests";

export default function CreateDocumentScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const styles = createStyles(theme);
  const { sendDefaultRequest } = useRequests();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file: null as null | { uri: string; name: string; mime: string },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePickFile = async () => {
    const res = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
    });
    if (!res.canceled) {
      const f = res.assets[0];
      setFormData(prev => ({
        ...prev,
        file: { uri: f.uri, name: f.name ?? 'document.pdf', mime: f.mimeType ?? 'application/pdf' },
      }));
      if (!formData.title) {
        handleInputChange('title', (f.name ?? '').replace(/\.pdf$/i, ''));
      }
    }
  };

const handleSave = async () => {
  if (!formData.title.trim()) { Alert.alert('Error','Please enter a document title'); return; }
  if (!formData.file) { Alert.alert('Error','Please select a PDF file to upload'); return; }

  try {
    await sendDefaultRequest({
      url: `${SERVER_AJAX_URL}/documents/upload.php`,
      showOptions: { success: true, error: true },
      data: {
        title: formData.title,
        description: formData.description,
        file: {
          uri: formData.file.uri,
          name: formData.file.name,
          mime: formData.file.mime,
        },
      },
    });
    router.back();
  } catch (e:any) {
    Alert.alert('Error', e?.message ?? 'Upload failed');
  }
};

  const handleCancel = () => router.back();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Card style={styles.formCard}>
          <Text variant="headline" color="onSurface">Create New Document</Text>
          <Text variant="body" color="onSurfaceVariant">Document Information</Text>
          <Spacer size="md" />

          <Input
            label="Document Title"
            placeholder="Enter document title"
            value={formData.title}
            onChangeText={(value) => handleInputChange('title', value)}
          />

          <Input
            label="Description"
            placeholder="Brief description of the document"
            value={formData.description}
            onChangeText={(value) => handleInputChange('description', value)}
            multiline
            numberOfLines={3}
          />

          <Spacer size="md" />
          <Button
            title={formData.file ? `Selected: ${formData.file.name}` : 'Choose PDF File'}
            onPress={handlePickFile}
            variant="outline"
          />
        </Card>

        <Spacer size="lg" />
        <View style={styles.actions}>
          <Button
            title="Cancel"
            onPress={handleCancel}
            variant="outline"
            style={styles.actionButton}
          />
          <Spacer size="md" horizontal />
          <Button
            title="Upload"
            onPress={handleSave}
            variant="primary"
            style={styles.actionButton}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scrollView: { flex: 1 },
  content: { padding: theme.spacing.lg },
  formCard: { padding: theme.spacing.lg },
  actions: { flexDirection: 'row', justifyContent: 'space-between' },
  actionButton: { flex: 1 },
});
