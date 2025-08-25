import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Text } from './Text';

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'error';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export function Badge({
  label,
  variant = 'primary',
  style,
  accessibilityLabel,
}: BadgeProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme, variant);

  return (
    <View
      style={[styles.badge, style]}
      accessibilityLabel={accessibilityLabel || label}
    >
      <Text variant="caption" style={styles.text}>
        {label}
      </Text>
    </View>
  );
}

const createStyles = (theme: any, variant: BadgeVariant) => {
  const getColors = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.colors.primaryContainer,
          textColor: theme.colors.onPrimaryContainer,
        };
      case 'secondary':
        return {
          backgroundColor: theme.colors.secondaryContainer,
          textColor: theme.colors.onSecondaryContainer,
        };
      case 'success':
        return {
          backgroundColor: theme.colors.successContainer,
          textColor: theme.colors.onSuccessContainer,
        };
      case 'error':
        return {
          backgroundColor: theme.colors.errorContainer,
          textColor: theme.colors.onErrorContainer,
        };
      default:
        return {
          backgroundColor: theme.colors.primaryContainer,
          textColor: theme.colors.onPrimaryContainer,
        };
    }
  };

  const colors = getColors();

  return StyleSheet.create({
    badge: {
      backgroundColor: colors.backgroundColor,
      borderRadius: theme.borderRadius.lg,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      alignSelf: 'flex-start',
      borderWidth: 1,
      borderColor: colors.backgroundColor,
    },
    text: {
      color: colors.textColor,
      fontWeight: '600',
    },
  });
};