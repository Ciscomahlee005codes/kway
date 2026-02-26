import { Navigate } from "react-router-dom";
import { UserAuth } from "../../Context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { session, loading } = UserAuth();

  // Wait until Supabase checks session
  if (loading) return null;

  // If NOT logged in → go to Auth page
  if (!session) {
    return <Navigate to="/" replace />;
  }

  // If logged in → show page
  return children;
}