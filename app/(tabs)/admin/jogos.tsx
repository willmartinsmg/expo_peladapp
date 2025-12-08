import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Modal,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useAuth, useThemedStyles } from '@/hooks';
import { Colors } from '@/constants/theme';
import type { ColorScheme } from '@/types/theme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { apiClient } from '@/lib/api-client';
import { format, parseISO, addMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Matchday {
  id: number;
  organizationId: number;
  date: string;
  numberPlayers: number;
  dedicatedGoalKeeper: boolean;
  location?: string;
}

export default function GestaoJogo() {
  const { activeGroup } = useAuth();
  const styles = useThemedStyles(createStyles);
  const groupId = activeGroup?.id;

  const [games, setGames] = useState<Matchday[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showDelete, setShowDelete] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchGames = async () => {
    if (!groupId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient
        .get(`matchday/get-all-matchdays/${groupId}`)
        .json<Matchday[]>();
      setGames(res || []);
    } catch (err: any) {
      setError(err?.message || 'Erro ao buscar jogos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, [groupId]);

  const handleDelete = (gameId: number) => {
    setDeletingId(gameId);
    setShowDelete(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setDeleting(true);
    try {
      await apiClient.delete(`matchday/${deletingId}`);
      setShowDelete(false);
      setDeletingId(null);
      fetchGames();
    } catch (err: any) {
      setError(err?.message || 'Erro ao excluir jogo');
      setShowDelete(false);
      setDeletingId(null);
    } finally {
      setDeleting(false);
    }
  };

  const formatGameDate = (dateString: string) => {
    const d = parseISO(dateString);
    const adjusted = addMinutes(d, d.getTimezoneOffset());
    return format(adjusted, 'dd/MM/yyyy', { locale: ptBR });
  };

  const formatGameTime = (dateString: string) => {
    const d = parseISO(dateString);
    const adjusted = addMinutes(d, d.getTimezoneOffset());
    return format(adjusted, 'HH:mm', { locale: ptBR });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Gestão de Jogos',
            headerShown: true,
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.dark.primary} />
          <Text style={styles.loadingText}>Carregando jogos...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Gestão de Jogos',
          headerShown: true,
        }}
      />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Lista de Jogos</Text>
            {activeGroup && (
              <Text style={styles.subtitle}>{activeGroup.name}</Text>
            )}
          </View>
          <Pressable
            style={[styles.createButton, !groupId && styles.createButtonDisabled]}
            disabled={!groupId}
          >
            <MaterialIcons name="add" size={20} color="#fff" />
            <Text style={styles.createButtonText}>Novo Jogo</Text>
          </Pressable>
        </View>

        {games.length === 0 && !loading && (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="sports-soccer" size={64} color={Colors.dark.textSecondary} />
            <Text style={styles.emptyTitle}>Nenhum jogo encontrado</Text>
            <Text style={styles.emptyText}>
              Crie o primeiro jogo para este grupo
            </Text>
          </View>
        )}

        <View style={styles.gamesContainer}>
          {games.map((game) => (
            <View key={game.id} style={styles.gameCard}>
              <View style={styles.gameHeader}>
                <View style={styles.gameInfo}>
                  <View style={styles.dateRow}>
                    <MaterialIcons name="calendar-today" size={18} color={Colors.dark.primary} />
                    <Text style={styles.gameDate}>{formatGameDate(game.date)}</Text>
                  </View>
                  <View style={styles.timeRow}>
                    <MaterialIcons name="access-time" size={18} color={Colors.dark.textSecondary} />
                    <Text style={styles.gameTime}>{formatGameTime(game.date)}</Text>
                  </View>
                </View>
                <View style={styles.playersBadge}>
                  <MaterialIcons name="people" size={16} color="#10B981" />
                  <Text style={styles.playersBadgeText}>{game.numberPlayers}</Text>
                </View>
              </View>

              {game.location && (
                <View style={styles.locationRow}>
                  <MaterialIcons name="location-on" size={16} color={Colors.dark.textSecondary} />
                  <Text style={styles.locationText}>{game.location}</Text>
                </View>
              )}

              <View style={styles.gameActions}>
                <Pressable
                  style={styles.actionButton}
                  onPress={() => router.push(`/admin/lista-presenca/${game.id}` as any)}
                >
                  <MaterialIcons name="list-alt" size={18} color="#3B82F6" />
                  <Text style={styles.actionButtonText}>Presença</Text>
                </Pressable>

                <Pressable style={styles.actionButton}>
                  <MaterialIcons name="groups" size={18} color="#10B981" />
                  <Text style={styles.actionButtonText}>Times</Text>
                </Pressable>

                <Pressable style={styles.iconActionButton}>
                  <MaterialIcons name="edit" size={20} color="#F59E0B" />
                </Pressable>

                <Pressable
                  style={styles.iconActionButton}
                  onPress={() => handleDelete(game.id)}
                >
                  <MaterialIcons name="delete" size={20} color="#EF4444" />
                </Pressable>
              </View>
            </View>
          ))}
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error" size={20} color={Colors.dark.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>

      {/* Modal de confirmação de exclusão */}
      <Modal
        visible={showDelete}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDelete(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => {
            setShowDelete(false);
            setDeletingId(null);
          }}
        >
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.deleteModalHeader}>
              <View style={styles.deleteIcon}>
                <MaterialIcons name="warning" size={32} color="#F59E0B" />
              </View>
              <View style={styles.deleteModalText}>
                <Text style={styles.modalTitle}>Confirmar exclusão</Text>
                <Text style={styles.modalDescription}>
                  Tem certeza que deseja excluir este jogo? Esta ação não pode ser
                  desfeita.
                </Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => {
                  setShowDelete(false);
                  setDeletingId(null);
                }}
              >
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalDeleteButton]}
                onPress={confirmDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalDeleteButtonText}>Deletar</Text>
                )}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
    },
    loadingText: {
      fontSize: 14,
      color: Colors[scheme].textSecondary,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 24,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: Colors[scheme].text,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: Colors[scheme].textSecondary,
    },
    createButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: '#3B82F6',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
    },
    createButtonDisabled: {
      backgroundColor: Colors[scheme].backgroundSecondary,
      opacity: 0.5,
    },
    createButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
    },
    emptyContainer: {
      padding: 48,
      alignItems: 'center',
      gap: 12,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: Colors[scheme].text,
    },
    emptyText: {
      fontSize: 14,
      color: Colors[scheme].textSecondary,
      textAlign: 'center',
    },
    gamesContainer: {
      gap: 12,
    },
    gameCard: {
      backgroundColor: Colors[scheme].card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: Colors[scheme].border,
      padding: 16,
      gap: 12,
    },
    gameHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    gameInfo: {
      flex: 1,
      gap: 6,
    },
    dateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    gameDate: {
      fontSize: 16,
      fontWeight: '600',
      color: Colors[scheme].text,
    },
    timeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    gameTime: {
      fontSize: 14,
      color: Colors[scheme].textSecondary,
    },
    playersBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: '#D1FAE5',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
    },
    playersBadgeText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#065F46',
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    locationText: {
      fontSize: 14,
      color: Colors[scheme].textSecondary,
      flex: 1,
    },
    gameActions: {
      flexDirection: 'row',
      gap: 8,
      paddingTop: 4,
      flexWrap: 'wrap',
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: Colors[scheme].backgroundSecondary,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
    },
    actionButtonText: {
      fontSize: 13,
      fontWeight: '600',
      color: Colors[scheme].text,
    },
    iconActionButton: {
      width: 36,
      height: 36,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: Colors[scheme].backgroundSecondary,
    },
    errorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 16,
      padding: 12,
      backgroundColor: Colors[scheme].errorLight + '20',
      borderRadius: 8,
    },
    errorText: {
      fontSize: 14,
      color: Colors[scheme].error,
      flex: 1,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: Colors[scheme].card,
      borderRadius: 12,
      padding: 24,
      width: '90%',
      maxWidth: 400,
    },
    deleteModalHeader: {
      flexDirection: 'row',
      gap: 16,
      marginBottom: 24,
    },
    deleteIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: '#FEF3C7',
      alignItems: 'center',
      justifyContent: 'center',
    },
    deleteModalText: {
      flex: 1,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: Colors[scheme].text,
      marginBottom: 8,
    },
    modalDescription: {
      fontSize: 14,
      color: Colors[scheme].textSecondary,
      lineHeight: 20,
    },
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 8,
    },
    modalButton: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
      minWidth: 100,
      alignItems: 'center',
    },
    modalCancelButton: {
      backgroundColor: Colors[scheme].backgroundSecondary,
    },
    modalCancelButtonText: {
      color: Colors[scheme].text,
      fontSize: 14,
      fontWeight: '600',
    },
    modalDeleteButton: {
      backgroundColor: '#EF4444',
    },
    modalDeleteButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
    },
  });
