import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Text } from './Text';
import { Icon, IconName } from './Icon';
import { Button } from './Button';
import { Spacer } from './Spacer';

interface EmptyStateProps {
  icon?: IconName;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export function EmptyState({
  icon = 'document-outline',
  title,
  description,
  actionLabel,
  onAction,
  style,
  accessibilityLabel,
}: EmptyStateProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View
      style={[styles.container, style]}
      accessibilityLabel={accessibilityLabel || `Empty state: ${title}`}
    >
      <Icon
        name={icon}
        size="large"
        color="onSurfaceVariant"
        accessibilityLabel={`${title} icon`}
      />
      <Spacer size="md" />
      <Text variant="headline" color="onSurface" style={styles.title}>
        {title}
      </Text>
      {description && (
        <>
          <Spacer size="sm" />
          <Text variant="body" color="onSurfaceVariant" style={styles.description}>
            {description}
          </Text>
        </>
      )}
      {actionLabel && onAction && (
        <>
          <Spacer size="lg" />
          <Button
            title={actionLabel}
            onPress={onAction}
            variant="primary"
            accessibilityLabel={actionLabel}
          />
        </>
      )}
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    title: {
      textAlign: 'center',
    },
    description: {
      textAlign: 'center',
      maxWidth: 280,
    },
  });