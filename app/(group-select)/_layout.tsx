import { Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function GroupSelectLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors[colorScheme].background },
        gestureEnabled: false, // Prevent going back to auth screens
      }}
    >
      <Stack.Screen name="select-group" />
    </Stack>
  );
}
