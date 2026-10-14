import React, { useEffect, useRef, useState } from "react";
import { BsFillCircleFill } from "react-icons/bs";
import { FiSend, FiVideo, FiX } from "react-icons/fi";
import { HiUsers } from "react-icons/hi2";
import { useLiveChat, useLiveRoom } from "../../hooks/useLive";
import { supabase } from "../../supabase";
import "./LiveViewer.css";

const REACTIONS = ["❤️", "👏", "🔥", "😂"];
const COLORS = ["#e0263f", "#2563eb", "#16a34a", "#9333ea", "#f59e0b", "#0891b2"];

const colorFor = (id = "") =>
  COLORS[[...id].reduce((total, character) => total + character.charCodeAt(0), 0) % COLORS.length];

const formatViewers = (count) => (count >= 1000 ? `${(count / 1000).toFixed(1)}K` : count);
const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return [hours, minutes, secs].map((part) => String(part).padStart(2, "0")).join(":");
};

const LiveViewer = ({ stream, onClose }) => {
  const { messages, error: chatLoadError, send } = useLiveChat(stream.id);
  const { viewers, reactions, sendReaction } = useLiveRoom(stream.id);
  const [chatInput, setChatInput] = useState("");
  const [chatError, setChatError] = useState("");
  const [myId, setMyId] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(() =>
    Math.max(0, Math.floor((Date.now() - new Date(stream.started_at).getTime()) / 1000))
  );
  const chatEndRef = useRef(null);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (active) setMyId(data.user?.id ?? null);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - new Date(stream.started_at).getTime()) / 1000)));
    }, 1000);
    return () => clearInterval(timer);
  }, [stream.started_at]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSendMessage = async (event) => {
    event.preventDefault();
    if (!chatInput.trim()) return;
    const text = chatInput;
    setChatInput("");
    setChatError("");
    try {
      await send(text);
    } catch (error) {
      setChatInput(text);
      setChatError(error.message || "Couldn't send your message. Please try again.");
    }
  };

  return (
    <div className="live-viewer-backdrop" onClick={onClose}>
      <section
        className="live-viewer"
        role="dialog"
        aria-modal="true"
        aria-label={`Live stream: ${stream.title}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="live-viewer-main">
          <div className="live-viewer-video">
            <div className="live-viewer-video-state">
              <span className="live-viewer-video-icon"><FiVideo /></span>
              <h2>You're watching live</h2>
              <p>Chat and react with the community while {stream.host?.username || "the host"} is live.</p>
              <small>Live video playback isn't connected yet.</small>
            </div>
            <div className="live-viewer-reactions" aria-live="polite">
              {reactions.map((reaction) => (
                <span
                  key={reaction.id}
                  className="live-viewer-floating-reaction"
                  style={{ left: `${reaction.left}%` }}
                >
                  {reaction.emoji}
                </span>
              ))}
            </div>
            <div className="live-viewer-topbar">
              <span className="live-viewer-live-badge"><BsFillCircleFill /> LIVE</span>
              <span className="live-viewer-stat"><HiUsers /> {formatViewers(viewers)} watching</span>
              <span className="live-viewer-stat">{formatTime(elapsedSeconds)}</span>
              <button className="live-viewer-close" onClick={onClose} aria-label="Close live stream">
                <FiX />
              </button>
            </div>
            <div className="live-viewer-stream-info">
              <h1>{stream.title}</h1>
              <p>{stream.host?.username || "Live host"} <span>·</span> {stream.category}</p>
            </div>
          </div>
          <div className="live-viewer-reaction-actions" aria-label="Send a live reaction">
            {REACTIONS.map((reaction) => (
              <button
                key={reaction}
                type="button"
                onClick={() => sendReaction(reaction)}
                aria-label={`React ${reaction}`}
              >
                {reaction}
              </button>
            ))}
          </div>
        </div>

        <aside className="live-viewer-chat">
          <header className="live-viewer-chat-header">
            <h2>Live chat</h2>
            <span><HiUsers /> {formatViewers(viewers)}</span>
          </header>
          <div className="live-viewer-messages" aria-live="polite">
            <p className="live-viewer-system-message">You're watching {stream.host?.username || "a creator"} live.</p>
            {chatLoadError && <p className="live-viewer-chat-error" role="alert">{chatLoadError}</p>}
            {messages.map((message) => (
              <p className="live-viewer-message" key={message.id}>
                <strong style={{ color: colorFor(message.user_id) }}>
                  {message.user_id === myId ? "You" : message.profiles?.username || "User"}
                </strong>
                <span>{message.body}</span>
              </p>
            ))}
            <div ref={chatEndRef} />
          </div>
          {chatError && <p className="live-viewer-chat-error" role="alert">{chatError}</p>}
          <form className="live-viewer-chat-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              maxLength={300}
              placeholder="Say something..."
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
              aria-label="Live chat message"
            />
            <button type="submit" aria-label="Send message" disabled={!chatInput.trim()}>
              <FiSend />
            </button>
          </form>
        </aside>
      </section>
    </div>
  );
};

export default LiveViewer;
