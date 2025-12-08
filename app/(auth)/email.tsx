import { router } from 'expo-router';
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '@/contexts/auth-context';

export default function EmailScreen() {
  const { signInWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendCode = async () => {
    if (!email || !email.includes('@')) {
      setError('Por favor, insira um email válido');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      await signInWithEmail(email);

      // Navigate to verification screen
      router.push({
        pathname: '/(auth)/verify',
        params: { email },
      });
    } catch (err) {
      setError('Erro ao enviar código. Tente novamente.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Entrar com código por email</Text>
        <Text style={styles.subtitle}>
          Digite seu email e enviaremos um código de verificação
        </Text>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="william.martins@me.com"
            placeholderTextColor="#6b7280"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            editable={!isLoading}
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <View style={styles.buttonRow}>
            <Pressable
              style={[styles.button, styles.sendButton]}
              onPress={handleSendCode}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Enviar código</Text>
              )}
            </Pressable>

            <Pressable
              style={[styles.button, styles.backButton]}
              onPress={() => router.back()}
              disabled={isLoading}
            >
              <Text style={[styles.buttonText, styles.backButtonText]}>Voltar</Text>
            </Pressable>
          </View>

          <Pressable
            onPress={() => router.push('/(auth)/verify')}
            style={styles.alreadyHaveCodeLink}
          >
            <Text style={styles.alreadyHaveCodeText}>Já tenho um código</Text>
          </Pressable>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Como funciona?</Text>
            <Text style={styles.infoText}>1. Digite seu email</Text>
            <Text style={styles.infoText}>2. Receba um código de 6 dígitos</Text>
            <Text style={styles.infoText}>3. Digite o código para fazer login</Text>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1f2e',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 32,
  },
  formContainer: {
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2d3748',
    borderWidth: 2,
    borderColor: '#4a5568',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#fff',
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  sendButton: {
    backgroundColor: '#3b82f6',
  },
  backButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4a5568',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  backButtonText: {
    color: '#9ca3af',
  },
  error: {
    color: '#ef4444',
    fontSize: 14,
    marginBottom: 12,
  },
  alreadyHaveCodeLink: {
    marginTop: 16,
    alignItems: 'center',
  },
  alreadyHaveCodeText: {
    color: '#60a5fa',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  infoBox: {
    backgroundColor: '#1e3a5f',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    gap: 16,
  },
  infoIcon: {
    fontSize: 24,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 4,
  },
});
