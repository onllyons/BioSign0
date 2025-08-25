import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Text, Card, Button, Spacer } from '@/components/ui';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

export default function DocumentViewerScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const styles = createStyles(theme);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 3; // Mock total pages

  // Mock document data
  const document = {
    id: id as string,
    title: 'Employment Contract',
    totalPages: totalPages,
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
        <Text variant="headline" color="onSurface" style={styles.headerTitle}>
          {document.title}
        </Text>
        <View style={styles.headerSpacer} />
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Card style={styles.viewerCard}>
          <View style={styles.documentViewer}>
            <View style={styles.documentPage}>
              <Ionicons
                name="document-text"
                size={64}
                color={theme.colors.onSurfaceVariant}
              />
              <Spacer size="md" />
              <Text variant="headline" color="onSurface">
                Page {currentPage}
              </Text>
              <Spacer size="sm" />
              <Text variant="body" color="onSurfaceVariant" style={styles.pageContent}>
                This is a mock preview of page {currentPage} of the document. 
                In a real implementation, this would show the actual document content 
                or a rendered PDF page.
              </Text>
            </View>
          </View>
          
          <Spacer size="lg" />
          
          <View style={styles.pagination}>
            <View style={styles.paginationDots}>
              {Array.from({ length: totalPages }, (_, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dot,
                    currentPage === index + 1 && styles.activeDot,
                  ]}
                  onPress={() => setCurrentPage(index + 1)}
                />
              ))}
            </View>
            <Spacer size="md" />
            <Text variant="caption" color="onSurfaceVariant">
              Page {currentPage} of {totalPages}
            </Text>
          </View>
        </Card>
        
        <Spacer size="lg" />
        
        <View style={styles.controls}>
          <Button
            title="Previous"
            onPress={handlePreviousPage}
            variant="outline"
            style={styles.controlButton}
            disabled={currentPage === 1}
          />
          <Spacer size="md" horizontal />
          <Button
            title="Next"
            onPress={handleNextPage}
            variant="outline"
            style={styles.controlButton}
            disabled={currentPage === totalPages}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    marginHorizontal: theme.spacing.md,
  },
  headerSpacer: {
    width: 32, // Same width as close button
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
  },
  viewerCard: {
    padding: theme.spacing.lg,
  },
  documentViewer: {
    alignItems: 'center',
  },
  documentPage: {
    width: '100%',
    minHeight: 400,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  pageContent: {
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 24,
  },
  pagination: {
    alignItems: 'center',
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.outline,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: theme.colors.primary,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  controlButton: {
    flex: 1,
    maxWidth: 120,
  },
});