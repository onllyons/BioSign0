import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Text, Card, Button, Spacer, Divider, ModalSheet, PressableButton } from '@/components/ui';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { useHaptics } from '@/hooks/useHaptics';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '@/contexts/DataContext';

export default function SignDocumentScreen() {
  const { theme } = useTheme();
  const { getDocumentById, signDocument } = useData();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const styles = createStyles(theme);
  const { triggerHaptic } = useHaptics();
  
  const [showSignModal, setShowSignModal] = useState(false);
  const [signStep, setSignStep] = useState(1); // 1: Summary, 2: Confirm, 3: Processing
  const [isProcessing, setIsProcessing] = useState(false);

  const document = getDocumentById(id as string);

  const handleStartSigning = () => {
    setShowSignModal(true);
    setSignStep(1);
  };

  const handleCloseSignModal = () => {
    setShowSignModal(false);
    setSignStep(1);
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Signing',
      'Are you sure you want to cancel the signing process?',
      [
        { text: 'Continue Signing', style: 'cancel' },
        {
          text: 'Cancel',
          style: 'destructive',
          onPress: () => router.back(),
        },
      ]
    );
  };

  const handleNextStep = () => {
    triggerHaptic('medium');
    if (signStep === 1) {
      setSignStep(2);
    } else if (signStep === 2) {
      setSignStep(3);
      setIsProcessing(true);
      triggerHaptic('heavy');
      
      // Mock processing delay
      setTimeout(() => {
        setIsProcessing(false);
        setShowSignModal(false);
        setSignStep(1);
        
        // Sign the document
        if (document) {
          signDocument(document.id, 'John Doe');
        }
        triggerHaptic('success');
        
        Alert.alert(
          'Document Signed',
          'The document has been successfully signed.',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      }, 2000);
    }
  };

  if (!document) {
    return (
      <View style={styles.container}>
        <Text variant="headline" color="error">Document not found</Text>
      </View>
    );
  }

  const handlePreviousStep = () => {
    if (signStep === 2) {
      setSignStep(1);
    }
  };

  const renderSignModalContent = () => {
    if (signStep === 1) {
      // Step 1: Summary
      return (
        <View>
          <Text variant="headline" color="onSurface" style={styles.modalTitle}>
            Document Summary
          </Text>
          <Spacer size="lg" />
          <View style={styles.summaryItem}>
            <Text variant="body" color="onSurfaceVariant">Document:</Text>
            <Text variant="body" color="onSurface">{document.name}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text variant="body" color="onSurfaceVariant">Date:</Text>
            <Text variant="body" color="onSurface">{new Date().toLocaleDateString()}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text variant="body" color="onSurfaceVariant">Type:</Text>
            <Text variant="body" color="onSurface">Digital Signature</Text>
          </View>
          <Spacer size="xl" />
          <Text variant="body" color="onSurfaceVariant" style={styles.summaryNote}>
            Please review the document details before proceeding to sign.
          </Text>
          <Spacer size="xl" />
          <View style={styles.modalActions}>
            <Button
              title="Cancel"
              onPress={handleCloseSignModal}
              variant="outline"
              style={styles.modalButton}
            />
            <Spacer size="md" horizontal />
            <Button
              title="Continue"
              onPress={handleNextStep}
              variant="primary"
              style={styles.modalButton}
            />
          </View>
        </View>
      );
    } else if (signStep === 2) {
      // Step 2: Confirm
      return (
        <View>
          <Text variant="headline" color="onSurface" style={styles.modalTitle}>
            Confirm Signing
          </Text>
          <Spacer size="lg" />
          <View style={styles.confirmContainer}>
            <View style={styles.signIcon}>
              <Ionicons name="document-text" size={48} color={theme.colors.primary} />
            </View>
            <Spacer size="lg" />
            <Text variant="body" color="onSurface" style={styles.confirmText}>
              You are about to digitally sign "{document.name}". This action cannot be undone.
            </Text>
            <Spacer size="md" />
            <Text variant="caption" color="onSurfaceVariant" style={styles.confirmNote}>
              By proceeding, you agree that your digital signature has the same legal validity as a handwritten signature.
            </Text>
          </View>
          <Spacer size="xl" />
          <View style={styles.modalActions}>
            <Button
              title="Back"
              onPress={handlePreviousStep}
              variant="outline"
              style={styles.modalButton}
            />
            <Spacer size="md" horizontal />
            <PressableButton
              title="Sign Document"
              onPress={handleNextStep}
              variant="primary"
              style={styles.modalButton}
              accessibilityLabel="Confirm and sign document"
              testID="sign-confirm-button"
            />
          </View>
        </View>
      );
    } else if (signStep === 3) {
      // Step 3: Processing
      return (
        <View>
          <Text variant="headline" color="onSurface" style={styles.modalTitle}>
            Processing Signature
          </Text>
          <Spacer size="xl" />
          <View style={styles.processingContainer}>
            <View style={styles.processingIcon}>
              <Ionicons name="checkmark-circle" size={64} color={theme.colors.success} />
            </View>
            <Spacer size="lg" />
            <Text variant="body" color="onSurface" style={styles.processingText}>
              {isProcessing ? 'Processing your signature...' : 'Signature completed!'}
            </Text>
            {isProcessing && (
              <>
                <Spacer size="md" />
                <View style={styles.processingBar}>
                  <View style={styles.processingBarFill} />
                </View>
              </>
            )}
          </View>
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Card style={styles.documentCard}>
          <Text variant="headline" color="onSurface" style={styles.documentTitle}>
            {document.name}
          </Text>
          <Spacer size="md" />
          <Divider />
          <Spacer size="md" />
          <Text variant="body" color="onSurface" style={styles.documentContent}>
            {document.content}
          </Text>
        </Card>
        <Spacer size="xl" />
        <View style={styles.actions}>
          <Button
            title="Cancel"
            onPress={handleCancel}
            variant="outline"
            style={styles.cancelButton}
          />
          <Spacer size="md" horizontal />
          <Button
            title="Sign Document"
            onPress={handleStartSigning}
            variant="primary"
            style={styles.signButton}
          />
        </View>
      </ScrollView>
      
      <ModalSheet
        visible={showSignModal}
        onClose={signStep === 3 ? undefined : handleCloseSignModal}
        title=""
      >
        {renderSignModalContent()}
      </ModalSheet>
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
  documentCard: {
    padding: theme.spacing.lg,
  },
  documentTitle: {
    textAlign: 'center',
  },
  documentContent: {
    lineHeight: 24,
  },
  actions: {
    flexDirection: 'row',
    marginBottom: theme.spacing.xl,
  },
  cancelButton: {
    flex: 1,
  },
  signButton: {
    flex: 2,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
    marginBottom: theme.spacing.sm,
  },
  summaryNote: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
  },
  confirmContainer: {
    alignItems: 'center',
  },
  signIcon: {
    width: 100,
    height: 100,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmText: {
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 24,
  },
  confirmNote: {
    textAlign: 'center',
    fontStyle: 'italic',
    maxWidth: 300,
  },
  processingContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  processingIcon: {
    marginBottom: theme.spacing.md,
  },
  processingText: {
    textAlign: 'center',
    fontSize: theme.typography.headline.fontSize,
  },
  processingBar: {
    width: 200,
    height: 4,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  processingBarFill: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    transform: [{ scaleX: 1 }],
    transformOrigin: 'left',
  },
});