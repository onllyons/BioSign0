import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

export type IconName = keyof typeof Ionicons.glyphMap;
export type IconSize = 'small' | 'medium' | 'large';
export type IconColor = 'primary' | 'secondary' | 'error' | 'success' | 'onBackground' | 'onSurface' | 'onSurfaceVariant';

interface IconProps {
  name: IconName;
  size?: IconSize | number;
  color?: IconColor | string;
  accessibilityLabel?: string;
}

export function Icon({
  name,
  size = 'medium',
  color = 'onSurface',
  accessibilityLabel,
}: IconProps) {
  const { theme } = useTheme();

  const getIconSize = () => {
    if (typeof size === 'number') return size;
    
    switch (size) {
      case 'small':
        return 16;
      case 'large':
        return 32;
      default:
        return 24;
    }
  };

  const getIconColor = () => {
    if (typeof color === 'string' && color.startsWith('#')) return color;
    
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

  return (
    <Ionicons
      name={name}
      size={getIconSize()}
      color={getIconColor()}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="image"
    />
  );
}