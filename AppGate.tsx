// AppGate.tsx
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { hasLocalBiometric } from './lib/secure'; // funcția ta de verificare token

export default function AppGate({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const localEnabled = await hasLocalBiometric(); // Verifică dacă biometria a fost activată
        if (!localEnabled) {
          setUnlocked(true); // Dacă nu este activată, lasă aplicația să ruleze normal
          return;
        }

        const compatible = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        if (!compatible || !enrolled) {
          setUnlocked(true); // Dacă nu sunt configurate amprente sau FaceID, lasă aplicația să ruleze
          return;
        }

        const res = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Deblochează aplicația cu Face ID / Touch ID',
          fallbackLabel: 'Folosește codul dispozitivului',
        });

        if (res.success) {
          setUnlocked(true); // Permite accesul în aplicație dacă autentificarea este reușită
        } else {
          Alert.alert('Autentificare eșuată', 'Te rugăm să te conectezi din nou.');
        }
      } catch (e) {
        setUnlocked(true); // În cazul unei erori, lăsăm aplicația să ruleze
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  if (checking) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  // Nu permite accesul în aplicație până când biometria nu este validată
  return <>{unlocked ? children : null}</>;
}
