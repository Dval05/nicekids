
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import type { UserProfile } from '../types';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  userProfile: null,
  loading: true,
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchUserProfile(session.user);
      }
      setLoading(false);
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchUserProfile(session.user);
        } else {
          setUserProfile(null);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (user: User) => {
    try {
      // 1. Fetch user data from 'user' table
      const { data: userData, error: userError } = await supabase
        .from('user')
        .select('*')
        .eq('AuthUserID', user.id)
        .single();

      if (userError) throw userError;
      if (!userData) throw new Error('User not found in public.user table');

      // 2. Fetch user role from 'user_role' and 'role' tables
      const { data: userRoleData, error: roleError } = await supabase
        .from('user_role')
        .select(`
          role (
            RoleName
          )
        `)
        .eq('UserID', userData.UserID)
        .single();
      
      if (roleError) throw roleError;
      if (!userRoleData || !userRoleData.role) throw new Error('User role not found');
      
      const profile: UserProfile = {
        userId: userData.UserID,
        authUserId: user.id,
        firstName: userData.FirstName,
        lastName: userData.LastName,
        email: user.email!,
        role: (userRoleData.role as { RoleName: string }).RoleName,
      };

      setUserProfile(profile);

    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserProfile(null);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    session,
    user,
    userProfile,
    loading,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
