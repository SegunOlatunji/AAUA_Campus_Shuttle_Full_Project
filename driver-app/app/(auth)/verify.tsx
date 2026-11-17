import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, Text, TextInput, View } from 'react-native';
import { Button } from '../../components/ui/Button';
import { useDriverAuth } from '../../hooks/useDriverAuth';

const CODE_LENGTH = 6;

export default function VerifyScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { confirmOtp, requestOtp } = useDriverAuth();
  const router = useRouter();

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [submitting, setSubmitting] = useState(false);
  const inputs = useRef<Array<TextInput | null>>([]);

  const code = digits.join('');

  const handleChange = (text: string, index: number) => {
    // Only accept a single digit per box; anything else is ignored so a
    // low-literacy user can't get the boxes into a confusing state.
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);

    if (digit && index < CODE_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    if (code.length !== CODE_LENGTH) return;
    setSubmitting(true);
    try {
      await confirmOtp(code);
      // Navigation from here is handled by app/_layout.tsx, which routes to
      // /pending-approval or /(tabs) depending on approvalStatus.
    } catch (error) {
      Alert.alert('Incorrect code', 'Please check the code and try again.');
      setDigits(Array(CODE_LENGTH).fill(''));
      inputs.current[0]?.focus();
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!phone) return;
    try {
      await requestOtp(phone, '');
      Alert.alert('Code sent', 'A new code has been sent to your phone.');
    } catch (error) {
      Alert.alert("Couldn't resend", 'Please try again in a moment.');
    }
  };

  return (
    <View className="flex-1 justify-center bg-surface px-6">
      <Text className="mb-2 text-center text-xl font-medium text-textPrimary">Enter the code</Text>
      <Text className="mb-8 text-center text-sm text-textSecondary">Sent to {phone}</Text>

      <View className="mb-8 flex-row justify-center gap-2">
        {digits.map((digit, index) => (
          <TextInput
            key={index}
            ref={(el) => (inputs.current[index] = el)}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
            keyboardType="number-pad"
            maxLength={1}
            className="h-14 w-12 rounded-xl border border-border text-center text-xl text-textPrimary"
            accessibilityLabel={`Digit ${index + 1} of ${CODE_LENGTH}`}
          />
        ))}
      </View>

      <Button
        label="Verify"
        onPress={handleVerify}
        loading={submitting}
        disabled={code.length !== CODE_LENGTH}
      />

      <Text className="mt-6 text-center text-sm text-primary" onPress={handleResend}>
        Didn't get a code? Resend
      </Text>
    </View>
  );
}
