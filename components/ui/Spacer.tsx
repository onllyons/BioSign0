import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export type SpacerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

interface SpacerProps {
  size?: SpacerSize | number;
  horizontal?: boolean;
  accessibilityLabel?: string;
}

export function Spacer({
  size = 'md',
  horizontal = false,
  accessibilityLabel,
}: SpacerProps) {
  const { theme } = useTheme();

  const getSpacerSize = () => {
    if (typeof size === 'number') return size;
    return theme.spacing[size];
  };

  const spacerSize = getSpacerSize();

  return (
    <View
      style={{
        ...(horizontal
          ? { width: spacerSize }
          : { height: spacerSize }),
      }}
      accessibilityLabel={accessibilityLabel}
    />
  );
}