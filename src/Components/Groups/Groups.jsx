import React, { useState } from "react";
import { FaUsers, FaPlus, FaSearch } from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";
import { MdGroupAdd } from "react-icons/md";
import { motion } from "framer-motion";
import coverImg from "../../assets/cover-img.jpg";
import schoolImg from "../../assets/school-logo.jpeg";
import "./Groups.css";

const demoGroups = [
  {
    id: 1,
    name: "Kway Developers",
    lastMessage: "Bro the React fix works 🔥",
    members: 128,
    image: coverImg,
    unread: 3,
  },
  {
    id: 2,
    name: "Nsude Alumni",
    lastMessage: "Admin dashboard ready for review",
    members: 24,
    image: schoolImg,
    unread: 0,
  },
  {
    id: 3,
    name: "Baker's Palace Staff",
    lastMessage: "New cake design uploaded",
    members: 9,
    image: "https://i.pravatar.cc/150?img=8",
    unread: 1,
  },
];

const Groups = () => {
  const [search, setSearch] = useState("");

  const filtered = demoGroups.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="groups-page">
      {/* HEADER */}
      <div className="groups-header">
        <h2>Groups</h2>

        <div className="groups-header-actions">
          <button className="create-btn">
            <MdGroupAdd /> New Group
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <div className="groups-search">
        <FaSearch />
        <input
          placeholder="Search groups..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* GROUP LIST */}
      <div className="groups-list">
        {filtered.map(group => (
          <motion.div
            key={group.id}
            className="group-card"
            whileHover={{ scale: 1.02 }}
          >
            <img src={group.image} alt="group" />

            <div className="group-info">
              <h3>{group.name}</h3>
              <p>{group.lastMessage}</p>

              <div className="group-meta">
                <span>{group.members} members</span>
              </div>
            </div>

            {group.unread > 0 && (
              <div className="unread-badge">{group.unread}</div>
            )}

            <IoIosArrowForward className="arrow" />
          </motion.div>
        ))}
      </div>

      {/* EMPTY STATE */}
      {filtered.length === 0 && (
        <div className="groups-empty">
          <FaUsers />
          <h3>No Groups Found</h3>
          <p>Create a new group to start chatting</p>
        </div>
      )}

      {/* FAB */}
      <button className="fab-create">
        <FaPlus />
      </button>
    </div>
  );
};

export default Groups;