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
import { useThemedStyles, useColorScheme } from '@/hooks';
import { Colors } from '@/constants/theme';
import type { ColorScheme } from '@/types/theme';

export default function EmailScreen() {
  const { signInWithEmail } = useAuth();
  const styles = useThemedStyles(createStyles);
  const colorScheme = useColorScheme();
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
            placeholderTextColor={Colors[colorScheme].textSecondary}
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

const createStyles = (scheme: ColorScheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors[scheme].background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors[scheme].text,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: Colors[scheme].textSecondary,
    marginBottom: 32,
  },
  formContainer: {
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    color: Colors[scheme].text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors[scheme].backgroundSecondary,
    borderWidth: 2,
    borderColor: Colors[scheme].border,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors[scheme].text,
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
    backgroundColor: Colors[scheme].primary,
  },
  backButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors[scheme].border,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors[scheme].text,
  },
  backButtonText: {
    color: Colors[scheme].textSecondary,
  },
  error: {
    color: Colors[scheme].error,
    fontSize: 14,
    marginBottom: 12,
  },
  alreadyHaveCodeLink: {
    marginTop: 16,
    alignItems: 'center',
  },
  alreadyHaveCodeText: {
    color: Colors[scheme].primary,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  infoBox: {
    backgroundColor: Colors[scheme].backgroundSecondary,
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    gap: 16,
    borderWidth: 1,
    borderColor: Colors[scheme].border,
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
    color: Colors[scheme].text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors[scheme].textSecondary,
    marginBottom: 4,
  },
});
