import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { router, Stack } from 'expo-router';
import { useAuth, useThemedStyles } from '@/hooks';
import { Colors } from '@/constants/theme';
import type { ColorScheme } from '@/types/theme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface ManagementCard {
  title: string;
  description: string;
  route: string;
  iconName: React.ComponentProps<typeof MaterialIcons>['name'];
  iconColor: string;
}

export default function GerenciarGrupo() {
  const { activeGroup } = useAuth();
  const styles = useThemedStyles(createStyles);

  const cards: ManagementCard[] = [
    {
      title: 'Gestão de Usuários',
      description: 'Adicione, remova e gerencie permissões dos membros',
      route: '/admin/usuarios',
      iconName: 'people',
      iconColor: '#3B82F6', // blue-500
    },
    {
      title: 'Gestão de Jogos',
      description: 'Crie e gerencie os jogos do grupo',
      route: '/admin/jogos',
      iconName: 'sports-soccer',
      iconColor: '#10B981', // green-500
    },
  ];

  const handleCardPress = (route: string) => {
    router.push(route as any);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Gerenciar Grupo',
          headerShown: true,
        }}
      />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Gerenciar Grupo</Text>
          {activeGroup && (
            <View style={styles.groupInfo}>
              <MaterialIcons name="group" size={16} color={Colors.dark.textSecondary} />
              <Text style={styles.groupName}>{activeGroup.name}</Text>
            </View>
          )}
        </View>

        <View style={styles.cardsContainer}>
          {cards.map((card) => (
            <Pressable
              key={card.title}
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed,
              ]}
              onPress={() => handleCardPress(card.route)}
            >
              <View style={[styles.iconContainer, { backgroundColor: card.iconColor + '20' }]}>
                <MaterialIcons name={card.iconName} size={32} color={card.iconColor} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Text style={styles.cardDescription}>{card.description}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={Colors.dark.textSecondary} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (scheme: ColorScheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[scheme].background,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: 16,
    },
    header: {
      marginBottom: 24,
      gap: 8,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: Colors[scheme].text,
    },
    groupInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    groupName: {
      fontSize: 16,
      fontWeight: '600',
      color: Colors[scheme].textSecondary,
    },
    cardsContainer: {
      gap: 12,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Colors[scheme].card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: Colors[scheme].border,
      padding: 16,
      gap: 16,
    },
    cardPressed: {
      opacity: 0.7,
      transform: [{ scale: 0.98 }],
    },
    iconContainer: {
      width: 64,
      height: 64,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardContent: {
      flex: 1,
      gap: 4,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: Colors[scheme].text,
      lineHeight: 24,
    },
    cardDescription: {
      fontSize: 14,
      color: Colors[scheme].textSecondary,
      lineHeight: 20,
    },
  });
