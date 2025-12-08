import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '@/hooks';
import { Colors } from '@/constants/theme';
import type { ColorScheme } from '@/types/theme';
import type { Group } from '@/types/group';
import { useThemedStyles } from '@/hooks/use-themed-styles';

export function GroupSwitcher() {
  const { activeGroup, availableGroups, selectGroup } = useAuth();
  const styles = useThemedStyles(createStyles);
  const [isChanging, setIsChanging] = useState(false);

  const handleChangeGroup = () => {
    if (availableGroups.length <= 1) return;

    // Show action sheet with group list
    Alert.alert(
      'Alterar Grupo',
      'Escolha um grupo:',
      [
        ...availableGroups
          .filter(group => group.id !== activeGroup?.id) // Don't show current group
          .map(group => ({
            text: group.name,
            onPress: async () => {
              setIsChanging(true);
              try {
                await selectGroup(group);
                Alert.alert('Sucesso', `Você mudou para o grupo "${group.name}"`);
              } catch (error) {
                Alert.alert('Erro', 'Não foi possível alterar o grupo');
              } finally {
                setIsChanging(false);
              }
            },
          })),
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  if (!activeGroup) {
    return (
      <View style={styles.container}>
        <Text style={styles.noGroupText}>Nenhum grupo selecionado</Text>
        <Text style={styles.noGroupSubtext}>
          Você não está participando de nenhum grupo no momento
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable
        style={[
          styles.groupButton,
          availableGroups.length <= 1 && styles.groupButtonDisabled
        ]}
        onPress={handleChangeGroup}
        disabled={isChanging || availableGroups.length <= 1}
      >
        <View style={styles.groupContent}>
          <View style={styles.groupTextContainer}>
            <Text style={styles.groupName}>{activeGroup.name}</Text>
            {activeGroup.isAdmin && (
              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeText}>Admin</Text>
              </View>
            )}
          </View>
          {availableGroups.length > 1 && !isChanging && (
            <Text style={styles.hint}>Toque para alterar</Text>
          )}
          {isChanging && (
            <ActivityIndicator size="small" color={Colors.dark.primary} />
          )}
        </View>
      </Pressable>
      {availableGroups.length > 1 && (
        <Text style={styles.availableGroupsText}>
          {availableGroups.length - 1} outro{availableGroups.length - 1 !== 1 ? 's' : ''} grupo{availableGroups.length - 1 !== 1 ? 's' : ''} disponível{availableGroups.length - 1 !== 1 ? 'is' : ''}
        </Text>
      )}
    </View>
  );
}

const createStyles = (scheme: ColorScheme) => StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  groupButton: {
    backgroundColor: Colors[scheme].card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors[scheme].border,
  },
  groupButtonDisabled: {
    opacity: 0.6,
  },
  groupContent: {
    flexDirection: 'column',
  },
  groupTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
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
  hint: {
    fontSize: 14,
    color: Colors[scheme].textSecondary,
    marginTop: 4,
  },
  availableGroupsText: {
    fontSize: 13,
    color: Colors[scheme].textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  noGroupText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors[scheme].text,
    marginBottom: 4,
  },
  noGroupSubtext: {
    fontSize: 14,
    color: Colors[scheme].textSecondary,
  },
});
