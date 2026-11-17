import { useState } from 'react';
import { Star } from 'lucide-react-native';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { BottomNav } from '../../components/layout/BottomNav';
import { useAuth } from '../../hooks/useAuth';
import { submitFeedback } from '../../hooks/useFeedback';
import { colors } from '../../constants/theme';

export default function ProfileScreen() {
  const { profile, logout } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitFeedback = async () => {
    if (!profile || rating === 0) return;
    setSubmitting(true);
    try {
      await submitFeedback(profile.uid, rating, comment);
      setRating(0);
      setComment('');
      Alert.alert('Thank you', 'Your feedback helps improve the shuttle service.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-surface">
      <ScrollView contentContainerClassName="px-6 pb-6 pt-16">
        <Text className="mb-6 text-lg font-medium text-textPrimary">Profile</Text>

        <View className="mb-6 rounded-2xl border border-border bg-surfaceCard p-5">
          <Text className="text-base font-medium text-textPrimary">{profile?.fullName}</Text>
          <Text className="mt-1 text-sm text-textSecondary">{profile?.matricNumber}</Text>
          <Text className="mt-1 text-sm text-textSecondary">{profile?.email}</Text>
          <Text className="mt-1 text-sm text-textSecondary">{profile?.phone}</Text>
        </View>

        <View className="mb-6 rounded-2xl border border-border bg-surfaceCard p-5">
          <Text className="mb-1 text-sm font-medium text-textPrimary">Rate the shuttle service</Text>
          <Text className="mb-4 text-xs text-textSecondary">
            Your feedback feeds into the transport office's reports.
          </Text>

          <View className="mb-4 flex-row gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <Pressable key={value} onPress={() => setRating(value)}>
                <Star
                  size={28}
                  color={colors.accent}
                  fill={value <= rating ? colors.accent : 'transparent'}
                />
              </Pressable>
            ))}
          </View>

          <TextField
            label="Comment (optional)"
            placeholder="What went well, or what could be better?"
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={3}
          />

          <Button
            label="Submit feedback"
            onPress={handleSubmitFeedback}
            loading={submitting}
            disabled={rating === 0}
          />
        </View>

        <Button label="Log out" onPress={logout} variant="secondary" />
      </ScrollView>
      <BottomNav />
    </View>
  );
}
