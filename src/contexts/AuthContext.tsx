
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/types/supabase";
import { toast } from "sonner";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<User | null>;
  signInWithGithub: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [profileLoading, setProfileLoading] = useState<boolean>(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = useCallback(async (userId: string) => {
    if (profileLoading || !userId) return;
    
    try {
      setProfileLoading(true);
      
      // First try to get the user's info from auth.users
      const { data: authUser, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      
      // Try to fetch the user profile with minimal fields first
      try {
        const { data: profileData, error: fetchError } = await supabase
          .from('user_profiles')
          .select('id, anticoin_balance')
          .eq('id', userId)
          .single();
          
        if (profileData) {
          // Profile exists, update it with any missing fields
          const updates: any = {};
          let needsUpdate = false;
          
          if (authUser.user?.email && !profileData.email) {
            updates.email = authUser.user.email;
            needsUpdate = true;
          }
          
          if (authUser.user?.user_metadata?.full_name && !profileData.full_name) {
            updates.full_name = authUser.user.user_metadata.full_name;
            needsUpdate = true;
          }
          
          if (needsUpdate) {
            const { data: updatedProfile } = await supabase
              .from('user_profiles')
              .update({
                ...updates,
                updated_at: new Date().toISOString()
              })
              .eq('id', userId)
              .select()
              .single();
              
            setProfile(updatedProfile || profileData);
          } else {
            setProfile(profileData);
          }
          
          return;
        }
      } catch (fetchError) {
        console.log('Fetch profile error (non-critical):', fetchError);
        // Continue to create a new profile
      }
      
      // If we get here, either the profile doesn't exist or there was an error
      try {
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            id: userId,
            email: authUser.user?.email || null,
            full_name: authUser.user?.user_metadata?.full_name || null,
            anticoin_balance: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
          
        if (createError) {
          console.error('Error creating profile:', createError);
          // Try to fetch again in case of race condition
          const { data: existingProfile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .single();
            
          if (existingProfile) {
            setProfile(existingProfile);
            return;
          }
          
          throw createError;
        }
        
        setProfile(newProfile);
      } catch (createError) {
        console.error('Error in profile creation:', createError);
        // Don't throw to prevent infinite loops
      }
      
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      // Don't throw here to prevent infinite loops
    } finally {
      setProfileLoading(false);
    }
  }, [profileLoading]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in");
      throw error;
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    try {
      // Create the user
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            email: email
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        },
      });

      if (signUpError) throw signUpError;

      // Create user profile
      if (user) {
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .upsert({
            id: user.id,
            email: email,
            full_name: name,
            anticoin_balance: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (profileError) {
          console.error('Error creating user profile:', profileError);
          // Don't throw here, as the user was created successfully
        } else {
          setProfile(profileData);
        }
      }
      
      toast.success("Check your email for verification! Please check your inbox and verify your email.");
      return user;
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast.error(error.message || "Failed to sign up. Please try again.");
      throw error;
    }
  }, []);

  const signInWithGithub = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in with GitHub");
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setProfile(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to sign out");
      throw error;
    }
  }, []);

  // Function to manually refresh the user profile
  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await fetchUserProfile(user.id);
    }
  }, [user?.id]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    session,
    user,
    profile,
    signIn,
    signUp,
    signInWithGithub,
    signOut,
    refreshProfile,
    loading,
  }), [session, user, profile, signIn, signUp, signInWithGithub, signOut, refreshProfile, loading]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
