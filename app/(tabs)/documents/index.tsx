import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Animated, RefreshControl } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Text, Card, Badge, EmptyState, Spacer, Icon, Button, ModalSheet, ErrorBanner, Input, SkeletonCard, PressableButton } from '@/components/ui';
import { useRouter } from 'expo-router';
import { useHaptics } from '@/hooks/useHaptics';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '@/contexts/DataContext';

type FilterType = 'all' | 'signed' | 'unsigned';
type SortType = 'name' | 'date' | 'size';

export default function DocumentsScreen() {
  const { theme, simulateErrors } = useTheme();
  const { documents, addDocument, logEvent } = useData();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('date');
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { triggerHaptic } = useHaptics();
  const progressAnim = useRef(new Animated.Value(0)).current;
  const toastAnim = useRef(new Animated.Value(0)).current;
  const styles = createStyles(theme);

  // Mock files for picker
  const mockFiles = [
    {
      id: 'file1',
      name: 'Offer.pdf',
      size: '2.4 MB',
      sizeBytes: 2400000,
      date: '2024-01-20',
      type: 'PDF Document',
    },
    {
      id: 'file2',
      name: 'Contract_v2.pdf',
      size: '1.8 MB',
      sizeBytes: 1800000,
      date: '2024-01-19',
      type: 'PDF Document',
    },
    {
      id: 'file3',
      name: 'Scan_001.jpg',
      size: '3.2 MB',
      sizeBytes: 3200000,
      date: '2024-01-18',
      type: 'Image',
    },
    {
      id: 'file4',
      name: 'Agreement_Draft.docx',
      size: '1.1 MB',
      sizeBytes: 1100000,
      date: '2024-01-17',
      type: 'Word Document',
    },
  ];

  // Filter and sort documents
  const filteredAndSortedDocuments = React.useMemo(() => {
    let filtered = documents;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (activeFilter === 'signed') {
      filtered = filtered.filter(doc => doc.signed);
    } else if (activeFilter === 'unsigned') {
      filtered = filtered.filter(doc => !doc.signed);
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'size':
          return (b.sizeBytes || 0) - (a.sizeBytes || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [documents, searchQuery, activeFilter, sortBy]);

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

  const handleDocumentPress = (id: string) => {
    router.push(`/documents/${id}`);
  };

  const handleCreateDocument = () => {
    router.push('/documents/create');
  };

  const handleUpload = () => {
    setShowFilePicker(true);
  };

  const handleFileSelect = (file: typeof mockFiles[0]) => {
    setShowFilePicker(false);
    setShowProgress(true);
    
    // Reset progress
    progressAnim.setValue(0);
    
    // Animate progress from 0 to 100% over 1.2 seconds
    Animated.timing(progressAnim, {
      toValue: 100,
      duration: 1200,
      useNativeDriver: false,
    }).start(() => {
      // Add new document to the list
      const documentId = addDocument({
        name: file.name,
        type: 'Upload',
        size: file.size,
        sizeBytes: file.sizeBytes,
        signed: false,
        status: 'draft',
        description: `Uploaded file: ${file.name}`,
        content: `This document was uploaded from ${file.name}`,
      });

      setShowProgress(false);
      triggerHaptic('success');
      
      // Show toast
      setShowToast(true);
      toastAnim.setValue(0);
      Animated.sequence([
        Animated.timing(toastAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(toastAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowToast(false);
      });
    });
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    triggerHaptic('light');
    
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  // Simulate error state based on settings toggle
  React.useEffect(() => {
    setHasError(simulateErrors);
  }, [simulateErrors]);

  const handleRefresh = () => {
    setRefreshing(true);
    triggerHaptic('light');
    
    // Simulate refresh by reordering documents
    setTimeout(() => {      
      setRefreshing(false);
      triggerHaptic('success');
    }, 1000);
  };

  const handleFilterPress = (filter: FilterType) => {
    triggerHaptic('light');
    setActiveFilter(filter);
  };

  const handleSortPress = (sort: SortType) => {
    triggerHaptic('light');
    setSortBy(sort);
  };

  if (documents.length === 0 && !searchQuery && activeFilter === 'all') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <PressableButton
            title="Upload Document 123"
            onPress={handleUpload}
            variant="primary"
            style={styles.uploadButton}
            testID="upload-document-button"
          />
        </View>
        {hasError && (
          <View style={styles.errorContainer}>
            <ErrorBanner
              title="Failed to load documents"
              message="Unable to fetch your documents. Please check your connection and try again."
              onRetry={handleRetry}
            />
          </View>
        )}
        <EmptyState
          icon="document-text-outline"
          title="No Documents"
          description="You haven't created any documents yet. Start by creating your first document."
          actionLabel="Create Document"
          onAction={handleCreateDocument}
        />
        <ModalSheet
          visible={showFilePicker}
          onClose={() => setShowFilePicker(false)}
          title="Select File to Upload"
        >
          <View style={styles.fileList}>
            {mockFiles.map((file) => (
              <TouchableOpacity
                key={file.id}
                style={styles.fileItem}
                onPress={() => handleFileSelect(file)}
              >
                <View style={styles.fileInfo}>
                  <Text variant="body" color="onSurface">
                    {file.name}
                  </Text>
                  <Text variant="caption" color="onSurfaceVariant">
                    {file.type} • {file.size} • {file.date}
                  </Text>
                </View>
                <Text variant="body" color="primary" style={styles.selectText}>
                  Select
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ModalSheet>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>

        <Text variant="title" color="onBackground" style={styles.title}>
          Upload your documents
        </Text>

        <PressableButton
          title="Upload Document 432"
          onPress={handleUpload}
          variant="primary"
          style={styles.uploadButton}
          accessibilityLabel="Upload new document"
          testID="upload-document-button"
        />
        <Ionicons
          name="cloud-upload-outline"
          size={20}
          color={theme.colors.onPrimary}
          style={styles.uploadIcon}
          accessibilityElementsHidden={true}
        />
      </View>
      
      {hasError && (
        <View style={styles.errorContainer}>
          <ErrorBanner
            title="Sync failed"
            message="Some documents may not be up to date. Check your connection."
            onRetry={handleRetry}
            retryLabel="Refresh"
          />
        </View>
      )}
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Input
          placeholder="Search documents..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
      </View>
      
      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
          <View style={styles.filters}>
            <Text variant="caption" color="onSurfaceVariant" style={styles.filterLabel}>
              Filter:
            </Text>
            {[
              { key: 'all', label: 'All' },
              { key: 'signed', label: 'Signed' },
              { key: 'unsigned', label: 'Unsigned' },
            ].map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterButton,
                  activeFilter === filter.key && styles.activeFilterButton,
                ]}
                onPress={() => handleFilterPress(filter.key as FilterType)}
                accessibilityRole="button"
                accessibilityLabel={`Filter by ${filter.label.toLowerCase()} documents`}
                accessibilityState={{ selected: activeFilter === filter.key }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                testID={`filter-${filter.key}`}
              >
                <Text
                  variant="caption"
                  color={activeFilter === filter.key ? 'onPrimary' : 'onSurfaceVariant'}
                  style={styles.filterText}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
            <View style={styles.filterSeparator} />
            <Text variant="caption" color="onSurfaceVariant" style={styles.filterLabel}>
              Sort:
            </Text>
            {[
              { key: 'date', label: 'Date' },
              { key: 'name', label: 'Name' },
              { key: 'size', label: 'Size' },
            ].map((sort) => (
              <TouchableOpacity
                key={sort.key}
                style={[
                  styles.filterButton,
                  sortBy === sort.key && styles.activeFilterButton,
                ]}
                onPress={() => handleSortPress(sort.key as SortType)}
                accessibilityRole="button"
                accessibilityLabel={`Sort by ${sort.label.toLowerCase()}`}
                accessibilityState={{ selected: sortBy === sort.key }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                testID={`sort-${sort.key}`}
              >
                <Text
                  variant="caption"
                  color={sortBy === sort.key ? 'onPrimary' : 'onSurfaceVariant'}
                  style={styles.filterText}
                >
                  {sort.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
      
      {showProgress && (
        <View style={styles.progressContainer}>
          <Text variant="caption" color="onSurfaceVariant" style={styles.progressText}>
            Uploading document...
          </Text>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                { width: progressWidth },
              ]}
            />
          </View>
        </View>
      )}
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        {isLoading && (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}
        
        {filteredAndSortedDocuments.length === 0 ? (
          <EmptyState
            icon="search-outline"
            title="No Documents Found"
            description={
              searchQuery
                ? `No documents match "${searchQuery}"`
                : activeFilter !== 'all'
                ? `No ${activeFilter} documents found`
                : 'No documents available'
            }
            style={styles.emptyState}
          />
        ) : !isLoading && (
          filteredAndSortedDocuments.map((document) => (
          <TouchableOpacity
            key={document.id}
            onPress={() => handleDocumentPress(document.id)}
            accessibilityRole="button"
            accessibilityLabel={`Open ${document.title}`}
          >
            <Card style={styles.documentCard}>
              <View style={styles.documentHeader}>
                <View style={styles.documentInfo}>
                  <Text variant="headline" color="onSurface" numberOfLines={1}>
                    {document.name}
                  </Text>
                  <Spacer size="xs" />
                  <Text variant="caption" color="onSurfaceVariant">
                    {document.type} • {new Date(document.createdAt).toLocaleDateString()} • {document.size}
                  </Text>
                </View>
                <View style={styles.documentActions}>
                  <Badge
                    label={document.signed ? 'signed' : document.status}
                    variant={getStatusBadgeVariant(document.status, document.signed)}
                  />
                  <Spacer size="sm" horizontal />
                  <Icon
                    name="chevron-forward"
                    size="medium"
                    color="onSurfaceVariant"
                  />
                </View>
              </View>
            </Card>
          </TouchableOpacity>
          ))
        )}
      </ScrollView>
      
      <ModalSheet
        visible={showFilePicker}
        onClose={() => setShowFilePicker(false)}
        title="Select File to Upload"
      >
        <View style={styles.fileList}>
          {mockFiles.map((file) => (
            <TouchableOpacity
              key={file.id}
              style={styles.fileItem}
              onPress={() => handleFileSelect(file)}
            >
              <View style={styles.fileInfo}>
                <Text variant="body" color="onSurface">
                  {file.name}
                </Text>
                <Text variant="caption" color="onSurfaceVariant">
                  {file.type} • {file.size} • {file.date}
                </Text>
              </View>
              <Text variant="body" color="primary" style={styles.selectText}>
                Select
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ModalSheet>
      
      {showToast && (
        <Animated.View
          style={[
            styles.toast,
            {
              opacity: toastAnim,
              transform: [{ translateY: toastAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              })}],
            },
          ]}
        >
          <Text variant="body" color="onSuccess">
            Document added successfully!
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    position: 'relative',
    paddingTop: theme.spacing.xxl + theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  title: {
    marginBottom: theme.spacing.md,
  },
  uploadButton: {
    width: '100%',
  },
  uploadIcon: {
    position: 'absolute',
    right: theme.spacing.xl,
    top: theme.spacing.lg + theme.spacing.md,
  },
  errorContainer: {
    paddingHorizontal: theme.spacing.lg,
  },
  searchContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  searchInput: {
    marginBottom: 0,
  },
  filtersContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  filtersScroll: {
    flexGrow: 0,
  },
  filters: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  filterLabel: {
    fontWeight: '600',
    marginRight: theme.spacing.xs,
  },
  filterButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surfaceVariant,
    minWidth: 80,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  activeFilterButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterText: {
    fontWeight: '600',
  },
  filterSeparator: {
    width: 1,
    height: 20,
    backgroundColor: theme.colors.outline,
    marginHorizontal: theme.spacing.sm,
  },
  progressContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  progressText: {
    marginBottom: theme.spacing.xs,
  },
  progressBar: {
    height: 4,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  documentCard: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  documentInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  documentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileList: {
    paddingVertical: theme.spacing.sm,
  },
  fileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.sm,
  },
  fileInfo: {
    flex: 1,
  },
  selectText: {
    fontWeight: '600',
  },
  emptyState: {
    marginTop: theme.spacing.xl,
  },
  toast: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    backgroundColor: theme.colors.successContainer,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.successContainer,
  },
});