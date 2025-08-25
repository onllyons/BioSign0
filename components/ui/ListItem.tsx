import React from 'react';
import { TouchableOpacity, View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Text } from './Text';
import { Icon, IconName } from './Icon';

interface ListItemProps {
  title: string;
  subtitle?: string;
  leftIcon?: IconName;
  rightIcon?: IconName;
  onPress?: () => void;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export function ListItem({
  title,
  subtitle,
  leftIcon,
  rightIcon = 'chevron-forward',
  onPress,
  style,
  accessibilityLabel,
}: ListItemProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      style={[styles.container, style]}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityState={onPress ? undefined : { disabled: false }}
      hitSlop={onPress ? { top: 8, bottom: 8, left: 8, right: 8 } : undefined}
    >
      {leftIcon && (
        <View style={styles.leftIcon}>
          <Icon
            name={leftIcon}
            size="medium"
            color="onSurfaceVariant"
            accessibilityLabel={`${title} icon`}
          />
        </View>
      )}
      <View style={styles.content}>
        <Text>
          {title}
        </Text>
        {subtitle && (
          <Text variant="caption" color="onSurfaceVariant" style={styles.subtitle}>
            {subtitle}
          </Text>
        )}
      </View>
      {onPress && rightIcon && (
        <Icon
          name={rightIcon}
          size="medium"
          color="onSurfaceVariant"
          accessibilityLabel="Navigate"
        />
      )}
    </Component>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    leftIcon: {
      marginRight: theme.spacing.md,
    },
    content: {
      flex: 1,
    },
    subtitle: {
      marginTop: theme.spacing.xs,
    },
  });