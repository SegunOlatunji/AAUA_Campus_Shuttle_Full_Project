import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { useAuth } from '../../hooks/useAuth';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '../../lib/validators/auth';

export default function ForgotPasswordScreen() {
  const { resetPassword } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setSubmitting(true);
    try {
      await resetPassword(data.email);
      setSent(true);
    } catch (error) {
      // Deliberately generic: don't reveal whether an email is registered.
      setSent(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <View className="flex-1 items-center justify-center bg-surface px-6">
        <Text className="mb-2 text-xl font-medium text-textPrimary">Check your email</Text>
        <Text className="mb-8 text-center text-sm text-textSecondary">
          If an account exists for that address, we've sent a link to reset your password.
        </Text>
        <Link href="/(auth)/login" asChild>
          <Text className="text-sm font-medium text-primary">Back to login</Text>
        </Link>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-surface"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerClassName="flex-grow justify-center px-6 py-10">
        <Text className="mb-2 text-xl font-medium text-textPrimary">Reset your password</Text>
        <Text className="mb-8 text-sm text-textSecondary">
          Enter the email you registered with and we'll send you a reset link.
        </Text>

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Email"
              placeholder="name@student.aaua.edu.ng"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.email?.message}
            />
          )}
        />

        <Button label="Send reset link" onPress={handleSubmit(onSubmit)} loading={submitting} />

        <Link href="/(auth)/login" asChild>
          <Text className="mt-6 text-center text-sm font-medium text-primary">Back to login</Text>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
