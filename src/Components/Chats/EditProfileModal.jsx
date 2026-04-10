import React, { useEffect, useState } from "react";
import "./EditProfileModal.css";

const EditProfileModal = ({ user, onClose, onSave, checkUsername }) => {
  const [username, setUsername] = useState(user.username || "");
  const [about, setAbout] = useState(user.about || "");
  const [avatar, setAvatar] = useState(user.avatar || "");
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState(null);

  // 🔥 Username availability check
  useEffect(() => {
    if (!username || username.length < 3) {
      setAvailable(null);
      return;
    }

    const delay = setTimeout(async () => {
      setChecking(true);
      const isAvailable = await checkUsername(username);
      setAvailable(isAvailable);
      setChecking(false);
    }, 600); // debounce

    return () => clearTimeout(delay);
  }, [username]);

  const handleSubmit = () => {
    if (available === false) return;

    onSave({
      username,
      about,
      avatar,
    });
  };

  return (
    <div className="edit-overlay">
      <div className="edit-modal">
        <h3>Edit Profile</h3>

        {/* Avatar */}
        <div className="edit-avatar">
          <img
            src={
              avatar ||
              "https://api.dicebear.com/7.x/thumbs/svg?seed=user"
            }
            alt="avatar"
          />
          <input
            type="text"
            placeholder="Paste avatar image URL"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
          />
        </div>

        {/* Username */}
        <div className="input-group">
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value.toLowerCase())
            }
          />

          {checking && <span className="info">Checking...</span>}

          {available === true && (
            <span className="success">Username available ✅</span>
          )}

          {available === false && (
            <span className="error">Username already taken ❌</span>
          )}
        </div>

        {/* About */}
        <div className="input-group">
          <label>About</label>
          <textarea
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            maxLength={120}
          />
        </div>

        <div className="modal-actions">
          <button className="cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="save"
            disabled={available === false}
            onClick={handleSubmit}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
