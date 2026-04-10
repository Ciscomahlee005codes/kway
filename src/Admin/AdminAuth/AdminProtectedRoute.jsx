import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../supabase";

const AdminProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (data?.role === null) {
      setIsAdmin(true);
    }

    setLoading(false);
  };

  if (loading) return <div>Checking...</div>;
  if (!isAdmin) return <Navigate to="/admin-auth" />;

  return children;
};

export default AdminProtectedRoute;