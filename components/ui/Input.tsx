import React, { useState } from 'react';
import { TextInput, View, StyleSheet, ViewStyle, TextInputProps } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Text } from './Text';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export function Input({
  label,
  error,
  style,
  accessibilityLabel,
  ...textInputProps
}: InputProps) {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const styles = createStyles(theme, isFocused, !!error);

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text variant="caption" color="onSurfaceVariant" style={styles.label}>
          {label}
        </Text>
      )}
      <TextInput
        style={styles.input}
        placeholderTextColor={theme.colors.onSurfaceVariant}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        accessibilityLabel={accessibilityLabel || label}
        accessibilityRole="text"
        accessibilityState={{ focused: isFocused }}
        {...textInputProps}
      />
      {error && (
        <Text variant="caption" color="error" style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  );
}

const createStyles = (theme: any, isFocused: boolean, hasError: boolean) =>
  StyleSheet.create({
    container: {
      marginBottom: theme.spacing.sm,
    },
    label: {
      marginBottom: theme.spacing.xs,
    },
    input: {
      borderWidth: 1,
      borderColor: hasError
        ? theme.colors.error
        : isFocused
        ? theme.colors.primary
        : theme.colors.outline,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      fontSize: theme.typography.body.fontSize,
      color: theme.colors.onSurface,
      backgroundColor: theme.colors.surface,
      shadowColor: isFocused ? theme.colors.primary : 'transparent',
      shadowOffset: {
        width: 0,
        height: isFocused ? 1 : 0,
      },
      shadowOpacity: isFocused ? 0.1 : 0,
      shadowRadius: isFocused ? 4 : 0,
      elevation: isFocused ? 1 : 0,
    },
    error: {
      marginTop: theme.spacing.xs,
    },
  });