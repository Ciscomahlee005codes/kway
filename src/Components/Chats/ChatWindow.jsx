import React, { useState } from "react";
import { IoArrowBack } from "react-icons/io5";
import { FiPhone, FiVideo, FiSend, FiSmile } from "react-icons/fi";
import { FaMicrophoneAlt } from "react-icons/fa";
import { FaCameraRetro } from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import EmojiPicker from "emoji-picker-react";
import { useEffect, useRef } from "react";
import { supabase } from "../../supabase";
import { UserAuth } from "../../Context/AuthContext";
import KwayLogo from "../../assets/kway-logo-1.png";
import VoiceNotePlayer from "./VoiceNotePlayer";


const ChatWindow = ({
  selectedMedia,
  setSelectedMedia,
  mediaCaption,
  setMediaCaption,
  activeChat,
  setActiveChat,
  newMessage,
  setNewMessage,
  handleSendMessage,
  showChatDropdown,
  setShowChatDropdown,
  setShowSidebarDropdown,
  setShowCallModal,
  setCallType,
  reactionPicker,
  setReactionPicker,
  reactions,
  handleReactionClick
}) => {
  const navigate = useNavigate();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
const audioChunksRef = useRef([]);
  const [pressTimer, setPressTimer] = useState(null);
   const [isTyping, setIsTyping] = useState(false);
   const channel = supabase.channel("typing-status");
  const emojiRef = useRef(null);
  const dropdownRef = useRef(null);
  const typingChannelRef = useRef(null);

  const { session } = UserAuth() || {};


useEffect(() => {
  // Close dropdown when chat changes
  setShowChatDropdown(false);
}, [activeChat]);

const startRecording = async () => {

  if (!activeChat) return;

  try {

    const stream =
      await navigator.mediaDevices.getUserMedia({
        audio: true
      });

    const recorder =
       new MediaRecorder(stream, {
    mimeType: "audio/webm"
  });

    mediaRecorderRef.current = recorder;

    audioChunksRef.current = [];

    recorder.ondataavailable = e => {

      if (e.data.size > 0) {

        audioChunksRef.current.push(e.data);

      }

    };

    recorder.onstop = async () => {

  console.log("Recording stopped");

  if (!audioChunksRef.current.length) {
    console.log("❌ No audio chunks captured");
    return;
  }

  const blob = new Blob(
    audioChunksRef.current,
    { type: "audio/webm" }
  );

  console.log("Blob size:", blob.size);

  const fileName =
    `voice-${Date.now()}.webm`;

  const { error: uploadError } =
    await supabase.storage
      .from("chat-media")
      .upload(fileName, blob);

  if (uploadError) {

    console.log("Upload failed:", uploadError);

    return;

  }

  const { data } =
    supabase.storage
      .from("chat-media")
      .getPublicUrl(fileName);

  if (!data?.publicUrl) {

    console.log("No public URL");

    return;

  }

  console.log("Voice uploaded:", data.publicUrl);

  await sendVoiceMessage(
    data.publicUrl
  );

  stream
    .getTracks()
    .forEach(track => track.stop());

  setRecording(false);

};

    recorder.start(100); // 🔥 critical fix

    setRecording(true);

  } catch (err) {

    console.log("Mic permission denied");

  }

};

const stopRecording = () => {

  if (!mediaRecorderRef.current) return;

  if (
    mediaRecorderRef.current.state === "recording"
  ) {

    mediaRecorderRef.current.stop();

  }

};

const sendVoiceMessage = async (audioUrl) => {

  const { data } = await supabase
    .from("messages")
    .insert({
      sender_id: session.user.id,
      receiver_id: activeChat.id,
      content: audioUrl,
      type: "audio"
    })
    .select()
    .single();

  if (!data) return;

  setActiveChat(prev => ({
    ...prev,
    messages: [
      ...(prev.messages || []),
      {
        id: data.id,
        content: audioUrl,
        sender: "you",
        type: "audio",
        time: new Date(data.created_at).toLocaleTimeString(),
        status: "sent"
      }
    ]
  }));
};

// Real Time Chatting
useEffect(() => {
  if (!activeChat) return;

  typingChannelRef.current = supabase
    .channel("typing-status")
    .on("broadcast", { event: "typing" }, ({ payload }) => {
      if (payload.sender === activeChat.id) {
        setIsTyping(true);
      }
    })
    .on("broadcast", { event: "stop_typing" }, ({ payload }) => {
      if (payload.sender === activeChat.id) {
        setIsTyping(false);
      }
    })
    .subscribe();

  return () => {
    supabase.removeChannel(typingChannelRef.current);
  };
}, [activeChat]);

const typingTimeoutRef = useRef(null);

const handleTyping = () => {
  if (!typingChannelRef.current) return;

  typingChannelRef.current.send({
    type: "broadcast",
    event: "typing",
    payload: {
      sender: session.user.id,
      receiver: activeChat.id,
    },
  });

  clearTimeout(typingTimeoutRef.current);

  typingTimeoutRef.current = setTimeout(() => {
    typingChannelRef.current.send({
      type: "broadcast",
      event: "stop_typing",
      payload: {
        sender: session.user.id,
        receiver: activeChat.id,
      },
    });
  }, 1200);
};

const openStatusPreview = async (msg) => {

  const { data } = await supabase
    .from("status")
    .select("*")
    .eq("id", msg.status_id)
    .single();

  if (!data) return;

  navigate(`/status?story=${data.id}`);
};
useEffect(() => {
  if (activeChat) {
    document.body.classList.add("chat-open");
  } else {
    document.body.classList.remove("chat-open");
  }

  return () => document.body.classList.remove("chat-open");
}, [activeChat]);
const endRef = useRef(null);

useEffect(() => {
  endRef.current?.scrollIntoView({
    behavior: "auto"
  });
}, [activeChat?.messages?.length]);

useEffect(() => {
  const typingChannel = supabase
    .channel("typing-status")

    .on("broadcast", { event: "typing" }, (payload) => {
      if (payload.payload.sender === activeChat.id) {
        setIsTyping(true);

        setTimeout(() => {
          setIsTyping(false);
        }, 2000);
      }
    })

    .subscribe();

  return () => {
    supabase.removeChannel(typingChannel);
  };
}, [activeChat]);

// Media Upload Handler
const handleMediaSelect = (e) => {
  const files = Array.from(e.target.files);

  const previews = files.map(file => ({
    file,
    preview: URL.createObjectURL(file),
    type: file.type.startsWith("video") ? "video" : "image"
  }));

  setSelectedMedia(prev => [...prev, ...previews]);
};

useEffect(() => {
  if (!activeChat) return;

  supabase
    .from("messages")
    .update({ status: "seen" })
    .eq("sender_id", activeChat.id)
    .eq("receiver_id", session.user.id)
    .eq("status", "sent");
}, [activeChat]);
useEffect(() => {
  const handleClickOutside = (e) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(e.target)
    ) {
      setShowChatDropdown(false);
    }
  };
console.log("Active Chat:", activeChat);

  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);
     if (!activeChat) {
  return (
    <div className="chat-window empty-state">
      <div className="empty-chat-container">

        <div className="empty-logo">
           <img src={KwayLogo} alt="Kway Logo" className="logo-img" />
        </div>

        <h2 className="empty-title">
          Welcome to <span>Kway</span>
        </h2>

        <p className="empty-desc">
          Connect with friends using usernames,
          not just phone numbers.
        </p>

        <div className="empty-actions">
          <button onClick={() => navigate("/linkup")}>
            🔍 Find People
          </button>

          <button onClick={() => navigate("/profile")}>
            👤 Update Profile
          </button>
        </div>

        <small className="empty-footer">
          Your messages are private & secure 🔒
        </small>

      </div>
    </div>
  );
}


  

  return (
    <div className="chat-window active">
      {/* ================= HEADER ================= */}
      <div className="chat-window-header">
        <IoArrowBack
          className="arrowback-btn"
          onClick={() => setActiveChat(null)}
        />

        <div
          className="chat-header-left"
           onClick={() => navigate(`/user-profile/${activeChat.id}`)}
        >
          {activeChat.avatar ? (
  <img
    src={activeChat.avatar}
    alt={activeChat.name}
    className="chat-header-avatar"
  />
) : (
  <div className="chat-header-avatar fallback-avatar">
    {activeChat.name?.charAt(0).toUpperCase()}
  </div>
)}
          <h3>{activeChat.name}</h3>
           {isTyping && (
  <p className="typing-indicator">
    {activeChat.name} is typing...
  </p>
)}
        </div>

        <div className="header-actions">
          <FiPhone
            className="action-icon"
            onClick={() => {
              setCallType("voice");
              setShowCallModal(true);
            }}
          />
          <FiVideo
            className="action-icon"
            onClick={() => {
              setCallType("video");
              setShowCallModal(true);
            }}
          />

          <div style={{ position: "relative" }} ref={dropdownRef}>
            <BsThreeDotsVertical
              onClick={(e) => {
                e.stopPropagation();
                setShowChatDropdown(prev => !prev);
                setShowSidebarDropdown(false);
              }}
            />

            {showChatDropdown && (
              <div className="chat-dropdown-menu animated-dropdown">
                <p onClick={() => navigate(`/user-profile/${activeChat.id}`)}>View contact</p>
                <p>Search</p>
                <p>Mute notifications</p>
                <p className="danger">Block</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= MESSAGES ================= */}
      <div className="chat-messages">
      { activeChat?.messages?.map((msg, i) => {

  console.log("MESSAGE DEBUG:", msg);

  const isStatusReply = msg?.type === "status_reply";

  return (
    <div
      key={msg.id || i}
      className={`message-wrapper ${
        msg.sender === "you" ? "sent" : "received"
      }`}
    >
      <div className="message-bubble">

        {/* ================= STATUS PREVIEW ================= */}

        {isStatusReply && (
          <div
            className="status-preview-bubble"
            onClick={() => openStatusPreview(msg)}
          >
            {msg?.status_media ? (

              <img
                src={msg.status_media}
                alt="status preview"
              />

            ) : (

              <div
                className="status-text-preview"
                style={{
                  background:
                    msg?.status_bg || "#25d366"
                }}
              >
                {msg?.status_text || "Status reply"}
              </div>

            )}
          </div>
        )}

        {/* ================= MESSAGE TEXT ================= */}

   {msg.type === "image" && (
  <>
    <img src={msg.content} className="chat-media" />
    {msg.caption && (
      <p className="media-caption">{msg.caption}</p>
    )}
  </>
)}

 {msg.type === "video" && (
  <>
    <video src={msg.content} controls className="chat-media" />
    {msg.caption && (
      <p className="media-caption">{msg.caption}</p>
    )}
  </>
)}
{msg.type === "audio" && (
  <VoiceNotePlayer
    audioUrl={msg.content}
    isSender={msg.sender === "you"}
  />
)}
{(!msg.type || msg.type === "text") && (
  <p className="message-text">
    {msg?.content || msg?.text}
  </p>
)}

        {/* ================= META INFO ================= */}

        <div className="message-meta">

          <span className="time">
            {msg?.time || "12:45"}
          </span>

          {msg.sender === "you" && (

            <span
              className={`status ${
                msg?.status || ""
              }`}
            >
              {msg?.status === "sent" && "✔"}

              {msg?.status === "delivered" &&
                "✔✔"}

              {msg?.status === "seen" && (
                <span className="seen">
                  ✔✔
                </span>
              )}
            </span>

          )}
        </div>

        {/* ================= MESSAGE REACTION ================= */}

        {msg?.reaction && (

          <span className="message-reaction">
            {msg.reaction}
          </span>

        )}

      </div>
    </div>
  );

})}
      <div ref={endRef} />
      </div>

      {/* ================= INPUT ================= */}
      {/* ================= INPUT ================= */}
     {/* ================= INPUT ================= */}

     {/* Media Preview  */}
      {selectedMedia.length > 0 && (
  <div className="media-preview-bar">

    {selectedMedia.map((item, index) => (

      <div key={index} className="media-preview-item">

        {item.type === "image" ? (
          <img src={item.preview}  alt="preview" />
        ) : (
          <video src={item.preview}  />
        )}

        <span
          className="remove-media"
          onClick={() =>
            setSelectedMedia(prev =>
              prev.filter((_, i) => i !== index)
            )
          }
        >
          ✕
        </span>

      </div>

    ))}

    {/* Caption box */}
    <input
      className="media-caption-input"
      placeholder="Add a caption..."
      value={mediaCaption}
      onChange={(e) => setMediaCaption(e.target.value)}
    />

  </div>
)}
<div className="chat-input-wrapper">
  <div className="chat-input-box">
    <FiSmile
      className="emoji-btn"
      onClick={() => setShowEmojiPicker(prev => !prev)}
    />

    <input
      type="text"
      rows={1}
      placeholder="Type a message"
      value={newMessage}
      onChange={(e) => {
        setNewMessage(e.target.value);
        handleTyping();
        e.target.style.height = "auto";           
        e.target.style.height = e.target.scrollHeight + "px";
      }}
      onInput={(e) => {  
        e.target.style.height = "auto";
        e.target.style.height = e.target.scrollHeight + "px";
      }}
      onKeyDown={(e) => {
        if (
  e.key === "Enter" &&
  !e.shiftKey &&
  (newMessage.trim() || selectedMedia.length > 0)
) {
          e.preventDefault();
          handleSendMessage();
          e.target.style.height = "auto";
        }
      }}
    />

    {/* Media Upload Button */}
    <label htmlFor="media-upload" className="media-upload-btn">
      <FaCameraRetro />
    </label>
    <input
      type="file"
      id="media-upload"
      accept="image/*,video/*"
      multiple
      style={{ display: "none" }}
      onChange={(e) => {
        const files = Array.from(e.target.files);
        handleMediaSelect(e);
        // You can send these files to supabase or store in state for preview
        console.log("Selected Media:", files);
      }}
    />
  </div>

 {newMessage.trim() || selectedMedia.length > 0 ? (
  <button className="chat-send-btn" onClick={handleSendMessage}>
    <FiSend />
  </button>
) : (
   <button
  className={`chat-voice-btn ${
    recording ? "recording-active" : ""
  }`}
  onClick={() => {
    if (!recording)
      startRecording();
    else
      stopRecording();
  }}
>
  {recording ? <FiSend /> : <FaMicrophoneAlt />}
</button>
)}
</div>



      {/* ================= EMOJI PICKER ================= */}
      {showEmojiPicker && (
  <div className="emoji-picker-wrapper" ref={emojiRef}>
    <button
      className="emoji-close-btn"
      onClick={() => setShowEmojiPicker(false)}
    >
      ✕
    </button>

    <EmojiPicker
      onEmojiClick={(emoji) =>
        setNewMessage((prev) => prev + emoji.emoji)
      }
      theme="auto"
    />
  </div>
)}

{recording && (
  <div className="voice-recording-ui">

    <span className="recording-dot" />

    Recording voice message...

  </div>
)}


      {/* ================= REACTIONS ================= */}
       {reactionPicker.open && (
  <>
    {/* Overlay to close */}
    <div
      className="reaction-overlay"
      onClick={() => setReactionPicker({ open: false })}
    />

    <div className="reaction-picker pop">
      <button
        className="reaction-close"
        onClick={() => setReactionPicker({ open: false })}
      >
        ✕
      </button>

      {reactions.map((emoji, i) => (
        <span
          key={i}
          onClick={() => {
            handleReactionClick(emoji, reactionPicker.msgIndex);
            setReactionPicker({ open: false });
          }}
        >
          {emoji}
        </span>
      ))}

    </div>
  </>
)}

    </div>
  );
};

export default ChatWindow;
