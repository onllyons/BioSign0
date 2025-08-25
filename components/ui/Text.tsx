import React from 'react';
import { Text as RNText, TextStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export type TextVariant = 'title' | 'headline' | 'body' | 'caption';
export type TextColor = 'primary' | 'secondary' | 'error' | 'success' | 'onBackground' | 'onSurface' | 'onSurfaceVariant';

interface TextProps {
  children: React.ReactNode;
  variant?: TextVariant;
  color?: TextColor;
  style?: TextStyle;
  accessibilityLabel?: string;
  numberOfLines?: number;
}

export function Text({
  children,
  variant = 'body',
  color = 'onSurface',
  style,
  accessibilityLabel,
  numberOfLines,
}: TextProps) {
  const { theme } = useTheme();

  const getTextColor = () => {
    switch (color) {
      case 'primary':
        return theme.colors.primary;
      case 'secondary':
        return theme.colors.secondary;
      case 'error':
        return theme.colors.error;
      case 'success':
        return theme.colors.success;
      case 'onBackground':
        return theme.colors.onBackground;
      case 'onSurface':
        return theme.colors.onSurface;
      case 'onSurfaceVariant':
        return theme.colors.onSurfaceVariant;
      default:
        return theme.colors.onSurface;
    }
  };

  const getTypographyStyle = () => {
    switch (variant) {
      case 'title':
        return theme.typography.title;
      case 'headline':
        return theme.typography.headline;
      case 'body':
        return theme.typography.body;
      case 'caption':
        return theme.typography.caption;
      default:
        return theme.typography.body;
    }
  };

  const typographyStyle = getTypographyStyle();
  const textColor = getTextColor();

  return (
    <RNText
      style={[
        {
          fontSize: typographyStyle.fontSize,
          lineHeight: typographyStyle.lineHeight,
          fontWeight: typographyStyle.fontWeight,
          color: textColor,
        },
        style,
      ]}
      accessibilityLabel={accessibilityLabel}
      numberOfLines={numberOfLines}
    >
      {children}
    </RNText>
  );
}