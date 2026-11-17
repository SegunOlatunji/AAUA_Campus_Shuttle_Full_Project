import React from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';
import { colors } from '../../constants/theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

export function Button({ label, onPress, loading, disabled, variant = 'primary' }: ButtonProps) {
  const isPrimary = variant === 'primary';
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      className={`w-full flex-row items-center justify-center rounded-xl py-3.5 ${
        isPrimary ? 'bg-primary' : 'border border-primary bg-transparent'
      } ${isDisabled ? 'opacity-60' : ''}`}
      style={{ minHeight: 44 }}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? '#FFFFFF' : colors.primary} />
      ) : (
        <Text className={`text-base font-medium ${isPrimary ? 'text-white' : 'text-primary'}`}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}
