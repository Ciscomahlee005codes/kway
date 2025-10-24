import React, { useState } from "react";
import "./ContactList.css";
import { FiSearch } from "react-icons/fi";
import { IoMdAdd } from "react-icons/io";

const dummyContacts = [
  { id: 1, name: "Alice Johnson", phone: "+2348012345678" },
  { id: 2, name: "Bob Smith", phone: "+2348098765432" },
  { id: 3, name: "Charlie Brown", phone: "+2348023456789" },
  { id: 4, name: "David Okoro", phone: "+2348034567890" },
  { id: 5, name: "Eunice Abiola", phone: "+2348045678901" },
  { id: 6, name: "Faith Chukwudi", phone: "+2348056789012" },
  { id: 7, name: "George Emeka", phone: "+2348067890123" },
  { id: 8, name: "Hannah Ijeoma", phone: "+2348078901234" },
];

const ContactList = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredContacts = dummyContacts
    .sort((a, b) => a.name.localeCompare(b.name))
    .filter(contact =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="contact-list-wrapper">
      <div className="contact-header">
        <h2>Contacts</h2>
        <div className="contact-actions">
          <button className="btn new-contact">
            <IoMdAdd /> New Contact
          </button>
          <button className="btn new-group">
            <IoMdAdd /> New Group
          </button>
        </div>
        <div className="contact-search">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="contacts">
        {filteredContacts.length > 0 ? (
          filteredContacts.map(contact => (
            <div key={contact.id} className="contact-item">
              <div className="contact-avatar">
                {contact.name[0].toUpperCase()}
              </div>
              <div className="contact-info">
                <h4>{contact.name}</h4>
                <p>{contact.phone}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="no-contacts">No contacts found 😕</p>
        )}
      </div>
    </div>
  );
};

export default ContactList;
