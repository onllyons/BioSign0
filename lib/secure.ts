import * as SecureStore from 'expo-secure-store';

const KEY = 'biometric_unlock_token';

export async function enableLocalBiometric() {
  await SecureStore.setItemAsync(KEY, 'enabled', {
    keychainService: 'biosign.biometric',
    // requireAuthentication: false,
  });
}
export async function hasLocalBiometric() {
  const value = await SecureStore.getItemAsync(KEY);
  return value === 'enabled';
}
export async function disableLocalBiometric() {
  await SecureStore.deleteItemAsync(KEY);
}
