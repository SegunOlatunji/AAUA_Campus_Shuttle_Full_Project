import { Stack } from 'expo-router';

// Note: this is a Stack, not a bottom-tab bar, despite the "(tabs)" folder
// name kept from the placeholder in Module 1. A full bottom-tab bar
// (Dashboard, Shuttles, Track, Routes, Schedules, Profile per Phase 3) is a
// good next polish pass once those other screens exist — right now the
// primary flow is linear (Dashboard -> Results -> Track), which a Stack
// models more naturally.
export default function TabsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="routes" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="results" />
      <Stack.Screen name="track" />
    </Stack>
  );
}
