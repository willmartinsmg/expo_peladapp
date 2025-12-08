import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { useAuth, useThemedStyles } from '@/hooks';
import { Colors } from '@/constants/theme';
import type { ColorScheme } from '@/types/theme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { apiClient } from '@/lib/api-client';
import type { Group } from '@/types/group';

export default function AdminGrupos() {
  const { activeGroup, selectGroup, refreshGroups } = useAuth();
  const styles = useThemedStyles(createStyles);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [creating, setCreating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalName, setModalName] = useState('');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingGroup, setDeletingGroup] = useState<Group | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchGroups = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get('organization').json<any[]>();
      const mappedGroups: Group[] = (data || []).map((g: any) => ({
        id: Number(g.id),
        name: g.name,
        isAdmin: !!g.admin,
      }));
      setGroups(mappedGroups);
    } catch (err: any) {
      setError(err?.message || 'Erro ao buscar grupos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreateModal = async () => {
    if (!modalName.trim()) return;
    setCreating(true);
    try {
      const newGroup = await apiClient
        .post('organization', {
          json: { name: modalName.trim() },
        })
        .json<any>();

      setModalName('');
      setIsModalOpen(false);

      // Atualizar lista local
      await fetchGroups();

      // Atualizar o contexto global e definir como grupo ativo
      await refreshGroups();
      await selectGroup({
        id: Number(newGroup.id),
        name: newGroup.name,
        isAdmin: true,
      });

      // Redirecionar para o dashboard
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err?.message || 'Erro ao criar grupo');
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (g: Group) => {
    setEditingId(g.id ?? null);
    setEditingName(g.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleSave = async () => {
    if (!editingId || !editingName.trim()) return;
    setSaving(true);
    try {
      await apiClient.put(`organization/${editingId}`, {
        json: { name: editingName.trim() },
      });
      cancelEdit();
      fetchGroups();
    } catch (err: any) {
      setError(err?.message || 'Erro ao atualizar grupo');
    } finally {
      setSaving(false);
    }
  };

  const handleManageGroup = async (g: Group) => {
    if (g.id) {
      await selectGroup({ id: g.id, name: g.name, isAdmin: g.isAdmin });
      router.push('/admin/usuarios');
    }
  };

  const openDeleteModal = (g: Group) => {
    setDeletingGroup(g);
  };

  const confirmDelete = async () => {
    if (!deletingGroup?.id) return;
    setDeleting(true);
    try {
      await apiClient.delete(`organization/${deletingGroup.id}`);
      setDeletingGroup(null);
      fetchGroups();
    } catch (err: any) {
      setError(err?.message || 'Erro ao excluir grupo');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Grupos',
          headerShown: true,
        }}
      />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Grupos</Text>
            <Text style={styles.subtitle}>
              Gerencie seus grupos e permissões
            </Text>
          </View>
          <Pressable
            style={styles.createButton}
            onPress={() => setIsModalOpen(true)}
          >
            <MaterialIcons name="add" size={20} color="#fff" />
            <Text style={styles.createButtonText}>Criar</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderText}>Lista de grupos</Text>
            <Text style={styles.cardHeaderCount}>Total: {groups.length}</Text>
          </View>

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.dark.primary} />
              <Text style={styles.loadingText}>Carregando...</Text>
            </View>
          )}

          {!loading && groups.length === 0 && (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="group" size={48} color={Colors.dark.textSecondary} />
              <Text style={styles.emptyText}>Nenhum grupo encontrado.</Text>
            </View>
          )}

          {!loading &&
            groups.map((g) => (
              <View key={g.id} style={styles.groupItem}>
                {editingId === g.id ? (
                  <View style={styles.groupEditContainer}>
                    <View style={styles.groupEditHeader}>
                      <View style={styles.groupAvatar}>
                        <Text style={styles.groupAvatarText}>
                          {g.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <TextInput
                        style={styles.groupInput}
                        value={editingName}
                        onChangeText={setEditingName}
                        autoFocus
                        placeholder="Nome do grupo"
                        placeholderTextColor={Colors.dark.textSecondary}
                      />
                    </View>
                    <View style={styles.groupEditActions}>
                      <Pressable
                        style={[styles.editActionButton, styles.cancelEditButton]}
                        onPress={cancelEdit}
                      >
                        <MaterialIcons name="close" size={18} color="#666" />
                        <Text style={styles.cancelEditButtonText}>Cancelar</Text>
                      </Pressable>
                      <Pressable
                        style={[styles.editActionButton, styles.saveEditButton]}
                        onPress={handleSave}
                        disabled={saving}
                      >
                        {saving ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <>
                            <MaterialIcons name="check" size={18} color="#fff" />
                            <Text style={styles.saveEditButtonText}>Salvar</Text>
                          </>
                        )}
                      </Pressable>
                    </View>
                  </View>
                ) : (
                  <>
                    <View style={styles.groupContent}>
                      <View
                        style={[
                          styles.groupAvatar,
                          g.isAdmin && styles.groupAvatarAdmin,
                        ]}
                      >
                        <Text style={styles.groupAvatarText}>
                          {g.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.groupInfo}>
                        <Text style={styles.groupName} numberOfLines={1}>
                          {g.name}
                        </Text>
                        <View style={styles.groupBadgeContainer}>
                          <View
                            style={[
                              styles.groupBadge,
                              g.isAdmin ? styles.adminBadge : styles.memberBadge,
                            ]}
                          >
                            <MaterialIcons
                              name={g.isAdmin ? 'shield' : 'person'}
                              size={12}
                              color={g.isAdmin ? '#F59E0B' : '#6B7280'}
                            />
                            <Text
                              style={[
                                styles.groupBadgeText,
                                g.isAdmin ? styles.adminBadgeText : styles.memberBadgeText,
                              ]}
                            >
                              {g.isAdmin ? 'Admin' : 'Membro'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                    {g.isAdmin && (
                      <View style={styles.groupActions}>
                        <Pressable
                          style={styles.manageButton}
                          onPress={() => handleManageGroup(g)}
                        >
                          <MaterialIcons name="settings" size={18} color="#6366F1" />
                          <Text style={styles.manageButtonText}>Gerenciar</Text>
                        </Pressable>
                        <View style={styles.groupSecondaryActions}>
                          <Pressable
                            style={styles.iconButton}
                            onPress={() => startEdit(g)}
                          >
                            <MaterialIcons name="edit" size={20} color="#F59E0B" />
                          </Pressable>
                          <Pressable
                            style={styles.iconButton}
                            onPress={() => openDeleteModal(g)}
                          >
                            <MaterialIcons name="delete" size={20} color="#EF4444" />
                          </Pressable>
                        </View>
                      </View>
                    )}
                  </>
                )}
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

      {/* Modal criar grupo */}
      <Modal
        visible={isModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalOpen(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsModalOpen(false)}
        >
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Criar grupo</Text>
            <TextInput
              style={styles.modalInput}
              value={modalName}
              onChangeText={setModalName}
              placeholder="Nome do grupo"
              placeholderTextColor={Colors.dark.textSecondary}
              autoFocus
            />
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setIsModalOpen(false)}
              >
                <MaterialIcons name="close" size={20} color="#666" />
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={handleCreateModal}
                disabled={creating}
              >
                {creating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <MaterialIcons name="add" size={20} color="#fff" />
                    <Text style={styles.modalSaveButtonText}>Salvar</Text>
                  </>
                )}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal deletar grupo */}
      <Modal
        visible={!!deletingGroup}
        transparent
        animationType="fade"
        onRequestClose={() => setDeletingGroup(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setDeletingGroup(null)}
        >
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.deleteModalHeader}>
              <View style={styles.warningIcon}>
                <MaterialIcons name="warning" size={24} color="#F59E0B" />
              </View>
              <View style={styles.deleteModalText}>
                <Text style={styles.modalTitle}>Confirmar exclusão</Text>
                <Text style={styles.deleteModalDescription}>
                  Deseja excluir o grupo{' '}
                  <Text style={styles.deleteModalGroupName}>
                    {deletingGroup?.name}
                  </Text>
                  ? Esta ação não pode ser desfeita.
                </Text>
              </View>
            </View>
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setDeletingGroup(null)}
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
                  <Text style={styles.modalDeleteButtonText}>Excluir</Text>
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
      backgroundColor: '#10B981',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
    },
    createButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
    },
    card: {
      backgroundColor: Colors[scheme].card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: Colors[scheme].border,
      overflow: 'hidden',
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: Colors[scheme].border,
    },
    cardHeaderText: {
      fontSize: 14,
      color: Colors[scheme].textSecondary,
    },
    cardHeaderCount: {
      fontSize: 12,
      color: Colors[scheme].textSecondary,
    },
    loadingContainer: {
      padding: 32,
      alignItems: 'center',
      gap: 12,
    },
    loadingText: {
      fontSize: 14,
      color: Colors[scheme].textSecondary,
    },
    emptyContainer: {
      padding: 48,
      alignItems: 'center',
      gap: 12,
    },
    emptyText: {
      fontSize: 14,
      color: Colors[scheme].textSecondary,
    },
    groupItem: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: Colors[scheme].border,
    },
    groupContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 12,
    },
    groupInfo: {
      flex: 1,
      gap: 6,
    },
    groupAvatar: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: '#10B981',
      alignItems: 'center',
      justifyContent: 'center',
    },
    groupAvatarAdmin: {
      backgroundColor: '#F59E0B',
    },
    groupAvatarText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#fff',
    },
    groupName: {
      fontSize: 17,
      fontWeight: '600',
      color: Colors[scheme].text,
      lineHeight: 22,
    },
    groupBadgeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    groupBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    adminBadge: {
      backgroundColor: '#FEF3C7',
    },
    memberBadge: {
      backgroundColor: Colors[scheme].backgroundSecondary,
    },
    groupBadgeText: {
      fontSize: 12,
      fontWeight: '600',
    },
    adminBadgeText: {
      color: '#92400E',
    },
    memberBadgeText: {
      color: Colors[scheme].textSecondary,
    },
    groupActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12,
    },
    manageButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      flex: 1,
      backgroundColor: '#EEF2FF',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#C7D2FE',
    },
    manageButtonText: {
      color: '#6366F1',
      fontSize: 14,
      fontWeight: '600',
    },
    groupSecondaryActions: {
      flexDirection: 'row',
      gap: 8,
    },
    iconButton: {
      width: 40,
      height: 40,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: Colors[scheme].backgroundSecondary,
    },
    groupEditContainer: {
      gap: 12,
    },
    groupEditHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    groupInput: {
      flex: 1,
      fontSize: 16,
      fontWeight: '500',
      color: Colors[scheme].text,
      borderWidth: 1,
      borderColor: Colors[scheme].border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: Colors[scheme].background,
    },
    groupEditActions: {
      flexDirection: 'row',
      gap: 8,
      justifyContent: 'flex-end',
    },
    editActionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
    },
    cancelEditButton: {
      backgroundColor: Colors[scheme].backgroundSecondary,
    },
    cancelEditButtonText: {
      color: Colors[scheme].text,
      fontSize: 14,
      fontWeight: '600',
    },
    saveEditButton: {
      backgroundColor: '#3B82F6',
    },
    saveEditButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
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
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: Colors[scheme].text,
      marginBottom: 16,
    },
    modalInput: {
      fontSize: 16,
      color: Colors[scheme].text,
      borderWidth: 1,
      borderColor: Colors[scheme].border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginBottom: 16,
      backgroundColor: Colors[scheme].background,
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
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    modalCancelButton: {
      backgroundColor: Colors[scheme].backgroundSecondary,
    },
    modalCancelButtonText: {
      color: Colors[scheme].text,
      fontSize: 14,
      fontWeight: '600',
    },
    modalSaveButton: {
      backgroundColor: '#10B981',
    },
    modalSaveButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
    },
    deleteModalHeader: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
    },
    warningIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: '#FEF3C7',
      alignItems: 'center',
      justifyContent: 'center',
    },
    deleteModalText: {
      flex: 1,
    },
    deleteModalDescription: {
      fontSize: 14,
      color: Colors[scheme].textSecondary,
      marginTop: 4,
      lineHeight: 20,
    },
    deleteModalGroupName: {
      fontWeight: '600',
      color: Colors[scheme].text,
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
