import React, { useState } from "react";
import "./UserManagement.css";

const dummyImg = "https://i.pravatar.cc/150?img=12";

const UserManagement = () => {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const users = [
    { id: 1, name: "Chidera", username: "@chidera_dev", status: "online", email: "chi@mail.com", role: "Tenant" },
    { id: 2, name: "Kelvin", username: "@kelvin_codes", status: "offline", email: "kel@mail.com", role: "Agent" },
    { id: 3, name: "Oluchi", username: "@oluchi_design", status: "online", email: "olu@mail.com", role: "Landlord" },
    { id: 4, name: "Blessing", username: "@blessing_ui", status: "blocked", email: "bles@mail.com", role: "Admin" },
  ];

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="user-page">
      <div className="user-header">
        <h1>User Management</h1>
        <p>Manage all Kway users efficiently</p>
      </div>

      <div className="search-wrapper">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="table-wrapper">
        <table className="user-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Username</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.length ? (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td data-label="User" className="user-cell">
                    <img src={dummyImg} alt="profile" />
                    <span>{user.name}</span>
                  </td>

                  <td data-label="Username">{user.username}</td>

                  <td data-label="Status">
                    <span className={`status ${user.status}`}>
                      {user.status}
                    </span>
                  </td>

                  <td data-label="Actions" className="actions">
                    <button
                      className="btn view"
                      onClick={() => setSelectedUser(user)}
                    >
                      View
                    </button>
                    <button className="btn block">Block</button>
                    <button className="btn delete">Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="empty">
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

            <img src={dummyImg} alt="profile" className="modal-avatar" />

            <h2>{selectedUser.name}</h2>
            <p><b>Username:</b> {selectedUser.username}</p>
            <p><b>Email:</b> {selectedUser.email}</p>
            <p><b>Role:</b> {selectedUser.role}</p>
            <p><b>Status:</b> {selectedUser.status}</p>

            <button className="btn block full">Block User</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
