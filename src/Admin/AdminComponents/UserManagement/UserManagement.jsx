import React, { useState } from "react";
import "./UserManagement.css";

const UserManagement = () => {
  const [search, setSearch] = useState("");

  const users = [
    { id: 1, name: "Chidera", phone: "08123456789", status: "online" },
    { id: 2, name: "Kelvin", phone: "07012345678", status: "offline" },
    { id: 3, name: "Oluchi", phone: "09098765432", status: "online" },
    { id: 4, name: "Blessing", phone: "08022334455", status: "blocked" },
  ];

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="adminDash-userPage">

      {/* Header */}
      <h1 className="adminDash-userHeader">User Management</h1>

      {/* Search Bar */}
      <div className="adminDash-searchWrapper">
        <input
          type="text"
          placeholder="Search users…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="adminDash-searchInput"
        />
      </div>

      {/* User Table */}
      <div className="adminDash-tableWrapper">
        <table className="adminDash-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Status</th>
              <th style={{ textAlign: "center" }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.phone}</td>

                  <td>
                    <span
                      className={`adminDash-status adminDash-${user.status}`}
                    >
                      {user.status}
                    </span>
                  </td>

                  <td className="adminDash-actions">
                    <button className="adminDash-btn view">View</button>
                    <button className="adminDash-btn block">Block</button>
                    <button className="adminDash-btn delete">Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="adminDash-empty">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
