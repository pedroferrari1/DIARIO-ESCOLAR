import { supabase } from '../../lib/supabase';
import { authenticator } from 'otplib';
import { User } from '../../types/database';

export const authApi = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  async verify2FA(token: string, secret: string) {
    const isValid = authenticator.verify({ token, secret });
    if (!isValid) {
      throw new Error('Código 2FA inválido');
    }
    return true;
  },

  async setup2FA(userId: string) {
    const secret = authenticator.generateSecret();
    const { error } = await supabase
      .from('users')
      .update({ 
        two_factor_secret: secret,
        two_factor_enabled: true 
      })
      .eq('id', userId);

    if (error) throw error;
    return secret;
  },

  async disable2FA(userId: string) {
    const { error } = await supabase
      .from('users')
      .update({ 
        two_factor_secret: null,
        two_factor_enabled: false 
      })
      .eq('id', userId);

    if (error) throw error;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
};