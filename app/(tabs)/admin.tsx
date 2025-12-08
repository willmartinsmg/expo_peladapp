import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth, useThemedStyles } from '@/hooks';
import { Colors } from '@/constants/theme';
import type { ColorScheme } from '@/types/theme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { apiClient } from '@/lib/api-client';

interface AdminCard {
  title: string;
  description: string;
  route: string;
  iconName: React.ComponentProps<typeof MaterialIcons>['name'];
  iconColor: string;
}

export default function AdminDashboard() {
  const { user, activeGroup } = useAuth();
  const styles = useThemedStyles(createStyles);
  const [isGroupAdmin, setIsGroupAdmin] = useState(false);
  const [loadingAdmin, setLoadingAdmin] = useState(true);

  const cards: AdminCard[] = [
    {
      title: 'Gestão do grupo',
      description: 'Gerencie os grupos e membros',
      route: '/admin/grupos',
      iconName: 'group',
      iconColor: '#A855F7', // purple-500
    },
    {
      title: 'Jogos',
      description: 'Gerencie os jogos cadastrados',
      route: '/admin/jogos',
      iconName: 'sports-esports',
      iconColor: '#3B82F6', // blue-500
    },
  ];

  // Verificar se usuário é admin do grupo atual
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!activeGroup?.id || !user) {
        setIsGroupAdmin(false);
        setLoadingAdmin(false);
        return;
      }

      try {
        const res = await apiClient.get('organization/admin').json<any[]>();
        const adminGroups = res || [];
        const isAdmin = adminGroups.some((group: any) => group.id === activeGroup.id);
        setIsGroupAdmin(isAdmin);
      } catch (err) {
        console.error('Erro ao verificar status admin:', err);
        setIsGroupAdmin(false);
      } finally {
        setLoadingAdmin(false);
      }
    };

    checkAdminStatus();
  }, [activeGroup?.id, user]);

  const handleCardPress = (route: string) => {
    if (route === '/admin/jogos') {
      // Temporariamente mostra alerta para jogos
      Alert.alert('Em breve', 'A gestão de jogos será implementada em breve');
    } else {
      router.push(route as any);
    }
  };

  if (loadingAdmin) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.dark.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Painel Administrativo</Text>
        {activeGroup && (
          <View style={styles.groupInfo}>
            <Text style={styles.groupLabel}>Grupo atual: </Text>
            <Text style={styles.groupName}>{activeGroup.name}</Text>
          </View>
        )}
      </View>

      {!isGroupAdmin ? (
        <View style={styles.noAccessContainer}>
          <MaterialIcons name="lock" size={64} color={Colors.dark.textSecondary} />
          <Text style={styles.noAccessTitle}>Acesso Restrito</Text>
          <Text style={styles.noAccessText}>
            Você não possui permissões de administrador para este grupo.
          </Text>
        </View>
      ) : (
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
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <View style={[styles.iconContainer, { backgroundColor: card.iconColor + '20' }]}>
                    <MaterialIcons
                      name={card.iconName}
                      size={32}
                      color={card.iconColor}
                    />
                  </View>
                  <Text style={styles.cardTitle}>{card.title}</Text>
                </View>
                <Text style={styles.cardDescription}>{card.description}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const createStyles = (scheme: ColorScheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[scheme].background,
    },
    loadingContainer: {
      flex: 1,
      backgroundColor: Colors[scheme].background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      paddingBottom: 40,
    },
    header: {
      paddingTop: 60,
      paddingBottom: 24,
      paddingHorizontal: 20,
      alignItems: 'center',
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: Colors[scheme].text,
      textAlign: 'center',
      marginBottom: 12,
    },
    groupInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    groupLabel: {
      fontSize: 16,
      color: Colors[scheme].textSecondary,
    },
    groupName: {
      fontSize: 16,
      fontWeight: '600',
      color: Colors[scheme].text,
    },
    noAccessContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 40,
      paddingTop: 60,
    },
    noAccessTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: Colors[scheme].text,
      marginTop: 24,
      marginBottom: 12,
    },
    noAccessText: {
      fontSize: 16,
      color: Colors[scheme].textSecondary,
      textAlign: 'center',
      lineHeight: 24,
    },
    cardsContainer: {
      paddingHorizontal: 20,
      gap: 16,
    },
    card: {
      backgroundColor: Colors[scheme].card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: Colors[scheme].border,
      overflow: 'hidden',
    },
    cardPressed: {
      opacity: 0.7,
      transform: [{ scale: 0.98 }],
    },
    cardContent: {
      padding: 20,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      marginBottom: 12,
    },
    iconContainer: {
      width: 56,
      height: 56,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardTitle: {
      flex: 1,
      fontSize: 20,
      fontWeight: '600',
      color: Colors[scheme].text,
    },
    cardDescription: {
      fontSize: 15,
      color: Colors[scheme].textSecondary,
      lineHeight: 20,
    },
  });
