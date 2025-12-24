import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Modal,
  TextInput,
  Switch,
  Platform,
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
  playersTeams?: number;
  numberTeams?: number;
  dedicatedGoalKeeper: boolean;
  location?: string;
  listReleased?: boolean;
}

interface MatchdayForm {
  date: Date | null;
  time: Date | null;
  numberPlayers: string;
  playersTeams: string;
  numberTeams: string;
  dedicatedGoalKeeper: boolean;
  location: string;
  listReleased: boolean;
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

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingGame, setEditingGame] = useState<Matchday | null>(null);
  const [saving, setSaving] = useState(false);

  const initialForm: MatchdayForm = {
    date: null,
    time: null,
    numberPlayers: '',
    playersTeams: '',
    numberTeams: '',
    dedicatedGoalKeeper: false,
    location: '',
    listReleased: false,
  };

  const [formData, setFormData] = useState<MatchdayForm>(initialForm);

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

  const handleCreate = () => {
    setFormData(initialForm);
    setShowCreate(true);
  };

  const handleEdit = (game: Matchday) => {
    const gameDate = parseISO(game.date);
    const adjusted = addMinutes(gameDate, gameDate.getTimezoneOffset());

    setFormData({
      date: adjusted,
      time: adjusted,
      numberPlayers: String(game.numberPlayers),
      playersTeams: String(game.playersTeams || ''),
      numberTeams: String(game.numberTeams || ''),
      dedicatedGoalKeeper: game.dedicatedGoalKeeper,
      location: game.location || '',
      listReleased: game.listReleased || false,
    });
    setEditingGame(game);
    setShowEdit(true);
  };

  const confirmCreate = async () => {
    if (!groupId || !formData.date || !formData.time) return;
    setSaving(true);
    try {
      // Combine date and time
      const combinedDate = new Date(formData.date);
      combinedDate.setHours(formData.time.getHours());
      combinedDate.setMinutes(formData.time.getMinutes());
      combinedDate.setSeconds(0);
      combinedDate.setMilliseconds(0);

      const dateTimeString = combinedDate.toISOString();

      await apiClient.post('matchday', {
        json: {
          organizationId: groupId,
          date: dateTimeString,
          numberPlayers: parseInt(formData.numberPlayers) || 0,
          playersTeams: parseInt(formData.playersTeams) || 0,
          numberTeams: parseInt(formData.numberTeams) || 0,
          dedicatedGoalKeeper: formData.dedicatedGoalKeeper,
          location: formData.location || undefined,
          listReleased: formData.listReleased,
        },
      });

      setShowCreate(false);
      setFormData(initialForm);
      fetchGames();
    } catch (err: any) {
      setError(err?.message || 'Erro ao criar jogo');
    } finally {
      setSaving(false);
    }
  };

  const confirmEdit = async () => {
    if (!editingGame || !formData.date || !formData.time) return;
    setSaving(true);
    try {
      // Combine date and time
      const combinedDate = new Date(formData.date);
      combinedDate.setHours(formData.time.getHours());
      combinedDate.setMinutes(formData.time.getMinutes());
      combinedDate.setSeconds(0);
      combinedDate.setMilliseconds(0);

      const dateTimeString = combinedDate.toISOString();

      await apiClient.put('matchday', {
        json: {
          id: editingGame.id,
          organizationId: editingGame.organizationId,
          date: dateTimeString,
          numberPlayers: parseInt(formData.numberPlayers) || 0,
          playersTeams: parseInt(formData.playersTeams) || 0,
          numberTeams: parseInt(formData.numberTeams) || 0,
          dedicatedGoalKeeper: formData.dedicatedGoalKeeper,
          location: formData.location || undefined,
          listReleased: formData.listReleased,
        },
      });

      setShowEdit(false);
      setEditingGame(null);
      setFormData(initialForm);
      fetchGames();
    } catch (err: any) {
      setError(err?.message || 'Erro ao editar jogo');
    } finally {
      setSaving(false);
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
            onPress={handleCreate}
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

                <Pressable
                  style={styles.iconActionButton}
                  onPress={() => handleEdit(game)}
                >
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

      {/* Modal de criação de jogo */}
      <Modal
        visible={showCreate}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreate(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowCreate(false)}
        >
          <Pressable style={styles.formModalContent} onPress={(e) => e.stopPropagation()}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formHeader}>
                <Text style={styles.formTitle}>Criar Novo Jogo</Text>
                <Pressable onPress={() => setShowCreate(false)}>
                  <MaterialIcons name="close" size={24} color={Colors.dark.text} />
                </Pressable>
              </View>

              <View style={styles.formFields}>
                <View style={styles.formRow}>
                  <View style={[styles.formField, { flex: 1 }]}>
                    <Text style={styles.label}>Data (dd/mm/aaaa)</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.date ? format(formData.date, 'dd/MM/yyyy') : ''}
                      onChangeText={(text) => {
                        // Remove tudo que não é número
                        const numbers = text.replace(/\D/g, '');

                        if (numbers.length === 8) {
                          // Tenta fazer parse da data dd/mm/yyyy
                          const day = parseInt(numbers.substring(0, 2));
                          const month = parseInt(numbers.substring(2, 4));
                          const year = parseInt(numbers.substring(4, 8));

                          if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900) {
                            const newDate = new Date(year, month - 1, day);
                            setFormData({ ...formData, date: newDate });
                          }
                        } else if (text === '') {
                          setFormData({ ...formData, date: null });
                        }
                      }}
                      placeholder="dd/mm/aaaa"
                      placeholderTextColor={Colors.dark.textSecondary}
                      keyboardType="numeric"
                      maxLength={10}
                    />
                  </View>

                  <View style={[styles.formField, { flex: 1 }]}>
                    <Text style={styles.label}>Horário (hh:mm)</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.time ? format(formData.time, 'HH:mm') : ''}
                      onChangeText={(text) => {
                        // Remove tudo que não é número
                        const numbers = text.replace(/\D/g, '');

                        if (numbers.length === 4) {
                          // Tenta fazer parse do horário hh:mm
                          const hours = parseInt(numbers.substring(0, 2));
                          const minutes = parseInt(numbers.substring(2, 4));

                          if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
                            const newTime = new Date();
                            newTime.setHours(hours);
                            newTime.setMinutes(minutes);
                            setFormData({ ...formData, time: newTime });
                          }
                        } else if (text === '') {
                          setFormData({ ...formData, time: null });
                        }
                      }}
                      placeholder="hh:mm"
                      placeholderTextColor={Colors.dark.textSecondary}
                      keyboardType="numeric"
                      maxLength={5}
                    />
                  </View>
                </View>

                <View style={styles.formField}>
                  <Text style={styles.label}>Local</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.location}
                    onChangeText={(text) => setFormData({ ...formData, location: text })}
                    placeholder="Endereço do local"
                    placeholderTextColor={Colors.dark.textSecondary}
                  />
                </View>

                <View style={styles.formRow}>
                  <View style={[styles.formField, { flex: 1 }]}>
                    <Text style={styles.label}>Jogadores</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.numberPlayers}
                      onChangeText={(text) => setFormData({ ...formData, numberPlayers: text })}
                      placeholder="20"
                      keyboardType="numeric"
                      placeholderTextColor={Colors.dark.textSecondary}
                    />
                  </View>
                  <View style={[styles.formField, { flex: 1 }]}>
                    <Text style={styles.label}>Por Time</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.playersTeams}
                      onChangeText={(text) => setFormData({ ...formData, playersTeams: text })}
                      placeholder="10"
                      keyboardType="numeric"
                      placeholderTextColor={Colors.dark.textSecondary}
                    />
                  </View>
                </View>

                <View style={styles.formField}>
                  <Text style={styles.label}>Número de Times</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.numberTeams}
                    onChangeText={(text) => setFormData({ ...formData, numberTeams: text })}
                    placeholder="2"
                    keyboardType="numeric"
                    placeholderTextColor={Colors.dark.textSecondary}
                  />
                </View>

                <View style={styles.switchField}>
                  <Text style={styles.label}>Goleiro Dedicado</Text>
                  <Switch
                    value={formData.dedicatedGoalKeeper}
                    onValueChange={(value) => setFormData({ ...formData, dedicatedGoalKeeper: value })}
                    trackColor={{ false: '#767577', true: '#3B82F6' }}
                    thumbColor={formData.dedicatedGoalKeeper ? '#fff' : '#f4f3f4'}
                  />
                </View>

                <View style={styles.switchField}>
                  <Text style={styles.label}>Lista Liberada</Text>
                  <Switch
                    value={formData.listReleased}
                    onValueChange={(value) => setFormData({ ...formData, listReleased: value })}
                    trackColor={{ false: '#767577', true: '#3B82F6' }}
                    thumbColor={formData.listReleased ? '#fff' : '#f4f3f4'}
                  />
                </View>
              </View>

              <View style={styles.modalActions}>
                <Pressable
                  style={[styles.modalButton, styles.modalCancelButton]}
                  onPress={() => setShowCreate(false)}
                >
                  <Text style={styles.modalCancelButtonText}>Cancelar</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalButton, styles.modalSaveButton]}
                  onPress={confirmCreate}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.modalSaveButtonText}>Criar Jogo</Text>
                  )}
                </Pressable>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal de edição de jogo */}
      <Modal
        visible={showEdit}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEdit(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowEdit(false)}
        >
          <Pressable style={styles.formModalContent} onPress={(e) => e.stopPropagation()}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formHeader}>
                <Text style={styles.formTitle}>Editar Jogo</Text>
                <Pressable onPress={() => setShowEdit(false)}>
                  <MaterialIcons name="close" size={24} color={Colors.dark.text} />
                </Pressable>
              </View>

              <View style={styles.formFields}>
                <View style={styles.formRow}>
                  <View style={[styles.formField, { flex: 1 }]}>
                    <Text style={styles.label}>Data (dd/mm/aaaa)</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.date ? format(formData.date, 'dd/MM/yyyy') : ''}
                      onChangeText={(text) => {
                        // Remove tudo que não é número
                        const numbers = text.replace(/\D/g, '');

                        if (numbers.length === 8) {
                          // Tenta fazer parse da data dd/mm/yyyy
                          const day = parseInt(numbers.substring(0, 2));
                          const month = parseInt(numbers.substring(2, 4));
                          const year = parseInt(numbers.substring(4, 8));

                          if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900) {
                            const newDate = new Date(year, month - 1, day);
                            setFormData({ ...formData, date: newDate });
                          }
                        } else if (text === '') {
                          setFormData({ ...formData, date: null });
                        }
                      }}
                      placeholder="dd/mm/aaaa"
                      placeholderTextColor={Colors.dark.textSecondary}
                      keyboardType="numeric"
                      maxLength={10}
                    />
                  </View>

                  <View style={[styles.formField, { flex: 1 }]}>
                    <Text style={styles.label}>Horário (hh:mm)</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.time ? format(formData.time, 'HH:mm') : ''}
                      onChangeText={(text) => {
                        // Remove tudo que não é número
                        const numbers = text.replace(/\D/g, '');

                        if (numbers.length === 4) {
                          // Tenta fazer parse do horário hh:mm
                          const hours = parseInt(numbers.substring(0, 2));
                          const minutes = parseInt(numbers.substring(2, 4));

                          if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
                            const newTime = new Date();
                            newTime.setHours(hours);
                            newTime.setMinutes(minutes);
                            setFormData({ ...formData, time: newTime });
                          }
                        } else if (text === '') {
                          setFormData({ ...formData, time: null });
                        }
                      }}
                      placeholder="hh:mm"
                      placeholderTextColor={Colors.dark.textSecondary}
                      keyboardType="numeric"
                      maxLength={5}
                    />
                  </View>
                </View>

                <View style={styles.formField}>
                  <Text style={styles.label}>Local</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.location}
                    onChangeText={(text) => setFormData({ ...formData, location: text })}
                    placeholder="Endereço do local"
                    placeholderTextColor={Colors.dark.textSecondary}
                  />
                </View>

                <View style={styles.formRow}>
                  <View style={[styles.formField, { flex: 1 }]}>
                    <Text style={styles.label}>Jogadores</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.numberPlayers}
                      onChangeText={(text) => setFormData({ ...formData, numberPlayers: text })}
                      placeholder="20"
                      keyboardType="numeric"
                      placeholderTextColor={Colors.dark.textSecondary}
                    />
                  </View>
                  <View style={[styles.formField, { flex: 1 }]}>
                    <Text style={styles.label}>Por Time</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.playersTeams}
                      onChangeText={(text) => setFormData({ ...formData, playersTeams: text })}
                      placeholder="10"
                      keyboardType="numeric"
                      placeholderTextColor={Colors.dark.textSecondary}
                    />
                  </View>
                </View>

                <View style={styles.formField}>
                  <Text style={styles.label}>Número de Times</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.numberTeams}
                    onChangeText={(text) => setFormData({ ...formData, numberTeams: text })}
                    placeholder="2"
                    keyboardType="numeric"
                    placeholderTextColor={Colors.dark.textSecondary}
                  />
                </View>

                <View style={styles.switchField}>
                  <Text style={styles.label}>Goleiro Dedicado</Text>
                  <Switch
                    value={formData.dedicatedGoalKeeper}
                    onValueChange={(value) => setFormData({ ...formData, dedicatedGoalKeeper: value })}
                    trackColor={{ false: '#767577', true: '#3B82F6' }}
                    thumbColor={formData.dedicatedGoalKeeper ? '#fff' : '#f4f3f4'}
                  />
                </View>

                <View style={styles.switchField}>
                  <Text style={styles.label}>Lista Liberada</Text>
                  <Switch
                    value={formData.listReleased}
                    onValueChange={(value) => setFormData({ ...formData, listReleased: value })}
                    trackColor={{ false: '#767577', true: '#3B82F6' }}
                    thumbColor={formData.listReleased ? '#fff' : '#f4f3f4'}
                  />
                </View>
              </View>

              <View style={styles.modalActions}>
                <Pressable
                  style={[styles.modalButton, styles.modalCancelButton]}
                  onPress={() => setShowEdit(false)}
                >
                  <Text style={styles.modalCancelButtonText}>Cancelar</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalButton, styles.modalSaveButton]}
                  onPress={confirmEdit}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.modalSaveButtonText}>Salvar</Text>
                  )}
                </Pressable>
              </View>
            </ScrollView>
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
    formModalContent: {
      backgroundColor: Colors[scheme].card,
      borderRadius: 12,
      padding: 24,
      width: '90%',
      maxWidth: 500,
      maxHeight: '85%',
    },
    formHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
    },
    formTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: Colors[scheme].text,
    },
    formFields: {
      gap: 16,
      marginBottom: 24,
    },
    formRow: {
      flexDirection: 'row',
      gap: 12,
    },
    formField: {
      gap: 8,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: Colors[scheme].text,
    },
    input: {
      backgroundColor: Colors[scheme].backgroundSecondary,
      borderWidth: 1,
      borderColor: Colors[scheme].border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 14,
      color: Colors[scheme].text,
    },
    switchField: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
    },
    modalSaveButton: {
      backgroundColor: '#3B82F6',
    },
    modalSaveButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
    },
    datePickerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: Colors[scheme].backgroundSecondary,
      borderWidth: 1,
      borderColor: Colors[scheme].border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    datePickerText: {
      fontSize: 14,
      color: Colors[scheme].text,
      flex: 1,
    },
    pickerModalOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    pickerModalContent: {
      backgroundColor: Colors[scheme].card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingBottom: 20,
    },
    pickerHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: Colors[scheme].border,
    },
    pickerHeaderButton: {
      fontSize: 16,
      color: Colors[scheme].primary,
      minWidth: 80,
    },
    pickerHeaderButtonDone: {
      fontWeight: '600',
      textAlign: 'right',
    },
    pickerHeaderTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: Colors[scheme].text,
    },
  });
