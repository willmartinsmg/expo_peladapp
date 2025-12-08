import { router } from 'expo-router';
import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '@/contexts/auth-context';
import { useThemedStyles } from '@/hooks';
import { Colors } from '@/constants/theme';
import type { ColorScheme } from '@/types/theme';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const { signInWithGoogle } = useAuth();
  const styles = useThemedStyles(createStyles);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError('');
      await signInWithGoogle();
    } catch (err) {
      setError('Erro ao fazer login com Google. Tente novamente.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = () => {
    router.push('/(auth)/email');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Faça login na sua conta</Text>
      <Text style={styles.subtitle}>Escolha como você prefere acessar</Text>

      <View style={styles.buttonContainer}>
        <Pressable
          style={[styles.button, styles.googleButton]}
          onPress={handleGoogleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="logo-google" size={24} color="#fff" style={styles.icon} />
              <Text style={styles.buttonText}>Continuar com Google</Text>
            </>
          )}
        </Pressable>

        <Text style={styles.divider}>OU</Text>

        <Pressable
          style={[styles.button, styles.emailButton]}
          onPress={handleEmailLogin}
          disabled={isLoading}
        >
          <Ionicons name="mail-outline" size={24} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>Entrar com código por email</Text>
        </Pressable>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable onPress={() => router.push('/')} style={styles.backLink}>
        <Text style={styles.backLinkText}>Voltar para a página principal</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1f2e',
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 48,
  },
  buttonContainer: {
    gap: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    minHeight: 56,
  },
  googleButton: {
    backgroundColor: '#4285f4',
  },
  emailButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#4a5568',
    borderStyle: 'dashed',
  },
  icon: {
    marginRight: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 14,
    marginVertical: 8,
  },
  error: {
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
  },
  backLink: {
    marginTop: 32,
    alignItems: 'center',
  },
  backLinkText: {
    color: '#60a5fa',
    fontSize: 16,
  },
});
