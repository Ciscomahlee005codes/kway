import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IoArrowBack, IoEllipsisVertical } from "react-icons/io5";
import { FiPhone, FiVideo, FiMail } from "react-icons/fi";
import CallModal from "./CallModal";
import EditProfileModal from "./EditProfileModal";
import "./UsersProfile.css";
import { supabase } from "../../supabase";
import { UserAuth } from "../../Context/AuthContext";

const UsersProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { session } = UserAuth();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [callModal, setCallModal] = useState({ open: false, type: "voice" });

  const dropdownRef = useRef(null);

  // =========================================
  // ✅ FETCH USER LIKE LINKUP PAGE
  // =========================================
  useEffect(() => {
    if (!id) return;

    const fetchUser = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, username, photo, about")
        .eq("id", id)
        .single();

      if (error) {
        console.log(error);
        setLoading(false);
        return;
      }

      setUser(data);
      setLoading(false);
    };

    fetchUser();
  }, [id]);

  // =========================================
  // CLOSE DROPDOWN ON OUTSIDE CLICK
  // =========================================
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (loading) return <div className="profile-error">Loading profile...</div>;
  if (!user) return <div className="profile-error">User not found</div>;

  // =========================================
  // SHARE CONTACT
  // =========================================
  const handleShare = () => {
    const url = `${window.location.origin}/user-profile/${user.id}`;

    navigator.clipboard.writeText(url);
    alert("Profile link copied!");
  };

  return (
    <div className="profile-overlay">
      <div className="profile-sheet">

        {/* HEADER */}
        <div className="profile-header">
          <IoArrowBack className="back-icon" onClick={() => navigate(-1)} />
          <h3>Profile</h3>

          <div className="menu-wrapper" ref={dropdownRef}>
            <IoEllipsisVertical
              className="menu-icon"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            />

            {dropdownOpen && (
              <div className="dropdown-menu">
                <div onClick={handleShare}>Share Contact</div>
                {session?.user?.id === user.id && (
                  <div onClick={() => setEditOpen(true)}>Edit Profile</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* AVATAR */}
        <div className="profile-avatar-section">
          <img
            src={
              user.photo ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`
            }
            alt={user.name}
            className="profile-avatar2"
          />

          <h2>{user.name}</h2>
          <p className="username">@{user.username}</p>
        </div>

        {/* ACTIONS */}
        <div className="profile-actions">
          <div
            className="action-card"
            onClick={() => setCallModal({ open: true, type: "voice" })}
          >
            <FiPhone />
            <span>Voice</span>
          </div>

          <div
            className="action-card"
            onClick={() => setCallModal({ open: true, type: "video" })}
          >
            <FiVideo />
            <span>Video</span>
          </div>
        </div>

        {/* INFO */}
        <div className="profile-info">
          <div className="info-row">
            <p className="label">Username</p>
            <p className="value">@{user.username}</p>
          </div>

          

          <div className="info-row">
            <p className="label">About</p>
            <p className="value">
              {user.bio || "This user hasn't added an about section yet."}
            </p>
          </div>
        </div>
      </div>

      {/* CALL MODAL */}
      {callModal.open && (
        <CallModal
          type={callModal.type}
          participant={{
            name: user.name,
            avatar: user.photo
          }}
          onClose={() => setCallModal({ ...callModal, open: false })}  
        />
      )}

      {/* EDIT MODAL */}
      {editOpen && (
        <EditProfileModal
          user={user}
          onClose={() => setEditOpen(false)}
          onSave={(data) => {
            setUser(data);
            setEditOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default UsersProfile;
