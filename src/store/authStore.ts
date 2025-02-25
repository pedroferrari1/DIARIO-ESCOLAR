import { create } from 'zustand';
import { User } from '../types/database';
import { supabase } from '../lib/supabase';
import { AuthError } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,
  setUser: (user) => set({ user }),
  clearError: () => set({ error: null }),
  signIn: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (authError) {
        // Handle specific auth errors
        if (authError instanceof AuthError) {
          switch (authError.status) {
            case 400:
              throw new Error('Credenciais inválidas. Verifique seu e-mail e senha.');
            case 422:
              throw new Error('Formato de e-mail inválido.');
            case 429:
              throw new Error('Muitas tentativas. Tente novamente mais tarde.');
            case 0:
              throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
            default:
              throw new Error('Erro de autenticação. Tente novamente.');
          }
        }
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Erro ao obter dados do usuário.');
      }

      // Fetch user data from users table with retry logic
      let retries = 3;
      let userData = null;
      let userError = null;

      while (retries > 0 && !userData) {
        const result = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .maybeSingle();

        if (!result.error && result.data) {
          userData = result.data;
          break;
        }

        userError = result.error;
        retries--;
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
      }

      if (!userData) {
        throw new Error(userError ? 'Erro ao carregar dados do usuário.' : 'Usuário não encontrado.');
      }
      
      set({ user: userData as User });
    } catch (error) {
      console.error('Erro de login:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao fazer login. Tente novamente.',
        user: null 
      });
    } finally {
      set({ loading: false });
    }
  },
  signOut: async () => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null });
    } catch (error) {
      console.error('Erro ao sair:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao sair. Tente novamente.' 
      });
    } finally {
      set({ loading: false });
    }
  },
}));