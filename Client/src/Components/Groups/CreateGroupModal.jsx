import React, { useState, useEffect } from "react";
import { supabase } from "../../supabase";
import { FaTimes, FaArrowRight } from "react-icons/fa";
import "./CreateGroupModal.css";

const CreateGroupModal = ({ onClose, onCreated }) => {
  const [step, setStep] = useState(1); // 🔥 STEP CONTROL
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState([]);

  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u =>
  (u.name || u.email)
    ?.toLowerCase()
    .includes(search.toLowerCase())
);

  const fetchUsers = async () => {
  const { data: userData } = await supabase.auth.getUser();
  const currentUser = userData?.user;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .neq("id", currentUser.id); // 🚀 exclude yourself

  setUsers(data || []);
};

  const toggleUser = (user) => {
    setSelected(prev =>
      prev.find(u => u.id === user.id)
        ? prev.filter(u => u.id !== user.id)
        : [...prev, user]
    );
  };

  const handleImage = (file) => {
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  // ✅ FINAL CREATE
  const createGroup = async () => {
    if (!name.trim()) return;

    setLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
if (!user) throw new Error("User not logged in");

      let imageUrl = null;

      if (image) {
        const fileName = `group-${Date.now()}`;

        const { error } = await supabase.storage
          .from("group-images")
          .upload(fileName, image);

        if (error) throw error;

        const { data } = supabase.storage
          .from("group-images")
          .getPublicUrl(fileName);

        imageUrl = data.publicUrl;
      }

      // ✅ CREATE GROUP
      const { data: group, error } = await supabase
        .from("groups")
        .insert({
          name,
          image: imageUrl,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // ✅ ONLY SELECTED USERS + YOU
      const memberIds = [...new Set([...selected.map(u => u.id), user.id])];

const members = memberIds.map(uid => ({
  group_id: group.id,
  user_id: uid,
  role: uid === user.id ? "admin" : "member"
}));

      const { data: insertedMembers, error: memberError } = await supabase
.from("group_members")
.insert(members)
.select();

console.log("Inserted members:", insertedMembers);

if (memberError) {
  console.log("❌ MEMBER INSERT ERROR:", memberError.message);
  alert(memberError.message);
}
if (memberError) {
  console.log("❌ MEMBER INSERT ERROR:", memberError.message);
  alert(memberError.message);
}

      onCreated();
      onClose();

    } catch (err) {
  console.error("CREATE GROUP ERROR:", err);
  alert(err.message || "Something went wrong bro 😅");
}

    setLoading(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">

        <FaTimes className="close-btn4" onClick={onClose} />

        {/* ================= STEP 1 ================= */}
        {step === 1 && (
          <>
            <h3>Select Members ({selected.length})</h3>

            <div className="search-box">
  <input
    type="text"
    placeholder="Search users..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />
</div>

            <div className="user-list">
              {filteredUsers.map(u => {
                const isSelected = selected.find(x => x.id === u.id);

                return (
                  <div
                    key={u.id}
                    className={`user-item ${isSelected ? "selected" : ""}`}
                    onClick={() => toggleUser(u)}
                  >
                    <div className="avatar">
  {u.photo ? (
    <img src={u.photo} alt="avatar" />
  ) : (
    <span>{u.name?.charAt(0).toUpperCase()}</span>
  )}
</div>

                    <span>{u.name || u.email}</span>
                  </div>
                );
              })}
            </div>

            <button
              className="next-btn"
              onClick={() => setStep(2)}
              disabled={selected.length === 0}
            >
              Next <FaArrowRight />
            </button>
          </>
        )}

        {/* ================= STEP 2 ================= */}
        {step === 2 && (
          <>
            <h3>New Group</h3>

            <div className="image-picker">
              <label>
                <input
                  type="file"
                  hidden
                  onChange={e => handleImage(e.target.files[0])}
                />
                <div className="image-box">
                  {preview ? <img src={preview} /> : <span>+</span>}
                </div>
              </label>
            </div>

            <input
              placeholder="Group name..."
              value={name}
              onChange={e => setName(e.target.value)}
            />

            <button
              className="create-btn-modal"
              onClick={createGroup}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Group"}
            </button>
          </>
        )}

      </div>
    </div>
  );
};

export default CreateGroupModal;