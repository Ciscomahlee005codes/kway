import React, { useState, useMemo } from "react";
import "./ContactList.css";
import { FiSearch } from "react-icons/fi";
import { IoMdAdd } from "react-icons/io";

// Example structure based on new Kway model
const dummyContacts = [
  {
    id: 1,
    full_name: "Alice Johnson",
    username: "alice_j",
    avatar_url: "",
    bio: "Frontend Dev 🚀",
  },
  {
    id: 2,
    full_name: "Bob Smith",
    username: "bobcodes",
    avatar_url: "",
    bio: "Building cool stuff",
  },
  {
    id: 3,
    full_name: "Charlie Brown",
    username: "charlie_b",
    avatar_url: "",
    bio: "Coffee + Code",
  },
   {
    id: 4,
    full_name: "Alex Dibe",
    username: "alex_tony",
    avatar_url: "",
    bio: "Accounting Student",
  },
];

const ContactList = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredContacts = useMemo(() => {
    return dummyContacts
      .filter((contact) =>
        contact.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.username.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => a.full_name.localeCompare(b.full_name));
  }, [searchTerm]);

  return (
    <div className="contact-list-wrapper">
      <div className="contact-header">
        <h2>Chats</h2>

        <div className="contact-actions">
          <button className="btn">
            <IoMdAdd /> New Chat
          </button>

          <button className="btn secondary">
            <IoMdAdd /> New Group
          </button>
        </div>

        <div className="contact-search">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by name or username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="contacts">
        {filteredContacts.length > 0 ? (
          filteredContacts.map((contact) => (
            <div key={contact.id} className="contact-item">
              <div className="contact-avatar">
                {contact.avatar_url ? (
                  <img src={contact.avatar_url} alt="avatar" />
                ) : (
                  contact.full_name[0].toUpperCase()
                )}
              </div>

              <div className="contact-info">
                <h4>{contact.full_name}</h4>
                <p>@{contact.username}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="no-contacts">No users found 😕</p>
        )}
      </div>
    </div>
  );
};

export default ContactList;
