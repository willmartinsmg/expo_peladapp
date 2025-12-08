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
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="grupos"
        options={{
          title: 'Grupos',
        }}
      />
      <Stack.Screen
        name="gerenciar-grupo"
        options={{
          title: 'Gerenciar Grupo',
        }}
      />
      <Stack.Screen
        name="usuarios"
        options={{
          title: 'Gerenciar Usuários',
        }}
      />
      <Stack.Screen
        name="jogos"
        options={{
          title: 'Gestão de Jogos',
        }}
      />
      <Stack.Screen
        name="lista-presenca"
        options={{
          title: 'Lista de Presença',
        }}
      />
    </Stack>
  );
}
