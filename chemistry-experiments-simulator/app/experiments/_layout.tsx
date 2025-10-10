import { Stack } from 'expo-router';

export default function ExperimentsLayout() {
  return (
    <Stack screenOptions={{ headerBackTitle: 'Back' }}>
      <Stack.Screen name="general" />
      <Stack.Screen name="biochemistry" />
      <Stack.Screen name="organic" />
      <Stack.Screen name="analytical" />
    </Stack>
  );
}