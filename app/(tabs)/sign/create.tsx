import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Text, Input, Button, Card, Spacer } from '@/components/ui';
import { useRouter } from 'expo-router';
import { useState } from 'react';

import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

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

const guessMimeFromName = (name = '') => {
  const ext = name.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf': return 'application/pdf';
    case 'png': return 'image/png';
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'webp': return 'image/webp';
    case 'doc': return 'application/msword';
    case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'xls': return 'application/vnd.ms-excel';
    case 'xlsx': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    default: return 'application/octet-stream';
  }
};

const MAX_BYTES = 20 * 1024 * 1024;

const handlePickPhoto = async () => {
  // 1) permisiuni
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission required', 'Please allow access to Photos.');
    return;
  }

  // 2) deschide galeria
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images, // doar imagini
    allowsEditing: false,
    quality: 1,
  });

  if (res.canceled) return;

  const asset = res.assets[0]; // { uri, fileName?, mimeType?, ... }
  const name = asset.fileName || asset.uri.split('/').pop() || 'image.jpg';
  const mime = asset.mimeType || guessMimeFromName(name);

  // dimensiune (dacă ai limită)
  let size = 0;
  try {
    const info = await FileSystem.getInfoAsync(asset.uri);
    if (info.exists && typeof info.size === 'number') size = info.size;
  } catch {}
  if (size && size > MAX_BYTES) {
    Alert.alert('File too large', 'Please choose an image up to 20 MB.');
    return;
  }

  setFormData(prev => ({ ...prev, file: { uri: asset.uri, name, mime } }));
  if (!formData.title) {
    const base = name.replace(/\.[^.]+$/,'');
    handleInputChange('title', base);
  }
};


const handlePickFile = async () => {
  const res = await DocumentPicker.getDocumentAsync({
    // Acceptă exact tipurile tale (poți folosi și DocumentPicker.types.allFiles)
    type: [
      'application/pdf',
      'image/*',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (res.canceled) return;

  const f = res.assets[0]; // { uri, name?, size?, mimeType? }
  // fallback-uri pentru nume/mime
  const name = f.name || f.uri.split('/').pop() || 'file';
  const mime = f.mimeType || guessMimeFromName(name);

  // (opțional) verifică dimensiunea reală (pe unele device-uri size lipsește)
  let size = f.size ?? 0;
  if (!size) {
    try {
      const info = await FileSystem.getInfoAsync(f.uri);
      if (info.exists && typeof info.size === 'number') size = info.size;
    } catch {}
  }
  if (size && size > MAX_BYTES) {
    Alert.alert('File too large', 'Please choose a file up to 20 MB.');
    return;
  }

  setFormData(prev => ({
    ...prev,
    file: { uri: f.uri, name, mime },
  }));

  // setează titlul fără extensie dacă e gol
  if (!formData.title) {
    const base = name.replace(/\.[^.]+$/,''); // taie ultima extensie
    handleInputChange('title', base);
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
            title={formData.file ? `Selected: ${formData.file.name}` : 'Choose File'}
            onPress={handlePickFile}
            variant="outline"
          />
          <Spacer size="sm" />
          <Button
            title="Choose Photo"
            onPress={handlePickPhoto}
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
