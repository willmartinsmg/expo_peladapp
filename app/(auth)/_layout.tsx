import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#1a1f2e' },
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="email" />
      <Stack.Screen name="verify" />
    </Stack>
  );
}
