import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Voltar',
      }}
    >
      <Stack.Screen
        name="grupos"
        options={{
          title: 'Grupos',
        }}
      />
      <Stack.Screen
        name="usuarios"
        options={{
          title: 'Gerenciar Usuários',
        }}
      />
    </Stack>
  );
}
