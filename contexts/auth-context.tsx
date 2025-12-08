import { authApi } from "@/api/auth";
import { storage } from "@/lib/storage";
import type { AuthState, SignInCredentials, User } from "@/types/auth";
import * as WebBrowser from 'expo-web-browser';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

// Warm up the browser on iOS for faster OAuth flows
WebBrowser.maybeCompleteAuthSession();

interface AuthContextData extends AuthState {
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signInWithEmail: (email: string) => Promise<void>;
  verifyEmailCode: (email: string, code: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load stored auth data on mount
  useEffect(() => {
    loadStoredAuth();
  }, []);

  async function loadStoredAuth() {
    try {
      const storedToken = await storage.get(storage.keys.AUTH_TOKEN);
      const storedUserData = await storage.get(storage.keys.USER_DATA);

      if (storedToken && storedUserData) {
        const userData = JSON.parse(storedUserData) as User;
        setToken(storedToken);
        setUser(userData);
      }
    } catch (error) {
      console.error("Error loading stored auth:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function signIn(credentials: SignInCredentials) {
    try {
      setIsLoading(true);
      const response = await authApi.signIn(credentials);

      // Combine user data with collaborator info
      const userData: User = {
        ...response.user,
        name: response.colaborador?.NOMFUN,
        apelido: response.colaborador?.APEFUN,
        collaborator: response.colaborador,
      };

      // Save to state
      setToken(response.token);
      setUser(userData);

      // Save to secure storage
      await storage.save(storage.keys.AUTH_TOKEN, response.token);
      await storage.save(storage.keys.USER_DATA, JSON.stringify(userData));
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  async function signInWithEmail(email: string) {
    try {
      await authApi.sendCode({ email });
      // Don't update state here, just send the code
      // The user will be redirected to the verification screen
    } catch (error) {
      console.error("Error sending verification code:", error);
      throw error;
    }
  }

  async function verifyEmailCode(email: string, code: string) {
    try {
      setIsLoading(true);
      const response = await authApi.verifyCode({ email, code });

      // Save to state
      setToken(response.token);
      setUser(response.user);

      // Save to secure storage
      await storage.save(storage.keys.AUTH_TOKEN, response.token);
      await storage.save(storage.keys.USER_DATA, JSON.stringify(response.user));
    } catch (error) {
      console.error("Error verifying code:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  async function signInWithGoogle() {
    try {
      setIsLoading(true);

      // Get the Google OAuth URL from backend
      const authUrl = await authApi.getGoogleLoginUrl();

      // Open browser for OAuth flow
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        'exp://localhost:8081' // Update this with your actual scheme
      );

      if (result.type === 'success') {
        // Parse the token from the redirect URL
        const url = new URL(result.url);
        const token = url.searchParams.get('token');
        const userDataParam = url.searchParams.get('user');

        if (token && userDataParam) {
          const userData = JSON.parse(userDataParam) as User;

          // Save to state
          setToken(token);
          setUser(userData);

          // Save to secure storage
          await storage.save(storage.keys.AUTH_TOKEN, token);
          await storage.save(storage.keys.USER_DATA, JSON.stringify(userData));
        }
      }
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  async function signOut() {
    try {
      setIsLoading(true);

      // Clear state
      setToken(null);
      setUser(null);

      // Clear storage
      await storage.clear();
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const value: AuthContextData = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    signIn,
    signInWithEmail,
    verifyEmailCode,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
