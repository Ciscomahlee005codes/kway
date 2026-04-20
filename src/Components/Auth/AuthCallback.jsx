import { useEffect } from "react";
import { supabase } from "../../supabase";
import { useNavigate } from "react-router-dom";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        navigate("/auth");
        return;
      }

      const user = data.session.user;

      // check profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile) navigate("/profile-setup");
      else navigate("/chat");
    };

    handleAuth();
  }, []);

  return (
    <div style={{padding:40}}>
      Confirming email… please wait.
    </div>
  );
}