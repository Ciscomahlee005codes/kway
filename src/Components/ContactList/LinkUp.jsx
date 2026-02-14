import React, { useState, useMemo, useEffect } from "react";
import "./ProfileView.css";
import { supabase } from "../../supabase";
import { UserAuth } from "../../Context/AuthContext";
import { FiSearch } from "react-icons/fi";
import { IoMdAdd } from "react-icons/io";
import { FaTimes, FaPhone, FaCommentDots } from "react-icons/fa";
import { useNavigate } from "react-router-dom";


const LinkUp = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState(null); // Selected user for bottom modal
  const navigate = useNavigate();


  const { session } = UserAuth();

  // Fetch all profiles except current user
  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, username, photo, about")
        .neq("id", session?.user?.id)
        .order("name", { ascending: true });

      if (error) {
        console.error(error);
        return;
      }

      setContacts(data);
      setLoading(false);
    };

    if (session) fetchUsers();
  }, [session]);

  const filteredContacts = useMemo(() => {
    return contacts
      .filter(
        (contact) =>
          contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.username.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [contacts, searchTerm]);

  return (
    <div className="contact-list-wrapper">
      {/* Header */}
      <div className="contact-header">
        <h2>Contacts</h2>
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

      {/* Contacts List */}
      <div className="contacts">
        {filteredContacts.length > 0 ? (
          filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className="contact-item"
              onClick={() => setSelectedProfile(contact)}
            >
              <div className="contact-avatar">
                {contact.photo ? (
                  <img src={contact.photo} alt="avatar" />
                ) : (
                  contact.name[0].toUpperCase()
                )}
              </div>
              <div className="contact-info">
                <h4>{contact.name}</h4>
                <p>@{contact.username}</p>
                <span className="contact-bio">{contact.about}</span>
              </div>
            </div>
          ))
        ) : (
          <p className="no-contacts">{loading ? "Loading..." : "No users found 😕"}</p>
        )}
      </div>

      {/* Bottom Profile Modal */}
      {selectedProfile && (
        <div
          className="profile-modal-overlay"
          onClick={() => setSelectedProfile(null)}
        >
          <div
            className="profile-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-btn"
              onClick={() => setSelectedProfile(null)}
            >
              <FaTimes />
            </button>
            <div className="profile-modal-header">
              <div className="profile-avatar-large">
                {selectedProfile.photo ? (
                  <img src={selectedProfile.photo} alt="avatar" />
                ) : (
                  selectedProfile.name[0].toUpperCase()
                )}
              </div>
              <h3>{selectedProfile.name}</h3>
              <p className="username">@{selectedProfile.username}</p>
            </div>
            <p className="profile-about">{selectedProfile.about}</p>

            <div className="profile-actions">
              <button className="action-btn">
                <FaPhone /> Call
              </button>
               <button
  className="action-btn"
  onClick={() => {
    navigate(`/chat/${selectedProfile.id}`);
  }}
>
  <FaCommentDots /> Chat
</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LinkUp;
