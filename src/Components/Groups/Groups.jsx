import React, { useState, useEffect } from "react";
import { FaUsers, FaPlus, FaSearch } from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";
import { MdGroupAdd } from "react-icons/md";
import { motion } from "framer-motion";
import { supabase } from "../../supabase";
import { useNavigate } from "react-router-dom";
import CreateGroupModal from "./CreateGroupModal";
import "./Groups.css";

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return;

  const { data: memberships, error } = await supabase
    .from("group_members")
    .select("group_id")
    .eq("user_id", user.id);

  if (error) {
    console.log("❌ MEMBERSHIP ERROR:", error.message);
    return;
  }

  if (!memberships?.length) {
    setGroups([]);
    return;
  }

  const ids = memberships.map(m => m.group_id);

  const { data: groupsData } = await supabase
    .from("groups")
    .select("*")
    .in("id", ids);

  setGroups(groupsData || []);
};

  const filtered = groups.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="groups-page">

      {/* HEADER */}
      <div className="groups-header">
        <h2>Groups</h2>

        <button className="create-btn" onClick={() => setShowModal(true)}>
          <MdGroupAdd /> New Group
        </button>
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
            onClick={() => navigate(`/group/${group.id}`)}
          >
            <img
              src={group.image || "https://i.pravatar.cc/150"}
              alt="group"
              width={55}
              height={55}
            />

            <div className="group-info">
              <h3>{group.name}</h3>
              <p>{group.lastMessage}</p>
              <div className="group-meta">
                <span>{group.time}</span>
              </div>
            </div>

            <IoIosArrowForward className="arrow" />
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="groups-empty">
          <FaUsers />
          <h3>No Groups Found</h3>
          <p>Create a new group to start chatting</p>
        </div>
      )}

      {/* FAB */}
      <button className="fab-create" onClick={() => setShowModal(true)}>
        <FaPlus />
      </button>

      {/* MODAL */}
      {showModal && (
        <CreateGroupModal
          onClose={() => setShowModal(false)}
          onCreated={fetchGroups}
        />
      )}
    </div>
  );
};

export default Groups;