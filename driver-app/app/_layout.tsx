import '../global.css';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import { DriverAuthProvider, useDriverAuth } from '../hooks/useDriverAuth';
import { colors } from '../constants/theme';

function RootNavigation() {
  const { firebaseUser, profile, initializing } = useDriverAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (initializing) return;

    const inAuthGroup = segments[0] === '(auth)';
    const onPendingScreen = segments[0] === 'pending-approval';

    if (!firebaseUser && !inAuthGroup) {
      router.replace('/(auth)/login');
      return;
    }

    if (firebaseUser && profile?.approvalStatus === 'pending' && !onPendingScreen) {
      router.replace('/pending-approval');
      return;
    }

    if (firebaseUser && profile?.approvalStatus === 'rejected' && !onPendingScreen) {
      router.replace('/pending-approval');
      return;
    }

    if (firebaseUser && profile?.approvalStatus === 'approved' && (inAuthGroup || onPendingScreen)) {
      router.replace('/(tabs)');
    }
  }, [firebaseUser, profile, initializing, segments]);

  if (initializing) {
    return <View style={{ flex: 1, backgroundColor: colors.primary }} />;
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <DriverAuthProvider>
      <RootNavigation />
    </DriverAuthProvider>
  );
}
