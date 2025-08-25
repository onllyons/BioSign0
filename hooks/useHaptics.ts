import { useCallback } from 'react';
import { Platform } from 'react-native';

export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

export function useHaptics() {
  const triggerHaptic = useCallback((type: HapticType = 'light') => {
    if (Platform.OS === 'web') {
      // Simulate haptic feedback with a brief timeout
      // In a real app, this would use Expo Haptics
      setTimeout(() => {
        console.log(`Haptic feedback: ${type}`);
      }, 0);
    }
  }, []);

  return { triggerHaptic };
}