// ============================================================
// mbuku LMS — Auth Hook
// Supports both real Supabase auth and DEV-only demo mode
// ============================================================

import { useCallback, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Profile, UserRole } from '@/lib/types/database';

const DEMO_MODE_KEY = 'mbuku_demo_profile';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isDemo: boolean;
}

// Demo profiles for previewing all portals
const demoProfiles: Record<string, Profile> = {
  admin: {
    id: 'demo-admin-001',
    full_name: 'Admin User',
    email: 'admin@mbuku.africa',
    role: 'admin',
    avatar_url: null,
    bio: 'Platform administrator',
    created_at: new Date().toISOString(),
  },
  instructor: {
    id: 'demo-instructor-001',
    full_name: 'Jane Instructor',
    email: 'jane@mbuku.africa',
    role: 'instructor',
    avatar_url: null,
    bio: 'AWS Cloud & Frontend instructor',
    created_at: new Date().toISOString(),
  },
  student: {
    id: 'demo-student-001',
    full_name: 'John Learner',
    email: 'john@mbuku.africa',
    role: 'student',
    avatar_url: null,
    bio: 'Aspiring cloud engineer',
    created_at: new Date().toISOString(),
  },
};

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    loading: true,
    isDemo: false,
  });

  // Fetch the user's profile from the profiles table
  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data as Profile;
  }, []);

  useEffect(() => {
    // Check for demo session first
    const savedDemo = localStorage.getItem(DEMO_MODE_KEY);
    if (savedDemo) {
      try {
        const profile = JSON.parse(savedDemo) as Profile;
        setState({
          user: { id: profile.id, email: profile.email } as User,
          session: null,
          profile,
          loading: false,
          isDemo: true,
        });
        return;
      } catch {
        localStorage.removeItem(DEMO_MODE_KEY);
      }
    }

    // Get initial session from Supabase
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          setState({
            user: session.user,
            session,
            profile,
            loading: false,
            isDemo: false,
          });
        } else {
          setState({
            user: null,
            session: null,
            profile: null,
            loading: false,
            isDemo: false,
          });
        }
      } catch {
        // Supabase not configured — just show login
        setState({
          user: null,
          session: null,
          profile: null,
          loading: false,
          isDemo: false,
        });
      }
    };

    initAuth();

    // Listen for auth state changes
    let subscription: { unsubscribe: () => void } | null = null;
    try {
      const { data } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            const profile = await fetchProfile(session.user.id);
            setState({
              user: session.user,
              session,
              profile,
              loading: false,
              isDemo: false,
            });
          } else if (event === 'SIGNED_OUT') {
            setState({
              user: null,
              session: null,
              profile: null,
              loading: false,
              isDemo: false,
            });
          } else if (event === 'TOKEN_REFRESHED' && session?.user) {
            setState((prev) => ({
              ...prev,
              user: session.user,
              session,
            }));
          }
        }
      );
      subscription = data.subscription;
    } catch {
      // Supabase listener failed — non-fatal
    }

    return () => {
      subscription?.unsubscribe();
    };
  }, [fetchProfile]);

  // Sign in with email and password
  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }, []);

  // Sign up with email, password, and full name
  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    if (error) throw error;
    return data;
  }, []);

  // Sign in with magic link
  const signInWithMagicLink = useCallback(async (email: string) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      },
    });
    if (error) throw error;
    return data;
  }, []);

  // Demo login — DEV ONLY, bypasses Supabase entirely
  const demoLogin = useCallback((role: UserRole) => {
    const profile = demoProfiles[role];
    localStorage.setItem(DEMO_MODE_KEY, JSON.stringify(profile));
    setState({
      user: { id: profile.id, email: profile.email } as User,
      session: null,
      profile,
      loading: false,
      isDemo: true,
    });
  }, []);

  // Sign out (handles both real and demo sessions)
  const signOut = useCallback(async () => {
    const wasDemo = state.isDemo;
    localStorage.removeItem(DEMO_MODE_KEY);

    if (!wasDemo) {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      } catch {
        // Non-fatal if Supabase isn't configured
      }
    }

    setState({
      user: null,
      session: null,
      profile: null,
      loading: false,
      isDemo: false,
    });
  }, [state.isDemo]);

  // Refresh profile (useful after role changes)
  const refreshProfile = useCallback(async () => {
    if (state.isDemo) return; // No refresh needed in demo mode
    if (state.user) {
      const profile = await fetchProfile(state.user.id);
      setState((prev) => ({ ...prev, profile }));
    }
  }, [state.user, state.isDemo, fetchProfile]);

  return {
    user: state.user,
    session: state.session,
    profile: state.profile,
    loading: state.loading,
    isDemo: state.isDemo,
    signIn,
    signUp,
    signInWithMagicLink,
    signOut,
    demoLogin,
    refreshProfile,
  };
}
