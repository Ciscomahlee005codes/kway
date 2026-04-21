import React, { useState } from "react";
import "./AddContactModal.css";

const AddContactModal = ({ contacts, onClose, onStartChat }) => {
  const [search, setSearch] = useState("");

  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="add-contact-modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>

        <h3>Link Ups</h3>

        <input
          placeholder="Search username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="contact-list">
          {filtered.length === 0 ? (
            <p>No contacts found</p>
          ) : (
            filtered.map((user) => (
              <div
                key={user.id}
                className="contact-item"
                onClick={() => {
                  onStartChat(user);
                  onClose();
                }}
              >
                <div className="avatar">
                  {user.avatar
                    ? <img src={user.avatar} alt="" />
                    : user.name[0]}
                </div>

                <div>
                  <h4>{user.name}</h4>
                  <small>@{user.username}</small>
                </div>
              </div>
            ))
          )}
        </div>

        <button className="close-btn" onClick={onClose}>
          Close
        </button>

      </div>
    </div>
  );
};

export default AddContactModal;
