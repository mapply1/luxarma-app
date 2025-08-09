import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'client';

export interface AuthUser extends User {
  role?: UserRole;
  client_id?: string;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    if (error) {
      // Clear stale session data if there's an authentication error
      await supabase.auth.signOut();
    }
    return null;
  }
  
  // Get user role from metadata
  const role = user.user_metadata?.role as UserRole;
  const client_id = user.user_metadata?.client_id;
  
  return {
    ...user,
    role,
    client_id,
  };
}

export async function createClientUser(email: string, password: string, clientId: string, clientName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: 'client',
        client_id: clientId,
        client_name: clientName,
      }
    }
  });

  if (error) throw error;
  return data;
}

export function isAdmin(user: AuthUser | null): boolean {
  return user?.role === 'admin';
}

export function isClient(user: AuthUser | null): boolean {
  return user?.role === 'client';
}