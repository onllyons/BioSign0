import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export function Divider({
  orientation = 'horizontal',
  style,
  accessibilityLabel,
}: DividerProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme, orientation);

  return (
    <View
      style={[styles.divider, style]}
      accessibilityLabel={accessibilityLabel || 'Divider'}
      accessibilityRole="separator"
    />
  );
}

const createStyles = (theme: any, orientation: 'horizontal' | 'vertical') =>
  StyleSheet.create({
    divider: {
      backgroundColor: theme.colors.outline,
      opacity: 0.6,
      ...(orientation === 'horizontal'
        ? {
            height: 1,
            width: '100%',
          }
        : {
            width: 1,
            height: '100%',
          }),
    },
  });