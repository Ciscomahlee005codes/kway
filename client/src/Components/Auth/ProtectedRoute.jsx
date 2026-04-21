import { Navigate } from "react-router-dom";
import { UserAuth } from "../../Context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { session, loading } = UserAuth();

  if (loading) return null;

  // ✅ Allow reset-password page even if not logged in
  const isRecovery =
    window.location.hash.includes("type=recovery") ||
    window.location.pathname === "/reset-password";

  if (!session && !isRecovery) {
    return <Navigate to="/" replace />;
  }

  return children;
}