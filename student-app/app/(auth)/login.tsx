import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { useAuth } from '../../hooks/useAuth';
import { loginSchema, type LoginFormData } from '../../lib/validators/auth';

export default function LoginScreen() {
  const { login } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    setSubmitting(true);
    try {
      await login(data.email, data.password);
      // Navigation on success is handled by app/_layout.tsx reacting to the
      // auth state change — no explicit router.replace needed here.
    } catch (error: any) {
      const message =
        error?.message === 'account-deactivated'
          ? 'This account has been deactivated. Contact transport administration.'
          : "Check your email and password and try again.";
      Alert.alert("Couldn't log in", message);
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
          <Text className="text-xl font-medium text-textPrimary">Campus shuttle</Text>
          <Text className="mt-1 text-sm text-textSecondary">Akungba-Akoko</Text>
        </View>

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

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Password"
              placeholder="••••••••"
              secureTextEntry
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.password?.message}
            />
          )}
        />

        <Link href="/(auth)/forgot-password" asChild>
          <Text className="mb-6 text-right text-sm text-primary">Forgot password?</Text>
        </Link>

        <Button label="Log in" onPress={handleSubmit(onSubmit)} loading={submitting} />

        <View className="mt-6 flex-row justify-center">
          <Text className="text-sm text-textSecondary">New student? </Text>
          <Link href="/(auth)/register" asChild>
            <Text className="text-sm font-medium text-primary">Register</Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
