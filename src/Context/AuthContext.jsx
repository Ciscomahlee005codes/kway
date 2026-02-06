import { createContext, useEffect, useState, useContext } from "react";
import { supabase } from "../supabase";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // ============================================
  // ✅ SIGN UP (Email + Password)
  // ============================================
  const signUp = async (email, password) => {
  const toastId = toast.loading("Creating account...");

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: "http://localhost:5173", // 🔥 IMPORTANT
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
  // ✅ SIGN IN (Email + Password)
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
  // ✅ FORGOT PASSWORD
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
    toast.success("Signed out");
  };

  // ============================================
  // ✅ SESSION HANDLING
  // ============================================
  useEffect(() => {
    const getInitialSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoading(false);
    };

    getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        loading,
        signUp,
        signIn,
        sendPasswordReset,
        updatePassword,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => useContext(AuthContext);
