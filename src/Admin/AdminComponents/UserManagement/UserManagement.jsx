import React, { useEffect, useState } from "react";
import "./UserManagement.css";
import { supabase } from "../../../supabase";
import Avatar from "../../../assets/avatar.png";

const dummyImg = Avatar;

const UserManagement = () => {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // ================= FETCH USERS =================
  const fetchUsers = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
    } else {
      setUsers(data);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ================= SEARCH =================
  const filteredUsers = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.username?.toLowerCase().includes(search.toLowerCase())
  );

  // ================= DELETE USER =================
  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user permanently?")) return;

    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", id);

    if (error) alert(error.message);
    else {
      alert("User deleted");
      fetchUsers();
      setSelectedUser(null);
    }
  };

  // ================= CHANGE ROLE =================
  const changeRole = async (id, role) => {
    const { error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", id);

    if (error) alert(error.message);
    else fetchUsers();
  };

  // ================= CHANGE GENDER =================
  const changeGender = async (id, gender) => {
    const { error } = await supabase
      .from("profiles")
      .update({ gender })
      .eq("id", id);

    if (error) alert(error.message);
    else fetchUsers();
  };

  return (
    <div className="user-page">

      <div className="user-header">
        <h1>User Management</h1>
        <p>Manage all Kway users efficiently</p>
      </div>

      {/* SEARCH */}
      <div className="search-wrapper">
        <input
          type="text"
          placeholder="Search by name or username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <div className="table-wrapper">
        <table className="user-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Username</th>
              <th>DOB</th>
              <th>Gender</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr><td colSpan="6">Loading...</td></tr>
            ) : filteredUsers.length ? (
              filteredUsers.map((user) => (
                <tr key={user.id}>

                  <td className="user-cell">
                    <img src={user.photo || dummyImg} alt="profile" />
                    <span>{user.name}</span>
                  </td>

                  <td>@{user.username}</td>
                  <td>{user.dob || "—"}</td>
                  <td>{user.gender || "—"}</td>
                  <td className="actions">
                    <button
                      className="btn view"
                      onClick={() => setSelectedUser(user)}
                    >
                      View
                    </button>

                    <button
                      className="btn delete"
                      onClick={() => deleteUser(user.id)}
                    >
                      Delete
                    </button>
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="empty">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
{selectedUser && (
  <div className="modal">
    <div className="modal-box">

      <button className="close" onClick={() => setSelectedUser(null)}>×</button>

      <div className="modal-header">
        <img
          src={selectedUser.photo || dummyImg}
          alt="profile"
          className="modal-avatar"
        />
        <h2>{selectedUser.name}</h2>
        <span className="username">@{selectedUser.username}</span>
      </div>

      <div className="modal-info">

        <div className="info-row">
          <span className="label">Date of Birth</span>
          <span className="value">{selectedUser.dob || "—"}</span>
        </div>

        <div className="info-row">
          <span className="label">Gender</span>
          <span className="value">{selectedUser.gender || "—"}</span>
        </div>

        <div className="info-row">
          <span className="label">Bio</span>
          <span className="value bio">
            {selectedUser.about || "No bio yet"}
          </span>
        </div>

      </div>

      <button
        className="btn delete full"
        onClick={() => deleteUser(selectedUser.id)}
      >
        Delete User
      </button>

    </div>
  </div>
)}
    </div>
  );
};

export default UserManagement;