import { create } from 'zustand';
import { User } from '../types/database';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,
  setUser: (user) => set({ user }),
  signIn: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (authError) throw authError;

      if (authData.user) {
        // Buscar dados do usuário na tabela users
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (userError) throw userError;
        
        set({ user: userData as User });
      }
    } catch (error) {
      console.error('Erro de login:', error);
      set({ 
        error: 'Credenciais inválidas. Verifique seu e-mail e senha.',
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
      set({ error: 'Erro ao sair. Tente novamente.' });
    } finally {
      set({ loading: false });
    }
  },
}));