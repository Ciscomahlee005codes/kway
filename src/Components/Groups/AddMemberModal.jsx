import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "../../supabase";
import { FaTimes, FaCheck, FaSearch } from "react-icons/fa";
import "./AddMemberModal.css";

const AddMemberModal = ({ groupId, existingMembers = [], onClose, onAdded }) => {

  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  // FETCH USERS NOT IN GROUP
  const fetchUsers = async () => {

    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    const currentUserId = userData?.user?.id;

    const excludedIds = [...existingMembers, currentUserId];

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .not(
        "id",
        "in",
        `(${excludedIds.map(id => `"${id}"`).join(",")})`
      );

    if (!error) {
      setUsers(data || []);
    }

    setLoading(false);
  };


  // TOGGLE SELECT USER
  const toggleUser = (user) => {

    setSelected(prev =>
      prev.find(u => u.id === user.id)
        ? prev.filter(u => u.id !== user.id)
        : [...prev, user]
    );

  };


  // FILTER USERS (SEARCH)
  const filteredUsers = useMemo(() => {

    if (!search.trim()) return users;

    return users.filter(user =>
      (user.name || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||

      (user.email || "")
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  }, [search, users]);


  // ADD MEMBERS
  const addMembers = async () => {

    if (!selected.length) return;

    const membersToAdd = selected.map(user => ({
      group_id: groupId,
      user_id: user.id,
      role: "member"
    }));

    const { error } = await supabase
      .from("group_members")
      .insert(membersToAdd);

    if (error) {
      console.error(error.message);
      return;
    }

    onAdded();
    onClose();

  };


  return (
    <div className="modal-overlay">

      <div className="modal">

        <FaTimes
          className="close-btn4"
          onClick={onClose}
        />

        <h3>Add Members ({selected.length})</h3>


        {/* SEARCH INPUT */}

        <div className="search-box">

          <FaSearch />

          <input
            placeholder="Search users..."
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
          />

        </div>


        {/* USER LIST */}

        <div className="user-list">

          {loading ? (

            <p className="empty-text">Loading users...</p>

          ) : filteredUsers.length === 0 ? (

            <p className="empty-text">
              No users available to add
            </p>

          ) : (

            filteredUsers.map(user => {

              const isSelected =
                selected.find(x => x.id === user.id);

              return (

                <div
                  key={user.id}
                  className={`user-item ${
                    isSelected ? "selected" : ""
                  }`}
                  onClick={()=>toggleUser(user)}
                >

                  <div className="avatar">

                    {user.photo ? (

                      <img src={user.photo} alt="avatar" />

                    ) : (

                      <span>
                        {user.name?.charAt(0)?.toUpperCase()}
                      </span>

                    )}

                  </div>

                  <span>
                    {user.name || user.email}
                  </span>

                </div>

              );

            })

          )}

        </div>


        {/* ADD BUTTON */}

        <button
          className="next-btn"
          disabled={!selected.length}
          onClick={addMembers}
        >
          Add Members <FaCheck />
        </button>
      </div>
    </div>
  );

};

export default AddMemberModal;