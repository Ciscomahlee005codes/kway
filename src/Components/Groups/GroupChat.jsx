import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../supabase";
import { UserAuth } from "../../Context/AuthContext";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { BsThreeDotsVertical } from "react-icons/bs";
import "./GroupChat.css";

const GroupChat = () => {
  const { id } = useParams();
  const { session } = UserAuth();
  const user = session?.user;

  const [messages, setMessages] = useState([]);
  const [group, setGroup] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const bottomRef = useRef();

  useEffect(() => {
    if (!id) return;
    fetchGroup();
    fetchMessages();
  }, [id]);

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

  const fetchMessages = async () => {
  const { data, error } = await supabase
    .from("group_messages")
    .select(`
      id,
      content,
      created_at,
      sender_id,
      reply_to,
      profiles:sender_id (
        name,
        photo
      )
    `)
    .eq("group_id", id)
    .order("created_at", { ascending: true });

  if (error) {
    console.log("❌ FETCH ERROR:", error.message);
    return;
  }

  setMessages(data || []);
};

 useEffect(() => {
  if (!id) return;

  const channel = supabase
    .channel("group-chat")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "group_messages",
        filter: `group_id=eq.${id}`,
      },
      async (payload) => {
        const newMsg = payload.new;

        // fetch sender profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("name, photo")
          .eq("id", newMsg.sender_id)
          .single();

        setMessages(prev => [
          ...prev,
          { ...newMsg, profiles: profile }
        ]);
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

const sendMessage = async () => {
  if (!newMessage.trim()) return;

  const text = newMessage;

  setNewMessage("");
  setReplyTo(null);

  const { error } = await supabase
    .from("group_messages")
    .insert({
      group_id: id,
      sender_id: user.id,
      content: text,
      reply_to: replyTo?.id || null
    });

  if (error) {
    console.log("❌ INSERT ERROR:", error.message);
    alert(error.message);
  }
};

  return (
    <div className="chat-container">

      {/* 🔥 HEADER */}
      <div className="chat-header">

  {/* BACK BUTTON (mobile only) */}
  <IoArrowBack
    className="group-back-btn"
    onClick={() => navigate("/groups")}
  />

  <div
    className="chat-header-left"
    onClick={() => navigate(`/group-info/${id}`)}
  >
    <img
      src={group?.image || "https://i.pravatar.cc/150"}
      alt="group"
    />

    <div>
      <h3>{group?.name || "Loading..."}</h3>
      <span>{messages.length} messages</span>
    </div>
  </div>

  <div className="menu-wrapper">

    <BsThreeDotsVertical
      className="menu-icon"
      onClick={() => setShowMenu(prev => !prev)}
    />

    {showMenu && (
      <div className="dropdown-menu">

        <button onClick={() => navigate(`/group-info/${id}`)}>
          View Group Info
        </button>

        <button>Search Messages</button>

        <button>Mute Notifications</button>

        <button>Leave Group</button>

      </div>
    )}

  </div>

</div>

      {/* 🔥 CHAT BODY */}
      <div className="chat-body">
        {messages.map(msg => {
          const isOwn = msg.sender_id === user?.id;
{msg.reply_to && (
  <div className="reply-box">
    <small>Replying to</small>
    <p>{msg.reply_to?.content || "Message"}</p>
  </div>
)}
          return (
            <div key={msg.id} className={`message-row ${isOwn ? "own" : ""}`}>

              {!isOwn && (
                <img
                  className="avatar"
                  src={msg.profiles?.photo || ""}
                  alt=""
                />
              )}

              <div className="message-bubble" onDoubleClick={() => setReplyTo(msg)}>

  {msg.reply_to && (
    <div className="reply-box">
      <small>Replying to</small>
      <p>{msg.reply_to?.content || "Message"}</p>
    </div>
  )}

  {!isOwn && (
    <span className="sender-name">
      {msg.profiles?.name || "User"}
    </span>
  )}

  <p>{msg.content}</p>

</div>
            </div>
          );
          
        })}
        
        <div ref={bottomRef}></div>
      </div>
{replyTo && (
  <div className="reply-preview">
    <span>{replyTo.profiles?.name || "User"}</span>
    <p>{replyTo.content}</p>
    <button onClick={() => setReplyTo(null)}>✕</button>
  </div>
)}
      {/* 🔥 INPUT */}
      <div className="chat-input-wrapper">
        <input
          placeholder="Type a message..."
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
        />
        <button onClick={sendMessage}>Send</button>
      </div>

    </div>
  );
};

export default GroupChat;