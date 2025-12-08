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
  Alert,
} from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { useAuth, useThemedStyles } from '@/hooks';
import { Colors } from '@/constants/theme';
import type { ColorScheme } from '@/types/theme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { apiClient } from '@/lib/api-client';
import { format, parseISO, addMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AttendanceRecord {
  id: number;
  matchdayId: number;
  userId: number;
  playerId?: number;
  playerName?: string;
  playerEmail?: string;
  timeConfirmed: string;
  confirmed: boolean;
  goalkeeper: boolean;
  level?: number;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

interface Matchday {
  id: number;
  organizationId: number;
  date: string;
  numberPlayers: number;
  dedicatedGoalKeeper: boolean;
  location?: string;
}

interface GroupUser {
  id: number;
  name: string;
  email: string;
}

type StatusBadgeProps = {
  status: 'confirmed' | 'waiting' | 'canceled';
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const styles = useThemedStyles(createStyles);

  const config = {
    confirmed: {
      label: 'CONFIRMADO',
      backgroundColor: '#D1FAE5',
      textColor: '#065F46',
    },
    waiting: {
      label: 'LISTA ESPERA',
      backgroundColor: '#FEF3C7',
      textColor: '#92400E',
    },
    canceled: {
      label: 'DESISTIU',
      backgroundColor: '#E5E7EB',
      textColor: '#374151',
    },
  };

  const { label, backgroundColor, textColor } = config[status];

  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Text style={[styles.badgeText, { color: textColor }]}>{label}</Text>
    </View>
  );
};

export default function ListaPresenca() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const matchdayId = parseInt(id || '0');
  const { activeGroup } = useAuth();
  const styles = useThemedStyles(createStyles);

  const [matchday, setMatchday] = useState<Matchday | null>(null);
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [groupUsers, setGroupUsers] = useState<GroupUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);

  // Form states
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isGoalkeeper, setIsGoalkeeper] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(true);
  const [editingAttendance, setEditingAttendance] = useState<AttendanceRecord | null>(null);
  const [editName, setEditName] = useState('');
  const [editTime, setEditTime] = useState('');
  const [actionAttendance, setActionAttendance] = useState<AttendanceRecord | null>(null);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [matchdayId]);

  const fetchData = async () => {
    if (!matchdayId) return;
    setLoading(true);
    setError(null);
    try {
      const [matchdayRes, attendancesRes, usersRes] = await Promise.all([
        apiClient.get(`matchday/${matchdayId}`).json<Matchday>(),
        apiClient.get(`attendance-list/matchday/${matchdayId}`).json<AttendanceRecord[]>(),
        apiClient.get(`organization/users/${activeGroup?.id}`).json<GroupUser[]>(),
      ]);
      setMatchday(matchdayRes);
      setAttendances(attendancesRes || []);
      setGroupUsers(usersRes || []);
    } catch (err: any) {
      setError(err?.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const confirmedList = attendances
    .filter((a) => a.confirmed)
    .sort((a, b) => new Date(a.timeConfirmed).getTime() - new Date(b.timeConfirmed).getTime());

  const canceledList = attendances.filter((a) => !a.confirmed);

  const confirmedCount = confirmedList.length;
  const waitingCount = Math.max(0, confirmedList.length - (matchday?.numberPlayers || 0));
  const canceledCount = canceledList.length;

  const getStatusBadge = (attendance: AttendanceRecord) => {
    if (!attendance.confirmed) return 'canceled';
    const index = confirmedList.findIndex((a) => a.id === attendance.id);
    if (index < (matchday?.numberPlayers || 0)) {
      return 'confirmed';
    }
    return 'waiting';
  };

  const handleAddPlayer = async () => {
    if (!selectedUserId) return;
    setSubmitting(true);
    try {
      await apiClient.post('attendance-list', {
        json: {
          matchdayId,
          userId: selectedUserId,
          goalkeeper: isGoalkeeper,
          confirmed: isConfirmed,
        },
      });
      setShowAddModal(false);
      setSelectedUserId(null);
      setIsGoalkeeper(false);
      setIsConfirmed(true);
      fetchData();
    } catch (err: any) {
      setError(err?.message || 'Erro ao adicionar jogador');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditPlayer = async () => {
    if (!editingAttendance) return;
    setSubmitting(true);
    try {
      await apiClient.patch(`attendance-list/${editingAttendance.id}`, {
        json: {
          playerName: editName,
          timeConfirmed: editTime,
        },
      });
      setShowEditModal(false);
      setEditingAttendance(null);
      fetchData();
    } catch (err: any) {
      setError(err?.message || 'Erro ao editar jogador');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmToggle = async () => {
    if (!actionAttendance) return;
    setSubmitting(true);
    try {
      await apiClient.patch(`attendance-list/${actionAttendance.id}`, {
        json: {
          confirmed: !actionAttendance.confirmed,
        },
      });
      setShowConfirmModal(false);
      setActionAttendance(null);
      fetchData();
    } catch (err: any) {
      setError(err?.message || 'Erro ao atualizar confirmação');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemovePlayer = async () => {
    if (!actionAttendance) return;
    setSubmitting(true);
    try {
      await apiClient.delete(`attendance-list/${actionAttendance.id}`);
      setShowRemoveModal(false);
      setActionAttendance(null);
      fetchData();
    } catch (err: any) {
      setError(err?.message || 'Erro ao remover jogador');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetLevel = async (attendance: AttendanceRecord, level: number) => {
    try {
      await apiClient.patch(`attendance-list/${attendance.id}`, {
        json: { level },
      });
      fetchData();
    } catch (err: any) {
      setError(err?.message || 'Erro ao definir nível');
    }
  };

  const openEditModal = (attendance: AttendanceRecord) => {
    setEditingAttendance(attendance);
    setEditName(attendance.playerName || attendance.user?.name || '');
    setEditTime(attendance.timeConfirmed);
    setShowEditModal(true);
  };

  const openConfirmModal = (attendance: AttendanceRecord) => {
    setActionAttendance(attendance);
    setShowConfirmModal(true);
  };

  const openRemoveModal = (attendance: AttendanceRecord) => {
    setActionAttendance(attendance);
    setShowRemoveModal(true);
  };

  const formatDateTime = (dateString: string) => {
    const d = parseISO(dateString);
    const adjusted = addMinutes(d, d.getTimezoneOffset());
    return format(adjusted, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const formatTime = (dateString: string) => {
    const d = parseISO(dateString);
    const adjusted = addMinutes(d, d.getTimezoneOffset());
    return format(adjusted, 'HH:mm', { locale: ptBR });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Lista de Presença', headerShown: true }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.dark.primary} />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Lista de Presença', headerShown: true }} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {matchday && (
          <View style={styles.matchdayInfo}>
            <Text style={styles.matchdayTitle}>Jogo - {formatDateTime(matchday.date)}</Text>
            {matchday.location && (
              <View style={styles.locationRow}>
                <MaterialIcons name="location-on" size={16} color={Colors.dark.textSecondary} />
                <Text style={styles.locationText}>{matchday.location}</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.summaryCards}>
          <View style={[styles.summaryCard, { backgroundColor: '#D1FAE5' }]}>
            <Text style={[styles.summaryNumber, { color: '#065F46' }]}>
              {confirmedCount - waitingCount}
            </Text>
            <Text style={[styles.summaryLabel, { color: '#065F46' }]}>Confirmados</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: '#FEF3C7' }]}>
            <Text style={[styles.summaryNumber, { color: '#92400E' }]}>{waitingCount}</Text>
            <Text style={[styles.summaryLabel, { color: '#92400E' }]}>Lista Espera</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: '#E5E7EB' }]}>
            <Text style={[styles.summaryNumber, { color: '#374151' }]}>{canceledCount}</Text>
            <Text style={[styles.summaryLabel, { color: '#374151' }]}>Desistências</Text>
          </View>
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Jogadores</Text>
          <Pressable
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <MaterialIcons name="add" size={20} color="#fff" />
            <Text style={styles.addButtonText}>Adicionar</Text>
          </Pressable>
        </View>

        <View style={styles.attendanceList}>
          {[...confirmedList, ...canceledList].map((attendance) => {
            const displayName = attendance.playerName || attendance.user?.name || 'Sem nome';
            const status = getStatusBadge(attendance);

            return (
              <View key={attendance.id} style={styles.attendanceCard}>
                <View style={styles.attendanceHeader}>
                  <View style={styles.playerInfo}>
                    <Text style={styles.playerName}>{displayName}</Text>
                    <Text style={styles.playerTime}>
                      Confirmado às {formatTime(attendance.timeConfirmed)}
                    </Text>
                  </View>
                  <StatusBadge status={status} />
                </View>

                {attendance.goalkeeper && (
                  <View style={styles.goalkeeperBadge}>
                    <MaterialIcons name="sports-soccer" size={14} color="#3B82F6" />
                    <Text style={styles.goalkeeperText}>Goleiro</Text>
                  </View>
                )}

                <View style={styles.starsRow}>
                  <Text style={styles.starsLabel}>Nível:</Text>
                  <View style={styles.stars}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Pressable key={n} onPress={() => handleSetLevel(attendance, n)}>
                        <MaterialIcons
                          name="star"
                          size={24}
                          color={(attendance.level || 0) >= n ? '#F59E0B' : '#D1D5DB'}
                        />
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View style={styles.attendanceActions}>
                  <Pressable
                    style={styles.actionBtn}
                    onPress={() => openEditModal(attendance)}
                  >
                    <MaterialIcons name="edit" size={18} color="#F59E0B" />
                    <Text style={styles.actionBtnText}>Editar</Text>
                  </Pressable>

                  <Pressable
                    style={styles.actionBtn}
                    onPress={() => openConfirmModal(attendance)}
                  >
                    <MaterialIcons
                      name={attendance.confirmed ? 'cancel' : 'check-circle'}
                      size={18}
                      color={attendance.confirmed ? '#EF4444' : '#10B981'}
                    />
                    <Text style={styles.actionBtnText}>
                      {attendance.confirmed ? 'Desistir' : 'Confirmar'}
                    </Text>
                  </Pressable>

                  <Pressable
                    style={styles.actionBtn}
                    onPress={() => openRemoveModal(attendance)}
                  >
                    <MaterialIcons name="delete" size={18} color="#EF4444" />
                    <Text style={styles.actionBtnText}>Remover</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>

        {attendances.length === 0 && !loading && (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="list-alt" size={64} color={Colors.dark.textSecondary} />
            <Text style={styles.emptyTitle}>Nenhum jogador na lista</Text>
            <Text style={styles.emptyText}>Adicione o primeiro jogador</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error" size={20} color={Colors.dark.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>

      {/* Add Player Modal */}
      <Modal visible={showAddModal} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowAddModal(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Adicionar Jogador</Text>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Selecione o jogador</Text>
              <ScrollView style={styles.userList}>
                {groupUsers.map((user) => (
                  <Pressable
                    key={user.id}
                    style={[
                      styles.userItem,
                      selectedUserId === user.id && styles.userItemSelected,
                    ]}
                    onPress={() => setSelectedUserId(user.id)}
                  >
                    <Text
                      style={[
                        styles.userName,
                        selectedUserId === user.id && styles.userNameSelected,
                      ]}
                    >
                      {user.name}
                    </Text>
                    {selectedUserId === user.id && (
                      <MaterialIcons name="check" size={20} color="#3B82F6" />
                    )}
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <View style={styles.checkboxRow}>
              <Pressable
                style={styles.checkbox}
                onPress={() => setIsGoalkeeper(!isGoalkeeper)}
              >
                <MaterialIcons
                  name={isGoalkeeper ? 'check-box' : 'check-box-outline-blank'}
                  size={24}
                  color={isGoalkeeper ? '#3B82F6' : Colors.dark.textSecondary}
                />
                <Text style={styles.checkboxLabel}>Goleiro</Text>
              </Pressable>
            </View>

            <View style={styles.checkboxRow}>
              <Pressable
                style={styles.checkbox}
                onPress={() => setIsConfirmed(!isConfirmed)}
              >
                <MaterialIcons
                  name={isConfirmed ? 'check-box' : 'check-box-outline-blank'}
                  size={24}
                  color={isConfirmed ? '#3B82F6' : Colors.dark.textSecondary}
                />
                <Text style={styles.checkboxLabel}>Confirmado</Text>
              </Pressable>
            </View>

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => {
                  setShowAddModal(false);
                  setSelectedUserId(null);
                  setIsGoalkeeper(false);
                  setIsConfirmed(true);
                }}
              >
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalSubmitButton]}
                onPress={handleAddPlayer}
                disabled={!selectedUserId || submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalSubmitButtonText}>Adicionar</Text>
                )}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Edit Player Modal */}
      <Modal visible={showEditModal} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowEditModal(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Editar Jogador</Text>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Nome</Text>
              <TextInput
                style={styles.input}
                value={editName}
                onChangeText={setEditName}
                placeholder="Nome do jogador"
                placeholderTextColor={Colors.dark.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Horário de Confirmação</Text>
              <TextInput
                style={styles.input}
                value={editTime}
                onChangeText={setEditTime}
                placeholder="YYYY-MM-DDTHH:mm:ss"
                placeholderTextColor={Colors.dark.textSecondary}
              />
            </View>

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => {
                  setShowEditModal(false);
                  setEditingAttendance(null);
                }}
              >
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalSubmitButton]}
                onPress={handleEditPlayer}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalSubmitButtonText}>Salvar</Text>
                )}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Confirm/Cancel Modal */}
      <Modal visible={showConfirmModal} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowConfirmModal(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.confirmModalHeader}>
              <View style={styles.confirmIcon}>
                <MaterialIcons
                  name={actionAttendance?.confirmed ? 'cancel' : 'check-circle'}
                  size={32}
                  color={actionAttendance?.confirmed ? '#EF4444' : '#10B981'}
                />
              </View>
              <View style={styles.confirmModalText}>
                <Text style={styles.modalTitle}>
                  {actionAttendance?.confirmed ? 'Marcar desistência' : 'Confirmar presença'}
                </Text>
                <Text style={styles.modalDescription}>
                  {actionAttendance?.confirmed
                    ? 'Tem certeza que deseja marcar este jogador como desistente?'
                    : 'Tem certeza que deseja confirmar a presença deste jogador?'}
                </Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => {
                  setShowConfirmModal(false);
                  setActionAttendance(null);
                }}
              >
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalSubmitButton]}
                onPress={handleConfirmToggle}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalSubmitButtonText}>Confirmar</Text>
                )}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Remove Player Modal */}
      <Modal visible={showRemoveModal} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowRemoveModal(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.confirmModalHeader}>
              <View style={[styles.confirmIcon, { backgroundColor: '#FEE2E2' }]}>
                <MaterialIcons name="warning" size={32} color="#EF4444" />
              </View>
              <View style={styles.confirmModalText}>
                <Text style={styles.modalTitle}>Remover jogador</Text>
                <Text style={styles.modalDescription}>
                  Tem certeza que deseja remover este jogador da lista? Esta ação não pode ser
                  desfeita.
                </Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => {
                  setShowRemoveModal(false);
                  setActionAttendance(null);
                }}
              >
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalDeleteButton]}
                onPress={handleRemovePlayer}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalDeleteButtonText}>Remover</Text>
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
    matchdayInfo: {
      marginBottom: 16,
      gap: 8,
    },
    matchdayTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: Colors[scheme].text,
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    locationText: {
      fontSize: 14,
      color: Colors[scheme].textSecondary,
    },
    summaryCards: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 24,
    },
    summaryCard: {
      flex: 1,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      gap: 4,
    },
    summaryNumber: {
      fontSize: 32,
      fontWeight: 'bold',
    },
    summaryLabel: {
      fontSize: 12,
      fontWeight: '600',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: Colors[scheme].text,
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: '#3B82F6',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
    },
    addButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
    },
    attendanceList: {
      gap: 12,
    },
    attendanceCard: {
      backgroundColor: Colors[scheme].card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: Colors[scheme].border,
      padding: 16,
      gap: 12,
    },
    attendanceHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    playerInfo: {
      flex: 1,
      gap: 4,
    },
    playerName: {
      fontSize: 16,
      fontWeight: '600',
      color: Colors[scheme].text,
    },
    playerTime: {
      fontSize: 13,
      color: Colors[scheme].textSecondary,
    },
    badge: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: '700',
    },
    goalkeeperBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      alignSelf: 'flex-start',
      backgroundColor: '#DBEAFE',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
    },
    goalkeeperText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#1E40AF',
    },
    starsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    starsLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: Colors[scheme].text,
    },
    stars: {
      flexDirection: 'row',
      gap: 4,
    },
    attendanceActions: {
      flexDirection: 'row',
      gap: 8,
      paddingTop: 4,
      flexWrap: 'wrap',
    },
    actionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: Colors[scheme].backgroundSecondary,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
    },
    actionBtnText: {
      fontSize: 13,
      fontWeight: '600',
      color: Colors[scheme].text,
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
      maxHeight: '80%',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: Colors[scheme].text,
      marginBottom: 16,
    },
    formGroup: {
      marginBottom: 16,
    },
    formLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: Colors[scheme].text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: Colors[scheme].backgroundSecondary,
      borderWidth: 1,
      borderColor: Colors[scheme].border,
      borderRadius: 8,
      padding: 12,
      fontSize: 14,
      color: Colors[scheme].text,
    },
    userList: {
      maxHeight: 200,
      borderWidth: 1,
      borderColor: Colors[scheme].border,
      borderRadius: 8,
    },
    userItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: Colors[scheme].border,
    },
    userItemSelected: {
      backgroundColor: Colors[scheme].backgroundSecondary,
    },
    userName: {
      fontSize: 14,
      color: Colors[scheme].text,
    },
    userNameSelected: {
      fontWeight: '600',
      color: '#3B82F6',
    },
    checkboxRow: {
      marginBottom: 16,
    },
    checkbox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    checkboxLabel: {
      fontSize: 14,
      color: Colors[scheme].text,
    },
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 8,
      marginTop: 8,
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
    modalSubmitButton: {
      backgroundColor: '#3B82F6',
    },
    modalSubmitButtonText: {
      color: '#fff',
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
    confirmModalHeader: {
      flexDirection: 'row',
      gap: 16,
      marginBottom: 24,
    },
    confirmIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: '#D1FAE5',
      alignItems: 'center',
      justifyContent: 'center',
    },
    confirmModalText: {
      flex: 1,
    },
    modalDescription: {
      fontSize: 14,
      color: Colors[scheme].textSecondary,
      lineHeight: 20,
      marginTop: 8,
    },
  });
