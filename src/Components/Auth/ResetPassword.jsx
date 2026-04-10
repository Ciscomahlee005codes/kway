import { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event) => {
    if (event === "PASSWORD_RECOVERY") {
      console.log("Recovery mode active");
    }
  });

  return () => subscription.unsubscribe();
}, []);
  useEffect(() => {
    // This makes Supabase detect the token in URL hash
    supabase.auth.getSession();
  }, []);

  const updatePassword = async () => {
    if (!password) return toast.error("Enter new password");

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated successfully 🎉");
      navigate("/"); // go back to login
    }
  };

  return (
    <div className="forgot-container">
      <div className="forgot-card">
        <h2>Set New Password 🔐</h2>

        <input
          type="password"
          placeholder="New password"
          onChange={(e) => setPassword(e.target.value)}
          className="forgot-input"
        />

        <button onClick={updatePassword} className="forgot-btn">
          {loading ? "Updating..." : "Update Password"}
        </button>
      </div>
    </div>
  );
};

export default ResetPassword;