import React from 'react';
import { Text, TextInput, type TextInputProps, View } from 'react-native';
import { colors } from '../../constants/theme';

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

export function TextField({ label, error, ...inputProps }: TextFieldProps) {
  return (
    <View className="mb-4 w-full">
      <Text className="mb-1.5 text-sm text-textSecondary">{label}</Text>
      <TextInput
        className={`w-full rounded-xl border px-4 py-3 text-base text-textPrimary ${
          error ? 'border-danger' : 'border-border'
        }`}
        style={{ minHeight: 44 }}
        placeholderTextColor={colors.textSecondary}
        accessibilityLabel={label}
        {...inputProps}
      />
      {error ? <Text className="mt-1 text-xs text-danger">{error}</Text> : null}
    </View>
  );
}
