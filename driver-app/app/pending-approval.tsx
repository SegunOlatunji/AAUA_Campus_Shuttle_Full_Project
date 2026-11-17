import { Linking, Text, View } from 'react-native';
import { Button } from '../components/ui/Button';
import { useDriverAuth } from '../hooks/useDriverAuth';

// Shown when approvalStatus is "pending" or "rejected" (Addendum 1, Section 2).
// This is not a dead end: it explains what's happening and gives a way to
// get help, rather than leaving the driver stuck on a blank screen.
export default function PendingApprovalScreen() {
  const { profile, logout } = useDriverAuth();
  const isRejected = profile?.approvalStatus === 'rejected';

  return (
    <View className="flex-1 items-center justify-center bg-surface px-6">
      <View className="mb-6 h-16 w-16 items-center justify-center rounded-full bg-primary">
        <Text className="text-sm font-medium text-accent">AAUA</Text>
      </View>

      <Text className="mb-2 text-center text-xl font-medium text-textPrimary">
        {isRejected ? 'Account not approved' : 'Your account is under review'}
      </Text>

      <Text className="mb-8 text-center text-sm text-textSecondary">
        {isRejected
          ? "Your driver account wasn't approved. Contact transport administration for details."
          : "Thanks, " +
            (profile?.fullName ?? '') +
            ". Transport administration needs to confirm your details before you can start driving. This usually doesn't take long."}
      </Text>

      <Button
        label="Contact transport office"
        variant="secondary"
        onPress={() => Linking.openURL('tel:+2340000000000')}
      />

      <Text className="mt-6 text-sm text-primary" onPress={logout}>
        Log out
      </Text>
    </View>
  );
}
