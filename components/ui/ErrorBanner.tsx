import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Text } from './Text';
import { Button } from './Button';
import { Icon } from './Icon';
import { Spacer } from './Spacer';

interface ErrorBannerProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export function ErrorBanner({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try Again',
  style,
  accessibilityLabel,
}: ErrorBannerProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View
      style={[styles.container, style]}
      accessibilityLabel={accessibilityLabel || `Error: ${message}`}
    >
      <View style={styles.content}>
        <Icon
          name="warning"
          size="medium"
          color="error"
          accessibilityLabel="Error icon"
        />
        <Spacer size="md" horizontal />
        <View style={styles.textContent}>
          <Text variant="body" color="error" style={styles.title}>
            {title}
          </Text>
          <Text variant="caption" color="onErrorContainer" style={styles.message}>
            {message}
          </Text>
        </View>
        {onRetry && (
          <>
            <Spacer size="md" horizontal />
            <Button
              title={retryLabel}
              onPress={onRetry}
              variant="outline"
              size="small"
              accessibilityLabel={`${retryLabel} - retry the failed operation`}
            />
          </>
        )}
      </View>
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.errorContainer,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginVertical: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.error,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    textContent: {
      flex: 1,
    },
    title: {
      fontWeight: '600',
      marginBottom: theme.spacing.xs,
    },
    message: {
      lineHeight: 18,
    },
  });