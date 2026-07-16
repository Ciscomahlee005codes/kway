import React, { useState, useEffect, useRef } from "react";
import { BsFillCircleFill, BsMicFill, BsMicMuteFill } from "react-icons/bs";
import { HiUsers } from "react-icons/hi2";
import { FiX, FiSend, FiCameraOff, FiCamera } from "react-icons/fi";
import { MdCallEnd } from "react-icons/md";
import "./LiveBroadcast.css";

// =====================================================================
// 🔴 DUMMY DATA — replace with real-time data once sockets/API are ready.
// Expected real sources:
//   - viewers: live count from your streaming backend (websocket)
//   - chatMessages: pushed via websocket/Supabase Realtime as users type
//   - reactions: pushed via websocket as floating events
// =====================================================================

const DUMMY_USERNAMES = [
  "Chidi_O", "Ada.Live", "TeeVibes", "Kelechi99", "NaijaFan22",
  "Bola_Streams", "Zainab.tv", "MikeTheGoat", "Funmi_", "Emeka_B",
];

const DUMMY_MESSAGES = [
  "yoo this is fire 🔥",
  "first time catching you live!",
  "wait what app is this 👀",
  "LETS GOOO",
  "can you shout me out",
  "the audio is clean today",
  "following now ✅",
  "this deserves more viewers",
  "😂😂😂",
  "where are you streaming from?",
  "drop the link in the description",
  "W stream",
];

const DUMMY_AVATARS_COLORS = [
  "#e0263f", "#2563eb", "#16a34a", "#9333ea", "#f59e0b", "#0891b2",
];

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const LiveBroadcast = ({ streamTitle, streamCategory, onEndStream }) => {
  const [viewers, setViewers] = useState(1);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([
    { id: "sys1", system: true, text: "You started streaming." },
  ]);
  const [floatingReactions, setFloatingReactions] = useState([]);
  const chatEndRef = useRef(null);

  // 🔴 DUMMY: simulate viewers joining over time — replace with real socket count
  useEffect(() => {
    const viewerInterval = setInterval(() => {
      setViewers((prev) => {
        const change = Math.floor(Math.random() * 4) - 1; // mostly upward drift
        return Math.max(1, prev + change + 1);
      });
    }, 2500);
    return () => clearInterval(viewerInterval);
  }, []);

  // Stream duration timer
  useEffect(() => {
    const timer = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // 🔴 DUMMY: simulate incoming chat messages — replace with websocket listener
  useEffect(() => {
    const chatInterval = setInterval(() => {
      const newMsg = {
        id: Date.now(),
        username: getRandomItem(DUMMY_USERNAMES),
        color: getRandomItem(DUMMY_AVATARS_COLORS),
        text: getRandomItem(DUMMY_MESSAGES),
        system: false,
      };
      setMessages((prev) => [...prev.slice(-40), newMsg]); // cap history
    }, 3200);
    return () => clearInterval(chatInterval);
  }, []);

  // 🔴 DUMMY: simulate floating heart/like reactions — replace with real event stream
  useEffect(() => {
    const reactionInterval = setInterval(() => {
      const id = Date.now();
      setFloatingReactions((prev) => [
        ...prev,
        { id, emoji: getRandomItem(["❤️", "🔥", "👏", "😂", "💯"]), left: Math.random() * 80 + 5 },
      ]);
      setTimeout(() => {
        setFloatingReactions((prev) => prev.filter((r) => r.id !== id));
      }, 3000);
    }, 1800);
    return () => clearInterval(reactionInterval);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (totalSeconds) => {
    const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const s = String(totalSeconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const formatViewers = (num) =>
    num >= 1000 ? `${(num / 1000).toFixed(1)}K` : `${num}`;

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    // 🔴 TODO: replace with real "send chat message" API/socket emit
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), username: "You", color: "#e0263f", text: chatInput, isSelf: true, system: false },
    ]);
    setChatInput("");
  };

  const handleEndStream = () => {
    // 🔴 TODO: replace with real "end stream" API call
    onEndStream();
  };

  return (
    <div className="broadcast-page">
      {/* Video / Camera Area */}
      <div className="broadcast-video-area">
        {cameraOn ? (
          <div className="camera-placeholder">
            <div className="camera-pulse-ring" />
            <span>Your camera feed</span>
          </div>
        ) : (
          <div className="camera-off-placeholder">
            <FiCameraOff />
            <span>Camera is off</span>
          </div>
        )}

        {/* Floating reactions */}
        <div className="floating-reactions-layer">
          {floatingReactions.map((r) => (
            <span
              key={r.id}
              className="floating-reaction"
              style={{ left: `${r.left}%` }}
            >
              {r.emoji}
            </span>
          ))}
        </div>

        {/* Top overlay: live badge, viewers, duration, close */}
        <div className="broadcast-top-bar">
          <span className="live-badge-broadcast">
            <BsFillCircleFill /> LIVE
          </span>
          <span className="viewer-badge-broadcast">
            <HiUsers /> {formatViewers(viewers)}
          </span>
          <span className="duration-badge">{formatTime(elapsedSeconds)}</span>
          <button className="end-stream-x" onClick={handleEndStream}>
            <FiX />
          </button>
        </div>

        {/* Bottom overlay: title + category */}
        <div className="broadcast-info-bar">
          <h3>{streamTitle}</h3>
          <span className="category-pill">{streamCategory}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="broadcast-controls">
        <button
          className={`control-btn ${!micOn ? "off" : ""}`}
          onClick={() => setMicOn((m) => !m)}
        >
          {micOn ? <BsMicFill /> : <BsMicMuteFill />}
          <span>{micOn ? "Mute" : "Unmute"}</span>
        </button>
        <button
          className={`control-btn ${!cameraOn ? "off" : ""}`}
          onClick={() => setCameraOn((c) => !c)}
        >
          {cameraOn ? <FiCamera /> : <FiCameraOff />}
          <span>{cameraOn ? "Stop Video" : "Start Video"}</span>
        </button>
        <button className="control-btn end-btn" onClick={handleEndStream}>
          <MdCallEnd />
          <span>End Stream</span>
        </button>
      </div>

      {/* Live Chat Panel */}
      <div className="broadcast-chat-panel">
        <div className="chat-panel-header">
          <span>Live Chat</span>
          <span className="chat-viewer-count">
            <HiUsers /> {formatViewers(viewers)} watching
          </span>
        </div>

        <div className="chat-messages">
          {messages.map((msg) =>
            msg.system ? (
              <div key={msg.id} className="chat-system-msg">
                {msg.text}
              </div>
            ) : (
              <div
                key={msg.id}
                className={`chat-message ${msg.isSelf ? "self" : ""}`}
              >
                <span
                  className="chat-username"
                  style={{ color: msg.color }}
                >
                  {msg.username}
                </span>
                <span className="chat-text">{msg.text}</span>
              </div>
            )
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="chat-input-row">
          <input
            type="text"
            placeholder="Say something..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <button onClick={handleSendMessage}>
            <FiSend />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveBroadcast;