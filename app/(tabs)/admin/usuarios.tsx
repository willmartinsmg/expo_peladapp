import { Colors } from "@/constants/theme";
import { useAuth, useThemedStyles } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import type { ColorScheme } from "@/types/theme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

interface User {
  id: number;
  name: string;
  email: string;
  admin?: boolean;
}

export default function GestaoUsuariosGrupo() {
  const { activeGroup } = useAuth();
  const styles = useThemedStyles(createStyles);
  const groupId = activeGroup?.id;

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para adicionar usuario
  const [showAddModal, setShowAddModal] = useState(false);
  const [emailToAdd, setEmailToAdd] = useState("");
  const [addingUser, setAddingUser] = useState(false);

  // Estados para remocao
  const [userToRemove, setUserToRemove] = useState<User | null>(null);
  const [removingUser, setRemovingUser] = useState(false);

  // Estados para tornar admin
  const [settingAdmin, setSettingAdmin] = useState<number | null>(null);

  // Estados para remover admin
  const [removingAdmin, setRemovingAdmin] = useState<number | null>(null);

  useEffect(() => {
    if (groupId) {
      fetchUsers();
    }
  }, [groupId]);

  const fetchUsers = async () => {
    if (!groupId) return;

    try {
      setLoading(true);
      const response = await apiClient
        .get(`organization/users/${groupId}`)
        .json<User[]>();
      setUsers(response);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!emailToAdd.trim() || !groupId) return;

    try {
      setAddingUser(true);
      await apiClient.post("organization/add-member", {
        json: {
          email: emailToAdd.trim(),
          organizationId: Number(groupId),
        },
      });

      setEmailToAdd("");
      setShowAddModal(false);
      await fetchUsers();
    } catch (error: any) {
      console.error("Erro ao adicionar usuário:", error);
    } finally {
      setAddingUser(false);
    }
  };

  const handleRemoveUser = async () => {
    if (!userToRemove || !groupId) return;

    try {
      setRemovingUser(true);
      await apiClient.post("organization/remove-member", {
        json: {
          userId: userToRemove.id,
          organizationId: Number(groupId),
        },
      });

      setUserToRemove(null);
      await fetchUsers();
    } catch (error: any) {
      console.error("Erro ao remover usuário:", error);
    } finally {
      setRemovingUser(false);
    }
  };

  const handleSetAdmin = async (user: User) => {
    if (!groupId) return;

    try {
      setSettingAdmin(user.id);
      await apiClient.post("organization/set-admin", {
        json: {
          userId: user.id,
          organizationId: Number(groupId),
        },
      });

      await fetchUsers();
    } catch (error: any) {
      console.error("Erro ao definir admin:", error);
    } finally {
      setSettingAdmin(null);
    }
  };

  const handleRemoveAdmin = async (user: User) => {
    if (!groupId) return;

    // Verificar se há mais de um admin
    const adminCount = users.filter((u) => u.admin).length;
    if (adminCount <= 1) {
      return;
    }

    try {
      setRemovingAdmin(user.id);
      await apiClient.post("organization/remove-admin", {
        json: {
          userId: user.id,
          organizationId: Number(groupId),
        },
      });

      await fetchUsers();
    } catch (error: any) {
      console.error("Erro ao remover admin:", error);
    } finally {
      setRemovingAdmin(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: "Gerenciar Usuários",
            headerShown: true,
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.dark.primary} />
          <Text style={styles.loadingText}>Carregando usuários...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Gerenciar Usuários",
          headerShown: true,
        }}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Gerenciar Usuários</Text>
            <Text style={styles.subtitle}>
              Grupo: <Text style={styles.groupName}>{activeGroup?.name}</Text>
            </Text>
          </View>
          <Pressable
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <MaterialIcons name="person-add" size={20} color="#fff" />
            <Text style={styles.addButtonText}>Adicionar</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderText}>
              Lista de usuários do grupo
            </Text>
            <Text style={styles.cardHeaderCount}>Total: {users.length}</Text>
          </View>

          {users.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons
                name="people"
                size={48}
                color={Colors.dark.textSecondary}
              />
              <Text style={styles.emptyText}>
                Nenhum usuário encontrado neste grupo.
              </Text>
            </View>
          ) : (
            users.map((user) => (
              <View
                key={user.id}
                style={[styles.userItem, user.admin && styles.userItemAdmin]}
              >
                <View style={styles.userContent}>
                  <View style={styles.userHeader}>
                    <View
                      style={[
                        styles.userAvatar,
                        user.admin && styles.userAvatarAdmin,
                      ]}
                    >
                      {user.admin ? (
                        <MaterialIcons name="star" size={20} color="#F59E0B" />
                      ) : (
                        <Text style={styles.userAvatarText}>
                          {user.name?.charAt(0)?.toUpperCase() ||
                            user.email.charAt(0).toUpperCase()}
                        </Text>
                      )}
                    </View>
                    <View style={styles.userInfo}>
                      <Text style={styles.userName} numberOfLines={1}>
                        {user.name || "Sem nome"}
                      </Text>
                      {user.admin && (
                        <View style={styles.adminBadge}>
                          <MaterialIcons
                            name="shield"
                            size={10}
                            color="#F59E0B"
                          />
                          <Text style={styles.adminBadgeText}>Admin</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <View style={styles.userEmailRow}>
                    <MaterialIcons
                      name="email"
                      size={13}
                      color={Colors.dark.textSecondary}
                    />
                    <Text style={styles.userEmail} numberOfLines={1}>
                      {user.email}
                    </Text>
                  </View>
                </View>

                <View style={styles.userActions}>
                  {!user.admin ? (
                    <Pressable
                      style={styles.promoteButton}
                      onPress={() => handleSetAdmin(user)}
                      disabled={settingAdmin === user.id}
                    >
                      {settingAdmin === user.id ? (
                        <ActivityIndicator size="small" color="#F59E0B" />
                      ) : (
                        <>
                          <MaterialIcons
                            name="star"
                            size={16}
                            color="#F59E0B"
                          />
                          <Text style={styles.promoteButtonText}>
                            Promover a Admin
                          </Text>
                        </>
                      )}
                    </Pressable>
                  ) : (
                    <Pressable
                      style={styles.demoteButton}
                      onPress={() => handleRemoveAdmin(user)}
                      disabled={
                        removingAdmin === user.id ||
                        users.filter((u) => u.admin).length <= 1
                      }
                    >
                      {removingAdmin === user.id ? (
                        <ActivityIndicator size="small" color="#EF4444" />
                      ) : (
                        <>
                          <MaterialIcons
                            name="person-remove"
                            size={16}
                            color="#EF4444"
                          />
                          <Text style={styles.demoteButtonText}>
                            Remover de Admin
                          </Text>
                        </>
                      )}
                    </Pressable>
                  )}

                  <Pressable
                    style={styles.removeButton}
                    onPress={() => setUserToRemove(user)}
                  >
                    <MaterialIcons name="delete" size={18} color="#EF4444" />
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Modal adicionar usuário */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowAddModal(false)}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adicionar Usuário ao Grupo</Text>
              <Pressable onPress={() => setShowAddModal(false)}>
                <MaterialIcons
                  name="close"
                  size={24}
                  color={Colors.dark.textSecondary}
                />
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>Email do usuário</Text>
              <TextInput
                style={styles.modalInput}
                value={emailToAdd}
                onChangeText={setEmailToAdd}
                placeholder="usuário@exemplo.com"
                placeholderTextColor={Colors.dark.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoFocus
                onSubmitEditing={handleAddUser}
              />
            </View>

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.modalButton,
                  styles.modalAddButton,
                  (!emailToAdd.trim() || addingUser) &&
                    styles.modalButtonDisabled,
                ]}
                onPress={handleAddUser}
                disabled={addingUser || !emailToAdd.trim()}
              >
                {addingUser ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <MaterialIcons name="add" size={20} color="#fff" />
                    <Text style={styles.modalAddButtonText}>Adicionar</Text>
                  </>
                )}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal remover usuário */}
      <Modal
        visible={!!userToRemove}
        transparent
        animationType="fade"
        onRequestClose={() => setUserToRemove(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setUserToRemove(null)}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.deleteModalHeader}>
              <View style={styles.deleteIcon}>
                <MaterialIcons name="delete" size={24} color="#EF4444" />
              </View>
              <View style={styles.deleteModalText}>
                <Text style={styles.modalTitle}>Remover usuário do grupo</Text>
                <Text style={styles.deleteModalDescription}>
                  Tem certeza que deseja remover{" "}
                  <Text style={styles.deleteModalUserName}>
                    {userToRemove?.name || userToRemove?.email}
                  </Text>{" "}
                  do grupo{" "}
                  <Text style={styles.deleteModalGroupName}>
                    {activeGroup?.name}
                  </Text>
                  ?
                </Text>
                <Text style={styles.deleteModalWarning}>
                  ⚠️ Esta ação não pode ser desfeita. O usuário perderá acesso a
                  todos os jogos e dados deste grupo.
                </Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setUserToRemove(null)}
                disabled={removingUser}
              >
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.modalButton,
                  styles.modalDeleteButton,
                  removingUser && styles.modalButtonDisabled,
                ]}
                onPress={handleRemoveUser}
                disabled={removingUser}
              >
                {removingUser ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <MaterialIcons name="delete" size={20} color="#fff" />
                    <Text style={styles.modalDeleteButtonText}>
                      Remover do grupo
                    </Text>
                  </>
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
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    },
    loadingText: {
      fontSize: 14,
      color: Colors[scheme].textSecondary,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 24,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: Colors[scheme].text,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: Colors[scheme].textSecondary,
    },
    groupName: {
      fontWeight: "600",
      color: Colors[scheme].text,
    },
    addButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: "#10B981",
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
    },
    addButtonText: {
      color: "#fff",
      fontSize: 14,
      fontWeight: "600",
    },
    card: {
      backgroundColor: Colors[scheme].card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: Colors[scheme].border,
      overflow: "hidden",
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
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
    emptyContainer: {
      padding: 48,
      alignItems: "center",
      gap: 12,
    },
    emptyText: {
      fontSize: 14,
      color: Colors[scheme].textSecondary,
      textAlign: "center",
    },
    userItem: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: Colors[scheme].border,
    },
    userItemAdmin: {
      backgroundColor: "#FEF3C7",
      borderLeftWidth: 4,
      borderLeftColor: "#F59E0B",
    },
    userContent: {
      gap: 10,
      marginBottom: 12,
    },
    userHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    userInfo: {
      flex: 1,
      gap: 4,
    },
    userAvatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: "#3B82F6",
      alignItems: "center",
      justifyContent: "center",
    },
    userAvatarAdmin: {
      backgroundColor: "#FDE68A",
    },
    userAvatarText: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#fff",
    },
    userName: {
      fontSize: 16,
      fontWeight: "600",
      color: Colors[scheme].text,
      lineHeight: 20,
    },
    adminBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
      backgroundColor: "#FDE68A",
      alignSelf: "flex-start",
    },
    adminBadgeText: {
      fontSize: 10,
      fontWeight: "600",
      color: "#92400E",
    },
    userEmailRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingLeft: 56,
    },
    userEmail: {
      fontSize: 13,
      color: Colors[scheme].textSecondary,
      flex: 1,
    },
    userActions: {
      flexDirection: "row",
      gap: 6,
      alignItems: "center",
      flexWrap: "wrap",
    },
    promoteButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 6,
      backgroundColor: "#FEF3C7",
      borderWidth: 1,
      borderColor: "#FDE68A",
    },
    promoteButtonText: {
      fontSize: 12,
      fontWeight: "600",
      color: "#92400E",
    },
    demoteButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 6,
      backgroundColor: "#FEE2E2",
      borderWidth: 1,
      borderColor: "#FECACA",
    },
    demoteButtonText: {
      fontSize: 12,
      fontWeight: "600",
      color: "#991B1B",
    },
    removeButton: {
      width: 36,
      height: 36,
      borderRadius: 6,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: Colors[scheme].backgroundSecondary,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      backgroundColor: Colors[scheme].card,
      borderRadius: 12,
      padding: 24,
      width: "90%",
      maxWidth: 400,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: Colors[scheme].text,
    },
    modalBody: {
      marginBottom: 24,
    },
    modalLabel: {
      fontSize: 14,
      fontWeight: "500",
      color: Colors[scheme].text,
      marginBottom: 8,
    },
    modalInput: {
      fontSize: 16,
      color: Colors[scheme].text,
      borderWidth: 1,
      borderColor: Colors[scheme].border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: Colors[scheme].background,
    },
    modalActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 8,
    },
    modalButton: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    modalButtonDisabled: {
      opacity: 0.5,
    },
    modalCancelButton: {
      backgroundColor: Colors[scheme].backgroundSecondary,
    },
    modalCancelButtonText: {
      color: Colors[scheme].text,
      fontSize: 14,
      fontWeight: "600",
    },
    modalAddButton: {
      backgroundColor: "#10B981",
    },
    modalAddButtonText: {
      color: "#fff",
      fontSize: 14,
      fontWeight: "600",
    },
    deleteModalHeader: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 24,
    },
    deleteIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "#FEE2E2",
      alignItems: "center",
      justifyContent: "center",
    },
    deleteModalText: {
      flex: 1,
    },
    deleteModalDescription: {
      fontSize: 14,
      color: Colors[scheme].textSecondary,
      marginTop: 8,
      lineHeight: 20,
    },
    deleteModalUserName: {
      fontWeight: "600",
      color: Colors[scheme].text,
    },
    deleteModalGroupName: {
      fontWeight: "600",
      color: Colors[scheme].text,
    },
    deleteModalWarning: {
      fontSize: 12,
      color: "#EF4444",
      marginTop: 12,
      lineHeight: 18,
    },
    modalDeleteButton: {
      backgroundColor: "#EF4444",
    },
    modalDeleteButtonText: {
      color: "#fff",
      fontSize: 14,
      fontWeight: "600",
    },
  });
