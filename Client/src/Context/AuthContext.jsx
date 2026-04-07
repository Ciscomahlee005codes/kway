import { createContext, useEffect, useState, useContext } from "react";
import { supabase } from "../supabase";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // ============================================
  // ✅ FETCH PROFILE
  // ============================================
  const refreshProfile = async (userId) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;

      setProfile(data);
    } catch (err) {
      console.error("Profile fetch error:", err.message);
    }
  };

  // ============================================
  // ✅ SESSION HANDLING (ONLY ONE useEffect)
  // ============================================
  useEffect(() => {
    const getInitialSession = async () => {
      const { data } = await supabase.auth.getSession();

      setSession(data.session);

      if (data.session?.user) {
        await refreshProfile(data.session.user.id);
      } else {
        setProfile(null);
      }

      setLoading(false);
    };

    getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);

      if (newSession?.user) {
        refreshProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ============================================
  // ✅ SIGN UP
  // ============================================
  const signUp = async (email, password) => {
    const toastId = toast.loading("Creating account...");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: "http://localhost:5173/auth/callback",
      },
    });

    if (error) {
      toast.error(error.message, { id: toastId });
      return { success: false };
    }

    toast.success("Verification email sent 📩", { id: toastId });
    return { success: true, data };
  };

  // ============================================
  // ✅ SIGN IN
  // ============================================
  const signIn = async (email, password) => {
    const toastId = toast.loading("Signing you in...");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message, { id: toastId });
      return { success: false };
    }

    toast.success("Welcome back 🚀", { id: toastId });
    return { success: true, data };
  };

  // ============================================
  // ✅ PASSWORD RESET
  // ============================================
  const sendPasswordReset = async (email) => {
    const toastId = toast.loading("Sending reset link...");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:5173/update-password",
    });

    if (error) {
      toast.error(error.message, { id: toastId });
      return { success: false };
    }

    toast.success("Reset email sent 📩", { id: toastId });
    return { success: true };
  };

  // ============================================
  // ✅ UPDATE PASSWORD
  // ============================================
  const updatePassword = async (newPassword) => {
    const toastId = toast.loading("Updating password...");

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      toast.error(error.message, { id: toastId });
      return { success: false };
    }

    toast.success("Password updated 🎉", { id: toastId });
    return { success: true };
  };

  // ============================================
  // ✅ SIGN OUT
  // ============================================
  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    toast.success("Signed out 👋");
  };

  // ============================================
  // ✅ CONTEXT VALUE
  // ============================================
  const value = {
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    sendPasswordReset,
    updatePassword,
    refreshProfile,
    setProfile, // for instant UI updates after edit
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => useContext(AuthContext);