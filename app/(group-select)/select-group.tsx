import { useState, useEffect } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks';
import { Colors } from '@/constants/theme';
import type { ColorScheme } from '@/types/theme';
import type { Group } from '@/types/group';
import { useThemedStyles } from '@/hooks/use-themed-styles';

export default function SelectGroupScreen() {
  const { availableGroups, selectGroup, isLoadingGroups, refreshGroups } = useAuth();
  const styles = useThemedStyles(createStyles);
  const [isSelecting, setIsSelecting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // If user has no groups, allow skipping
  const canSkip = availableGroups.length === 0;

  // Auto-select if only one group
  useEffect(() => {
    if (availableGroups.length === 1 && !isLoadingGroups && !isSelecting) {
      handleSelectGroup(availableGroups[0]);
    }
  }, [availableGroups, isLoadingGroups]);

  const handleSelectGroup = async (group: Group) => {
    try {
      setIsSelecting(true);
      await selectGroup(group);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error selecting group:', error);
      // Could add Alert.alert here
    } finally {
      setIsSelecting(false);
    }
  };

  const handleSkip = () => {
    router.replace('/(tabs)');
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshGroups();
    setRefreshing(false);
  };

  if (isLoadingGroups && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.dark.primary} />
        <Text style={styles.loadingText}>Carregando grupos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Selecione um Grupo</Text>
        <Text style={styles.subtitle}>
          {canSkip
            ? 'Você não está em nenhum grupo ainda.'
            : 'Escolha o grupo que deseja acessar'}
        </Text>
      </View>

      <FlatList
        data={availableGroups}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Pressable
            style={styles.groupCard}
            onPress={() => handleSelectGroup(item)}
            disabled={isSelecting}
          >
            <View style={styles.groupInfo}>
              <View style={styles.groupHeader}>
                <Text style={styles.groupName}>{item.name}</Text>
                {item.isAdmin && (
                  <View style={styles.adminBadge}>
                    <Text style={styles.adminBadgeText}>Admin</Text>
                  </View>
                )}
              </View>
              {item.description && (
                <Text style={styles.groupDescription}>{item.description}</Text>
              )}
              {item.memberCount !== undefined && (
                <Text style={styles.memberCount}>
                  {item.memberCount} {item.memberCount === 1 ? 'membro' : 'membros'}
                </Text>
              )}
            </View>
          </Pressable>
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              Você ainda não faz parte de nenhum grupo.
            </Text>
            <Text style={styles.emptySubtext}>
              Peça a um administrador para adicionar você a um grupo.
            </Text>
          </View>
        }
      />

      {canSkip && (
        <View style={styles.skipContainer}>
          <Pressable
            style={styles.skipButton}
            onPress={handleSkip}
            disabled={isSelecting}
          >
            <Text style={styles.skipButtonText}>Continuar sem grupo</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const createStyles = (scheme: ColorScheme) => StyleSheet.create({
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors[scheme].textSecondary,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors[scheme].text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors[scheme].textSecondary,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  groupCard: {
    backgroundColor: Colors[scheme].card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors[scheme].border,
  },
  groupInfo: {
    flex: 1,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors[scheme].text,
    flex: 1,
  },
  adminBadge: {
    backgroundColor: Colors[scheme].primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  adminBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  groupDescription: {
    fontSize: 14,
    color: Colors[scheme].textSecondary,
    marginBottom: 8,
  },
  memberCount: {
    fontSize: 13,
    color: Colors[scheme].textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors[scheme].text,
    textAlign: 'center',
    marginBottom: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors[scheme].textSecondary,
    textAlign: 'center',
  },
  skipContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors[scheme].border,
  },
  skipButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors[scheme].card,
    borderWidth: 1,
    borderColor: Colors[scheme].border,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors[scheme].text,
  },
});
