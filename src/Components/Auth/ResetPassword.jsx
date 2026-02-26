import { useState } from "react";
import { supabase } from "../../supabase";
import toast from "react-hot-toast";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const updatePassword = async () => {
    if (!password) return toast.error("Enter new password");

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) toast.error(error.message);
    else toast.success("Password updated successfully 🎉");
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