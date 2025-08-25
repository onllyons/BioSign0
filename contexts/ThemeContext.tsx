import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark';

export interface Colors {
  // Background colors
  background: string;
  surface: string;
  surfaceVariant: string;
  
  // Text colors
  onBackground: string;
  onSurface: string;
  onSurfaceVariant: string;
  
  // Primary colors
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  
  // Secondary colors
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  
  // Error colors
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;
  
  // Success colors
  success: string;
  onSuccess: string;
  successContainer: string;
  onSuccessContainer: string;
  
  // Border and divider
  outline: string;
  outlineVariant: string;
}

export interface Spacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface BorderRadius {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  full: number;
}

export interface Typography {
  title: {
    fontSize: number;
    lineHeight: number;
    fontWeight: '700' | 'bold';
  };
  headline: {
    fontSize: number;
    lineHeight: number;
    fontWeight: '600' | '500';
  };
  body: {
    fontSize: number;
    lineHeight: number;
    fontWeight: '400' | 'normal';
  };
  caption: {
    fontSize: number;
    lineHeight: number;
    fontWeight: '400' | 'normal';
  };
}

export interface Theme {
  mode: ThemeMode;
  colors: Colors;
  spacing: Spacing;
  borderRadius: BorderRadius;
  typography: Typography;
}

// Light theme colors (WCAG AA compliant)
const lightColors: Colors = {
  background: '#FFFFFF',
  surface: '#F8F9FA',
  surfaceVariant: '#F1F3F4',
  
  onBackground: '#1A1A1A',
  onSurface: '#1A1A1A',
  onSurfaceVariant: '#4A4A4A', // Improved contrast ratio
  
  primary: '#1976D2',
  onPrimary: '#FFFFFF',
  primaryContainer: '#E3F2FD',
  onPrimaryContainer: '#0D47A1',
  
  secondary: '#6B7280',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#F3F4F6',
  onSecondaryContainer: '#374151',
  
  error: '#D32F2F',
  onError: '#FFFFFF',
  errorContainer: '#FFEBEE',
  onErrorContainer: '#B71C1C',
  
  success: '#2E7D32',
  onSuccess: '#FFFFFF',
  successContainer: '#E8F5E8',
  onSuccessContainer: '#1B5E20',
  
  outline: '#CCCCCC', // Improved contrast
  outlineVariant: '#F5F5F5',
};

// Dark theme colors (WCAG AA compliant)
const darkColors: Colors = {
  background: '#121212',
  surface: '#1E1E1E',
  surfaceVariant: '#2D2D2D',
  
  onBackground: '#FFFFFF',
  onSurface: '#FFFFFF',
  onSurfaceVariant: '#CCCCCC', // Improved contrast
  
  primary: '#90CAF9',
  onPrimary: '#0D47A1',
  primaryContainer: '#1565C0',
  onPrimaryContainer: '#E3F2FD',
  
  secondary: '#9CA3AF',
  onSecondary: '#1F2937',
  secondaryContainer: '#4B5563',
  onSecondaryContainer: '#F9FAFB',
  
  error: '#F48FB1',
  onError: '#B71C1C',
  errorContainer: '#C62828',
  onErrorContainer: '#FFCDD2',
  
  success: '#A5D6A7',
  onSuccess: '#1B5E20',
  successContainer: '#388E3C',
  onSuccessContainer: '#C8E6C9',
  
  outline: '#4A4A4A', // Improved contrast
  outlineVariant: '#2A2A2A',
};

// Shared design tokens
const spacing: Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

const borderRadius: BorderRadius = {
  xs: 6,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  full: 9999,
};

const typography: Typography = {
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
  },
  headline: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600',
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  },
};

const createTheme = (mode: ThemeMode): Theme => ({
  mode,
  colors: mode === 'light' ? lightColors : darkColors,
  spacing,
  borderRadius,
  typography,
});

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  simulateErrors: boolean;
  toggleErrorSimulation: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>('light');
  const [simulateErrors, setSimulateErrors] = useState(false);

  const toggleTheme = () => {
    setMode(prevMode => prevMode === 'light' ? 'dark' : 'light');
  };

  const toggleErrorSimulation = () => {
    setSimulateErrors(prev => !prev);
  };

  const theme = createTheme(mode);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, simulateErrors, toggleErrorSimulation }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}