import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Text, Card, Badge, Button, Spacer, Divider, Input, ModalSheet } from '@/components/ui';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '@/contexts/DataContext';

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'upload':
      return 'cloud-upload-outline';
    case 'view':
      return 'eye-outline';
    case 'sign':
      return 'create-outline';
    case 'share':
      return 'share-outline';
    case 'delete':
      return 'trash-outline';
    default:
      return 'document-outline';
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case 'upload':
      return 'primary';
    case 'view':
      return 'secondary';
    case 'sign':
      return 'success';
    case 'share':
      return 'primary';
    case 'delete':
      return 'error';
    default:
      return 'secondary';
  }
};

export default function DocumentDetailScreen() {
  const { theme } = useTheme();
  const { getDocumentById, shareDocument, logEvent } = useData();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareData, setShareData] = useState({
    email: '',
    message: '',
  });
  const [showToast, setShowToast] = useState(false);
  const styles = createStyles(theme);

  const document = getDocumentById(id as string);

  if (!document) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text variant="headline" color="error">
            Document Not Found
          </Text>
          <Spacer size="sm" />
          <Text variant="body" color="onSurfaceVariant">
            The requested document could not be found.
          </Text>
        </View>
      </View>
    );
  }

  const getStatusBadgeVariant = (status: string, signed: boolean) => {
    switch (status) {
      case 'signed':
        return 'success';
      case 'pending':
        return 'primary';
      case 'draft':
        return 'secondary';
      case signed:
        return 'success';
      default:
        return 'secondary';
    }
  };

  const handleSignDocument = () => {
    if (!document.signed && document.status === 'pending') {
      router.push(`/documents/sign/${document.id}`);
    } else {
      Alert.alert('Info', 'This document has already been signed.');
    }
  };

  const handleEditDocument = () => {
    Alert.alert('Edit Document', 'Edit functionality would be implemented here.');
  };

  const handleDeleteDocument = () => {
    Alert.alert(
      'Delete Document',
      'Are you sure you want to delete this document?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Deleted', 'Document deleted successfully!', [
              { text: 'OK', onPress: () => router.back() },
            ]);
          },
        },
      ]
    );
  };

  const handleOpenDocument = () => {
    router.push(`/documents/viewer/${document.id}`);
  };

  const handleShareDocument = () => {
    setShowShareModal(true);
  };

  const handleCloseShareModal = () => {
    setShowShareModal(false);
    setShareData({ email: '', message: '' });
  };

  const handleShareInputChange = (field: string, value: string) => {
    setShareData(prev => ({ ...prev, [field]: value }));
  };

  const handleSendShare = () => {
    if (!shareData.email.trim()) {
      Alert.alert('Error', 'Please enter a recipient email address');
      return;
    }

    shareDocument(document.id, shareData.email, shareData.message);
    setShowShareModal(false);
    setShareData({ email: '', message: '' });
    
    // Show success toast
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleDownloadDocument = () => {
    Alert.alert('Download Document', 'Download functionality would be implemented here.');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Card style={styles.previewCard}>
          <Text variant="headline" color="onSurface" style={styles.sectionTitle}>
            Preview
          </Text>
          <Spacer size="md" />
          <View style={styles.previewContainer}>
            <View style={styles.previewPlaceholder}>
              <Ionicons
                name="document-text-outline"
                size={48}
                color={theme.colors.onSurfaceVariant}
              />
              <Spacer size="sm" />
              <Text variant="caption" color="onSurfaceVariant">
                PDF Preview
              </Text>
            </View>
          </View>
        </Card>
        <Spacer size="lg" />
        <Card style={styles.headerCard}>
          <View style={styles.documentHeader}>
            <View style={styles.titleSection}>
              <Text variant="title" color="onSurface" numberOfLines={2}>
                {document.name}
              </Text>
              <Spacer size="sm" />
              <View style={styles.metaRow}>
                <Badge
                  label={document.signed ? 'signed' : document.status}
                  variant={getStatusBadgeVariant(document.status, document.signed)}
                />
                <Spacer size="sm" horizontal />
                <Text variant="caption" color="onSurfaceVariant">
                  {document.type}
                </Text>
              </View>
            </View>
          </View>
        </Card>
        <Spacer size="lg" />
        <Card style={styles.detailsCard}>
          <Text variant="headline" color="onSurface" style={styles.sectionTitle}>
            Details
          </Text>
          <Spacer size="md" />
          <View style={styles.detailRow}>
            <Text variant="body" color="onSurfaceVariant" style={styles.detailLabel}>
              Created:
            </Text>
            <Text variant="body" color="onSurface">
              {new Date(document.createdAt).toLocaleDateString()}
            </Text>
          </View>
          {document.signedAt && (
            <View style={styles.detailRow}>
              <Text variant="body" color="onSurfaceVariant" style={styles.detailLabel}>
                Signed:
              </Text>
              <Text variant="body" color="onSurface">
                {new Date(document.signedAt).toLocaleDateString()}
              </Text>
            </View>
          )}
          {document.signedBy && (
            <View style={styles.detailRow}>
              <Text variant="body" color="onSurfaceVariant" style={styles.detailLabel}>
                Signed by:
              </Text>
              <Text variant="body" color="onSurface">
                {document.signedBy}
              </Text>
            </View>
          )}
          <Spacer size="md" />
          <Divider />
          <Spacer size="md" />
          <Text variant="body" color="onSurfaceVariant" style={styles.descriptionLabel}>
            Description:
          </Text>
          <Spacer size="xs" />
          <Text variant="body" color="onSurface">
            {document.description}
          </Text>
          <Spacer size="md" />
          <Text variant="body" color="onSurfaceVariant" style={styles.descriptionLabel}>
            Content:
          </Text>
          <Spacer size="xs" />
          <Text variant="body" color="onSurface">
            {document.content}
          </Text>
        </Card>
        <Spacer size="lg" />
        <Card style={styles.activityCard}>
          <Text variant="headline" color="onSurface" style={styles.sectionTitle}>
            Recent Activity
          </Text>
          <Spacer size="md" />
          {document.activity.slice(0, 3).map((activity, index) => (
            <View key={activity.id} style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons
                  name={getActivityIcon(activity.type) as any}
                  size={16}
                  color={theme.colors[getActivityColor(activity.type) as keyof typeof theme.colors]}
                />
              </View>
              <View style={styles.activityContent}>
                <Text variant="body" color="onSurface" style={styles.activityDescription}>
                  {activity.description}
                </Text>
                <Text variant="caption" color="onSurfaceVariant">
                  {new Date(activity.timestamp).toLocaleString()} • {activity.device}
                </Text>
              </View>
            </View>
          ))}
          {document.activity.length === 0 && (
            <Text variant="body" color="onSurfaceVariant" style={styles.noActivity}>
              No recent activity for this document.
            </Text>
          )}
        </Card>
        <Spacer size="lg" />
        <View style={styles.actions}>
          <Button
            title="Open"
            onPress={handleOpenDocument}
            variant="primary"
            style={styles.primaryAction}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          />
          <Spacer size="md" />
          <View style={styles.actionGrid}>
            {!document.signed && document.status === 'pending' && (
              <Button
                title="Sign"
                onPress={handleSignDocument}
                variant="outline"
                style={styles.gridAction}
              />
            )}
            <Button
              title="Share"
              onPress={handleShareDocument}
              variant="outline"
              style={styles.gridAction}
            />
            <Button
              title="Download"
              onPress={handleDownloadDocument}
              variant="outline"
              style={styles.gridAction}
            />
            <Button
              title="Delete"
              onPress={handleDeleteDocument}
              variant="outline"
              style={styles.gridAction}
            />
          </View>
        </View>
      </ScrollView>
      
      {/* Share Modal */}
      <ModalSheet
        visible={showShareModal}
        onClose={handleCloseShareModal}
        title="Share Document"
      >
        <View style={styles.shareModalContent}>
          <Text variant="body" color="onSurface" style={styles.shareDescription}>
            Share "{document.name}" with others via email.
          </Text>
          <Spacer size="lg" />
          
          <Input
            label="Recipient Email *"
            placeholder="Enter email address"
            value={shareData.email}
            onChangeText={(value) => handleShareInputChange('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
            accessibilityLabel="Recipient email input"
          />
          
          <Input
            label="Message (Optional)"
            placeholder="Add a personal message..."
            value={shareData.message}
            onChangeText={(value) => handleShareInputChange('message', value)}
            multiline
            numberOfLines={4}
            accessibilityLabel="Share message input"
          />
          
          <Spacer size="xl" />
          
          <View style={styles.shareModalActions}>
            <Button
              title="Cancel"
              onPress={handleCloseShareModal}
              variant="outline"
              style={styles.shareModalButton}
            />
            <Spacer size="md" horizontal />
            <Button
              title="Send"
              onPress={handleSendShare}
              variant="primary"
              style={styles.shareModalButton}
            />
          </View>
        </View>
      </ModalSheet>
      
      {/* Success Toast */}
      {showToast && (
        <View style={styles.toast}>
          <View style={styles.toastContent}>
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.onSuccess} />
            <Spacer size="sm" horizontal />
            <Text variant="body" color="onSuccess">
              Document shared successfully!
            </Text>
          </View>
        </View>
      )}
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
  previewCard: {
    padding: theme.spacing.lg,
  },
  previewContainer: {
    alignItems: 'center',
  },
  previewPlaceholder: {
    width: 200,
    height: 260,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.outline,
    borderStyle: 'dashed',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  headerCard: {
    padding: theme.spacing.lg,
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleSection: {
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsCard: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    marginBottom: theme.spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  detailLabel: {
    minWidth: 80,
  },
  descriptionLabel: {
    fontWeight: '600',
  },
  actions: {
    marginBottom: theme.spacing.xl,
  },
  primaryAction: {
    width: '100%',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridAction: {
    width: '48%',
    marginBottom: theme.spacing.sm,
  },
  activityCard: {
    padding: theme.spacing.lg,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityDescription: {
    marginBottom: theme.spacing.xs,
  },
  noActivity: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
  shareModalContent: {
    paddingVertical: theme.spacing.md,
  },
  shareDescription: {
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  shareModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  shareModalButton: {
    flex: 1,
  },
  toast: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    backgroundColor: theme.colors.successContainer,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.success,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});