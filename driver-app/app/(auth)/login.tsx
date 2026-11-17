import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { useDriverAuth } from '../../hooks/useDriverAuth';
import { phoneEntrySchema, toE164, type PhoneEntryFormData } from '../../lib/validators/auth';

export default function DriverLoginScreen() {
  const { requestOtp } = useDriverAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PhoneEntryFormData>({
    resolver: zodResolver(phoneEntrySchema),
    defaultValues: { fullName: '', phone: '' },
  });

  const onSubmit = async (data: PhoneEntryFormData) => {
    setSubmitting(true);
    try {
      const e164Phone = toE164(data.phone);
      await requestOtp(e164Phone, data.fullName);
      router.push({ pathname: '/(auth)/verify', params: { phone: e164Phone } });
    } catch (error) {
      Alert.alert("Couldn't send code", 'Check your phone number and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-surface"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerClassName="flex-grow justify-center px-6 py-10">
        <View className="mb-10 items-center">
          <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-primary">
            <Text className="text-sm font-medium text-accent">AAUA</Text>
          </View>
          <Text className="text-xl font-medium text-textPrimary">Driver app</Text>
          <Text className="mt-1 text-sm text-textSecondary">Enter your phone number to continue</Text>
        </View>

        <Controller
          control={control}
          name="fullName"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Full name"
              placeholder="Your full name"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.fullName?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Phone number"
              placeholder="080XXXXXXXX"
              keyboardType="phone-pad"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.phone?.message}
            />
          )}
        />

        <Button label="Send code" onPress={handleSubmit(onSubmit)} loading={submitting} />

        <Text className="mt-6 text-center text-xs text-textSecondary">
          No password needed. We'll text you a code to confirm it's you.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
