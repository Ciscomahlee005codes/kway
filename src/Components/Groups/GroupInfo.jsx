import React, { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import { useParams, useNavigate } from "react-router-dom";
import "./GroupInfo.css";

const GroupInfo = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    fetchGroup();
    fetchMembers();
  }, []);

   useEffect(() => {
    document.body.classList.add("chat-open");
  
    return () => {
      document.body.classList.remove("chat-open");
    };
  }, []);
  const fetchGroup = async () => {
    const { data } = await supabase
      .from("groups")
      .select("*")
      .eq("id", id)
      .single();

    setGroup(data);
  };

  const fetchMembers = async () => {
  const { data, error } = await supabase
    .from("group_members")
    .select(`
      role,
      user_id,
      profiles:user_id (
        id,
        name,
        photo
      )
    `)
    .eq("group_id", id);

  if (error) {
    console.log("❌ MEMBERS ERROR:", error.message);
    return;
  }

  const uniqueMembers = Array.from(
  new Map((data || []).map(m => [m.user_id, m])).values()
);

setMembers(uniqueMembers);
};

  return (
    <div className="group-info-page">

      {/* HEADER */}
      <div className="group-info-header">
        <button onClick={() => navigate(-1)}>←</button>
        <h3>Group Info</h3>
      </div>

      {/* GROUP DETAILS */}
      <div className="group-card">

        <div className="group-avatar">
          {group?.image ? (
            <img src={group.image} alt="" />
          ) : (
            <span>{group?.name?.charAt(0)}</span>
          )}
        </div>

        <h2>{group?.name}</h2>
        <p>{members.length} members</p>
      </div>

      {/* MEMBERS */}
      <div className="members-section">
        <h4>Participants</h4>

        {members.map((m, i) => (
          <div key={i} className="member-item">

            {m.profiles?.photo ? (
              <img src={m.profiles.photo} alt="" />
            ) : (
              <div className="avatar-fallback">
                {m.profiles?.name?.charAt(0)}
              </div>
            )}

            <div className="member-info">
              <p>{m.profiles?.name || "User"}</p>
              <span className={m.role === "admin" ? "admin" : ""}>
                {m.role}
              </span>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};

export default GroupInfo;