import { useState } from 'react';
import { FlatList, Modal, Pressable, Text, TextInput, View } from 'react-native';
import { colors } from '../../constants/theme';

interface StopPickerProps {
  label: string;
  value: string | null;
  options: string[];
  onSelect: (stopName: string) => void;
  placeholder?: string;
}

export function StopPicker({ label, value, options, onSelect, placeholder }: StopPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = options.filter((option) => option.toLowerCase().includes(query.toLowerCase()));

  const handleSelect = (option: string) => {
    onSelect(option);
    setOpen(false);
    setQuery('');
  };

  return (
    <View className="mb-4 w-full">
      <Text className="mb-1.5 text-sm text-textSecondary">{label}</Text>
      <Pressable
        onPress={() => setOpen(true)}
        className="w-full rounded-xl border border-border px-4 py-3"
        style={{ minHeight: 44 }}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <Text className={value ? 'text-base text-textPrimary' : 'text-base text-textSecondary'}>
          {value ?? placeholder ?? 'Select a stop'}
        </Text>
      </Pressable>

      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <View className="flex-1 bg-surface pt-16">
          <View className="flex-row items-center justify-between px-6 pb-4">
            <Text className="text-lg font-medium text-textPrimary">{label}</Text>
            <Pressable onPress={() => setOpen(false)}>
              <Text className="text-sm text-primary">Close</Text>
            </Pressable>
          </View>

          <View className="px-6 pb-3">
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search stops"
              placeholderTextColor={colors.textSecondary}
              className="rounded-xl border border-border px-4 py-3 text-base text-textPrimary"
              autoFocus
            />
          </View>

          <FlatList
            data={filtered}
            keyExtractor={(item) => item}
            contentContainerClassName="px-6 pb-10"
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handleSelect(item)}
                className="border-b border-border py-3.5"
              >
                <Text className="text-base text-textPrimary">{item}</Text>
              </Pressable>
            )}
            ListEmptyComponent={
              <Text className="mt-6 text-center text-sm text-textSecondary">No stops match.</Text>
            }
          />
        </View>
      </Modal>
    </View>
  );
}
