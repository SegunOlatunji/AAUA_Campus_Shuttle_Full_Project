import '../global.css';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import { AuthProvider, useAuth } from '../hooks/useAuth';
import { colors } from '../constants/theme';

function RootNavigation() {
  const { firebaseUser, initializing } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (initializing) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!firebaseUser && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (firebaseUser && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [firebaseUser, initializing, segments]);

  if (initializing) {
    // Splash-equivalent while Firebase resolves the persisted session.
    return <View style={{ flex: 1, backgroundColor: colors.primary }} />;
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigation />
    </AuthProvider>
  );
}
