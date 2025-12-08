import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
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
      Alert.alert('Sucesso', 'Grupo criado com sucesso!');
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err?.message || 'Erro ao criar grupo');
      Alert.alert('Erro', err?.message || 'Erro ao criar grupo');
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
      Alert.alert('Sucesso', 'Grupo atualizado com sucesso!');
    } catch (err: any) {
      setError(err?.message || 'Erro ao atualizar grupo');
      Alert.alert('Erro', err?.message || 'Erro ao atualizar grupo');
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
      Alert.alert('Sucesso', 'Grupo excluído com sucesso!');
    } catch (err: any) {
      setError(err?.message || 'Erro ao excluir grupo');
      Alert.alert('Erro', err?.message || 'Erro ao excluir grupo');
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
                <View style={styles.groupInfo}>
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
                  <View style={styles.groupDetails}>
                    {editingId === g.id ? (
                      <TextInput
                        style={styles.groupInput}
                        value={editingName}
                        onChangeText={setEditingName}
                        autoFocus
                      />
                    ) : (
                      <Text style={styles.groupName}>{g.name}</Text>
                    )}
                    <Text style={styles.groupRole}>
                      {g.isAdmin ? 'Admin' : 'Membro'}
                    </Text>
                  </View>
                </View>

                <View style={styles.groupActions}>
                  {editingId === g.id ? (
                    <>
                      <Pressable
                        style={[styles.actionButton, styles.saveButton]}
                        onPress={handleSave}
                        disabled={saving}
                      >
                        {saving ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <MaterialIcons name="save" size={20} color="#fff" />
                        )}
                      </Pressable>
                      <Pressable
                        style={[styles.actionButton, styles.cancelButton]}
                        onPress={cancelEdit}
                      >
                        <MaterialIcons name="close" size={20} color="#666" />
                      </Pressable>
                    </>
                  ) : (
                    <>
                      {g.isAdmin && (
                        <>
                          <Pressable
                            style={[styles.actionButton, styles.manageButton]}
                            onPress={() => handleManageGroup(g)}
                          >
                            <Text style={styles.manageButtonText}>
                              Gerenciar
                            </Text>
                          </Pressable>
                          <Pressable
                            style={[styles.actionButton, styles.editButton]}
                            onPress={() => startEdit(g)}
                          >
                            <MaterialIcons name="edit" size={20} color="#fff" />
                          </Pressable>
                          <Pressable
                            style={[styles.actionButton, styles.deleteButton]}
                            onPress={() => openDeleteModal(g)}
                          >
                            <MaterialIcons name="delete" size={20} color="#fff" />
                          </Pressable>
                        </>
                      )}
                    </>
                  )}
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
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: Colors[scheme].border,
    },
    groupInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },
    groupAvatar: {
      width: 40,
      height: 40,
      borderRadius: 8,
      backgroundColor: '#10B981',
      alignItems: 'center',
      justifyContent: 'center',
    },
    groupAvatarAdmin: {
      backgroundColor: '#F59E0B',
    },
    groupAvatarText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#fff',
    },
    groupDetails: {
      flex: 1,
    },
    groupName: {
      fontSize: 16,
      fontWeight: '500',
      color: Colors[scheme].text,
      marginBottom: 2,
    },
    groupRole: {
      fontSize: 12,
      color: Colors[scheme].textSecondary,
    },
    groupInput: {
      fontSize: 16,
      fontWeight: '500',
      color: Colors[scheme].text,
      borderWidth: 1,
      borderColor: Colors[scheme].border,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 4,
      backgroundColor: Colors[scheme].background,
    },
    groupActions: {
      flexDirection: 'row',
      gap: 8,
    },
    actionButton: {
      width: 36,
      height: 36,
      borderRadius: 6,
      alignItems: 'center',
      justifyContent: 'center',
    },
    manageButton: {
      backgroundColor: '#6366F1',
      paddingHorizontal: 12,
      width: 'auto',
    },
    manageButtonText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '600',
    },
    editButton: {
      backgroundColor: '#F59E0B',
    },
    deleteButton: {
      backgroundColor: '#EF4444',
    },
    saveButton: {
      backgroundColor: '#3B82F6',
    },
    cancelButton: {
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
