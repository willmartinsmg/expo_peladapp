import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth, useThemedStyles } from '@/hooks';
import { Colors } from '@/constants/theme';
import type { ColorScheme } from '@/types/theme';
import { Avatar, GroupSwitcher } from '@/components/profile';
import { authApi } from '@/api';
import type { User } from '@/types/auth';

export default function ProfileScreen() {
  const { user: contextUser, signOut } = useAuth();
  const styles = useThemedStyles(createStyles);
  const [user, setUser] = useState<User | null>(contextUser);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const loadProfile = useCallback(async () => {
    try {
      setIsLoadingProfile(true);
      const profile = await authApi.getProfile();
      setUser(profile);
    } catch (error) {
      console.error('Error loading profile:', error);
      // Use context user as fallback
      setUser(contextUser);
    } finally {
      setIsLoadingProfile(false);
    }
  }, [contextUser]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSignOut = () => {
    Alert.alert(
      'Sair do aplicativo',
      'Tem certeza que deseja sair?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await signOut();
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Erro', 'Não foi possível sair. Tente novamente.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  if (isLoadingProfile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.dark.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Avatar
          name={user?.name}
          avatarUrl={user?.avatarUrl}
          size={120}
        />

        <Text style={styles.name}>{user?.name || 'Usuário'}</Text>
        {user?.email && (
          <Text style={styles.email}>{user.email}</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Grupo</Text>
        <GroupSwitcher />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações</Text>

        {user?.email && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{user.email}</Text>
          </View>
        )}

        {user?.isAdminIn && user.isAdminIn.length > 0 && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Administrador de:</Text>
            <Text style={styles.infoValue}>
              {user.isAdminIn.length} {user.isAdminIn.length === 1 ? 'grupo' : 'grupos'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <Pressable
          style={[styles.button, styles.signOutButton]}
          onPress={handleSignOut}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sair do aplicativo</Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
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
  content: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors[scheme].text,
    marginTop: 16,
    textAlign: 'center',
  },
  email: {
    fontSize: 16,
    color: Colors[scheme].textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors[scheme].border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors[scheme].text,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors[scheme].border,
  },
  infoLabel: {
    fontSize: 16,
    color: Colors[scheme].textSecondary,
  },
  infoValue: {
    fontSize: 16,
    color: Colors[scheme].text,
    fontWeight: '500',
  },
  actions: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  signOutButton: {
    backgroundColor: Colors[scheme].error,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
