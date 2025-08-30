import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Text, Card, Badge, Spacer, Button, EmptyState, ErrorBanner } from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '@/contexts/DataContext';
import * as Updates from 'expo-updates';


type FilterType = 'all' | 'uploads' | 'signs' | 'views' | 'shares';

export default function ActivityScreen() {
  const { theme, simulateErrors } = useTheme();
  const { getRecentActivity, documents } = useData();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [activityError, setActivityError] = React.useState(false);
  const styles = createStyles(theme);

  // Get recent activity with document names
  const recentActivity = React.useMemo(() => {
    return getRecentActivity(50).map(activity => {
      const document = documents.find(doc => doc.id === (activity as any).documentId);
      return {
        ...activity,
        document: document?.name || 'Unknown Document',
      };
    });
  }, [getRecentActivity, documents]);

  React.useEffect(() => {
    setActivityError(simulateErrors);
  }, [simulateErrors]);

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

  const getBadgeVariant = (type: string) => {
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

  const filteredActivities = recentActivity.filter(activity => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'uploads') return activity.type === 'upload';
    if (activeFilter === 'signs') return activity.type === 'sign';
    if (activeFilter === 'views') return activity.type === 'view';
    if (activeFilter === 'shares') return activity.type === 'share';
    return true;
  });

  const handleExport = () => {
    // Disabled functionality - just show alert
  };

  const handleRetryActivity = () => {
    setActivityError(false);
    // In a real app, this would retry loading activity data
  };

  return (
    <View style={styles.container}>


    <View style={ { marginVertical: 20 }}>
      <Text style={{ fontSize: 10, color: 'black' }}>
        OTA: {Updates.updateId ?? 'No OTA'}
      </Text>
      <Text style={{ fontSize: 10, color: 'black' }}>
        Runtime: {Updates.runtimeVersion ?? 'n/a'}
      </Text>
      <Text style={{ fontSize: 10, color: 'black' }}>
        Channel: production
      </Text>

      <TouchableOpacity
        onPress={() => Updates.reloadAsync()}
        style={{ marginTop: 10 }}
      >
        <Text style={{ color: 'blue' }}>Restart the application</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={async () => {
          try {
            const update = await Updates.checkForUpdateAsync();
            if (update.isAvailable) {
              await Updates.fetchUpdateAsync();
              await Updates.reloadAsync();
            } else {
              alert('No new update available.');
            }
          } catch (error) {
            alert(`Error fetching latest Expo update: ${error}`);
          }
        }}
        style={{ marginTop: 10 }}
      >
        <Text style={{ color: 'blue' }}>Update the application</Text>
      </TouchableOpacity>
    </View>




    {/*
      <View style={styles.header}>
        <Text variant="title" color="onBackground" style={styles.title}>
          Activity Timeline
        </Text>
        <Text variant="body" color="onSurfaceVariant" style={styles.subtitle}>
          Track all document activities and changes
        </Text>
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
          <View style={styles.filters}>
            {[
              { key: 'all', label: 'All' },
              { key: 'uploads', label: 'Uploads' },
              { key: 'signs', label: 'Signs' },
              { key: 'views', label: 'Views' },
              { key: 'shares', label: 'Shares' },
            ].map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterButton,
                  activeFilter === filter.key && styles.activeFilterButton,
                ]}
                onPress={() => setActiveFilter(filter.key as FilterType)}
                accessibilityRole="button"
                accessibilityLabel={`Filter activities by ${filter.label.toLowerCase()}`}
                accessibilityState={{ selected: activeFilter === filter.key }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
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
          </View>
        </ScrollView>
      </View>

      {activityError && (
        <View style={styles.errorContainer}>
          <ErrorBanner
            title="Activity sync failed"
            message="Unable to load recent activity. Timeline may be incomplete."
            onRetry={handleRetryActivity}
            retryLabel="Reload"
          />
        </View>
      )}

      <View style={styles.exportContainer}>
        <Button
          title="Export Activity Log"
          onPress={handleExport}
          variant="outline"
          disabled={true}
          style={styles.exportButton}
        />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {filteredActivities.map((activity, index) => (
          <View key={activity.id} style={styles.activityItem}>
            <View style={styles.activityTimeline}>
              <View style={styles.timelineDot} />
              {index < filteredActivities.length - 1 && <View style={styles.timelineLine} />}
            </View>
            <Card style={styles.activityCard}>
              <View style={styles.activityHeader}>
                <View style={styles.activityIcon}>
                  <Ionicons
                    name={getActivityIcon(activity.type) as any}
                    size={20}
                    color={theme.colors[getActivityColor(activity.type) as keyof typeof theme.colors]}
                  />
                </View>
                <View style={styles.activityInfo}>
                  <View style={styles.activityTitleRow}>
                    <Text variant="body" color="onSurface" style={styles.activityTitle}>
                      {activity.document}
                    </Text>
                    <Badge
                      label={activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                      variant={getBadgeVariant(activity.type) as any}
                    />
                  </View>
                  <Spacer size="xs" />
                  <Text variant="caption" color="onSurfaceVariant">
                    {activity.description}
                  </Text>
                  <Spacer size="xs" />
                  <View style={styles.activityMeta}>
                    <Text variant="caption" color="onSurfaceVariant">
                      {new Date(activity.timestamp).toLocaleString()} • {activity.user} • {activity.device}
                    </Text>
                  </View>
                </View>
              </View>
            </Card>
          </View>
        ))}
        
        {filteredActivities.length === 0 && !activityError && (
          <EmptyState
            icon="time-outline"
            title="No Activities Found"
            description="No activities match the selected filter. Try selecting a different filter or check back later."
            style={styles.emptyState}
          />
        )}
      </ScrollView>
      */}
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xxl,
  },
  title: {
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    textAlign: 'center',
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
    gap: theme.spacing.sm,
  },
  filterButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surfaceVariant,
    minWidth: 60,
    alignItems: 'center',
  },
  activeFilterButton: {
    backgroundColor: theme.colors.primary,
  },
  filterText: {
    fontWeight: '600',
  },
  exportContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  exportButton: {
    width: '100%',
  },
  errorContainer: {
    paddingHorizontal: theme.spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  activityItem: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  activityTimeline: {
    alignItems: 'center',
    marginRight: theme.spacing.md,
    paddingTop: theme.spacing.md,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: theme.colors.outline,
    minHeight: 40,
  },
  activityCard: {
    flex: 1,
    padding: theme.spacing.md,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityTitle: {
    flex: 1,
    marginRight: theme.spacing.sm,
    fontWeight: '600',
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyState: {
    marginTop: theme.spacing.xl,
  },
});