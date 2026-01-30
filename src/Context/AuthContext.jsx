import { createContext, useEffect, useState, useContext } from "react";
import { supabase } from "../supabase";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // 🔥 SEND LOGIN OTP (Email Only - No Auto Signup)
  // =====================================================
  const sendLoginOtp = async (email) => {
    const toastId = toast.loading("Sending OTP to your email...");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      },
    });

    if (error) {
      toast.error(error.message, { id: toastId });
      return { success: false };
    }

    toast.success("OTP sent successfully 📩", { id: toastId });
    return { success: true };
  };

  // =====================================================
  // 🔥 SEND SIGNUP OTP (Creates User)
  // =====================================================
  const sendSignupOtp = async (email) => {
    const toastId = toast.loading("Creating account...");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    });

    if (error) {
      toast.error(error.message, { id: toastId });
      return { success: false };
    }

    toast.success("Signup OTP sent 📩 Check your email.", {
      id: toastId,
    });

    return { success: true };
  };

  // =====================================================
  // 🔥 VERIFY EMAIL OTP
  // =====================================================
  const verifyEmailOtp = async ({ email, token }) => {
    const toastId = toast.loading("Verifying code...");

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });

    if (error) {
      toast.error("Invalid or expired code ❌", { id: toastId });
      return { success: false };
    }

    toast.success("Verification successful 🎉", { id: toastId });

    return { success: true, data };
  };

  // =====================================================
  // 🔥 FORGOT PASSWORD (Send Reset Link)
  // =====================================================
  const sendPasswordReset = async (email) => {
    const toastId = toast.loading("Sending reset link...");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:5173/update-password",
    });

    if (error) {
      toast.error(error.message, { id: toastId });
      return { success: false };
    }

    toast.success("Password reset email sent 📩", { id: toastId });
    return { success: true };
  };

  // =====================================================
  // 🔥 UPDATE PASSWORD (After Reset)
  // =====================================================
  const updatePassword = async (newPassword) => {
    const toastId = toast.loading("Updating password...");

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      toast.error(error.message, { id: toastId });
      return { success: false };
    }

    toast.success("Password updated successfully 🎉", {
      id: toastId,
    });

    return { success: true };
  };

  // =====================================================
  // 🔥 SIGN OUT
  // =====================================================
  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
  };

  // =====================================================
  // 🔥 SESSION HANDLING
  // =====================================================
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
        sendLoginOtp,
        sendSignupOtp,
        verifyEmailOtp,
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
