import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User, UserActivity } from '../types/database';

interface UserState {
  users: User[];
  activities: UserActivity[];
  loading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  fetchUserActivities: () => Promise<void>;
  createUser: (userData: Partial<User>) => Promise<void>;
  updateUser: (id: string, userData: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  logActivity: (activity: Omit<UserActivity, 'id' | 'created_at'>) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  activities: [],
  loading: false,
  error: null,

  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('full_name');

      if (error) throw error;
      set({ users: data as User[] });
    } catch (error) {
      set({ error: 'Erro ao carregar usuários' });
      console.error('Erro ao carregar usuários:', error);
    } finally {
      set({ loading: false });
    }
  },

  fetchUserActivities: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('user_activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      set({ activities: data as UserActivity[] });
    } catch (error) {
      set({ error: 'Erro ao carregar atividades' });
      console.error('Erro ao carregar atividades:', error);
    } finally {
      set({ loading: false });
    }
  },

  createUser: async (userData) => {
    set({ loading: true, error: null });
    try {
      // Primeiro, criar o usuário no Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email!,
        password: Math.random().toString(36).slice(-8), // Senha temporária
        options: {
          data: {
            full_name: userData.full_name,
            role: userData.role,
          },
        },
      });

      if (authError) throw authError;

      // Depois, criar o registro na tabela users
      const { error: dbError } = await supabase
        .from('users')
        .insert({
          ...userData,
          id: authData.user?.id,
        });

      if (dbError) throw dbError;

      // Registrar a atividade
      await get().logActivity({
        user_id: (await supabase.auth.getUser()).data.user?.id!,
        activity_type: 'create',
        description: `Criou usuário: ${userData.full_name}`,
        ip_address: '0.0.0.0', // Em produção, usar o IP real
      });

      get().fetchUsers();
    } catch (error) {
      set({ error: 'Erro ao criar usuário' });
      console.error('Erro ao criar usuário:', error);
    } finally {
      set({ loading: false });
    }
  },

  updateUser: async (id, userData) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('users')
        .update(userData)
        .eq('id', id);

      if (error) throw error;

      await get().logActivity({
        user_id: (await supabase.auth.getUser()).data.user?.id!,
        activity_type: 'update',
        description: `Atualizou usuário: ${userData.full_name}`,
        ip_address: '0.0.0.0',
      });

      get().fetchUsers();
    } catch (error) {
      set({ error: 'Erro ao atualizar usuário' });
      console.error('Erro ao atualizar usuário:', error);
    } finally {
      set({ loading: false });
    }
  },

  deleteUser: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await get().logActivity({
        user_id: (await supabase.auth.getUser()).data.user?.id!,
        activity_type: 'delete',
        description: `Deletou usuário ID: ${id}`,
        ip_address: '0.0.0.0',
      });

      get().fetchUsers();
    } catch (error) {
      set({ error: 'Erro ao deletar usuário' });
      console.error('Erro ao deletar usuário:', error);
    } finally {
      set({ loading: false });
    }
  },

  logActivity: async (activity) => {
    try {
      const { error } = await supabase
        .from('user_activities')
        .insert(activity);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao registrar atividade:', error);
    }
  },
}));