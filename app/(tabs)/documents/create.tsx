import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Text, Input, Button, Card, Spacer } from '@/components/ui';
import { useRouter } from 'expo-router';
import { useState } from 'react';

export default function CreateDocumentScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const styles = createStyles(theme);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    content: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a document title');
      return;
    }

    // Mock save action
    Alert.alert(
      'Success',
      'Document created successfully!',
      [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]
    );
  };

  const handleCancel = () => {
    router.back();
  };

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
            accessibilityLabel="Document title input"
          />
          <Input
            label="Document Type"
            placeholder="e.g., Contract, Agreement, Proposal"
            value={formData.type}
            onChangeText={(value) => handleInputChange('type', value)}
            accessibilityLabel="Document type input"
          />
          <Input
            label="Description"
            placeholder="Brief description of the document"
            value={formData.description}
            onChangeText={(value) => handleInputChange('description', value)}
            multiline
            numberOfLines={3}
            accessibilityLabel="Document description input"
          />
          <Input
            label="Content"
            placeholder="Document content or notes"
            value={formData.content}
            onChangeText={(value) => handleInputChange('content', value)}
            multiline
            numberOfLines={6}
            accessibilityLabel="Document content input"
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
            title="Create Document"
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
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
  },
  formCard: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    marginBottom: theme.spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
  },
});