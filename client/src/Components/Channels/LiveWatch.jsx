import React, { useState, useEffect, useRef } from "react";
import { BsFillCircleFill } from "react-icons/bs";
import { HiUsers } from "react-icons/hi2";
import { FiX, FiSend } from "react-icons/fi";
import { supabase } from "../../supabase";
import { useLiveChat, useLiveRoom } from "../../hooks/useLive";
import { usePeerViewer } from "../../hooks/useP2PVideo";
import "./LiveWatch.css";

const COLORS = ["#ff5d73", "#4f8cff", "#2ecc71", "#b073ff", "#ffb020", "#22c7e8"];
const colorFor = (id = "") =>
  COLORS[[...id].reduce((a, c) => a + c.charCodeAt(0), 0) % COLORS.length];
const formatViewers = (n = 0) => (n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`);
const REACTIONS = ["❤️", "🔥", "👏", "😂", "💯"];

const LiveWatch = ({ stream, onClose }) => {
  const { messages, send } = useLiveChat(stream.id);
  const { viewers, reactions, sendReaction } = useLiveRoom(stream.id, { isHost: false });
  const { remoteStream, status, slow, detail } = usePeerViewer(stream.id);

  const [chatInput, setChatInput] = useState("");
  const [myId, setMyId] = useState(null);
  const [following, setFollowing] = useState(false);
  const [ended, setEnded] = useState(false);
  const [needsTap, setNeedsTap] = useState(false);

  const videoRef = useRef(null);
  const chatEndRef = useRef(null);

  // Who am I + do I follow this streamer?
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setMyId(user.id);
      const { data } = await supabase
        .from("follows")
        .select("followee_id")
        .eq("follower_id", user.id)
        .eq("followee_id", stream.host_id)
        .maybeSingle();
      setFollowing(!!data);
    })();
  }, [stream.host_id]);

  const toggleFollow = async () => {
    if (!myId) return;
    if (following) {
      setFollowing(false);
      await supabase.from("follows").delete()
        .eq("follower_id", myId).eq("followee_id", stream.host_id);
    } else {
      setFollowing(true);
      await supabase.from("follows").insert({ follower_id: myId, followee_id: stream.host_id });
    }
  };

  // Know immediately when the host ends the stream
  useEffect(() => {
    const channel = supabase
      .channel(`watch-status:${stream.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "live_streams", filter: `id=eq.${stream.id}` },
        (payload) => { if (payload.new.status === "ended") setEnded(true); }
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [stream.id]);

  // Attach the host's video; if autoplay-with-sound is blocked, ask for a tap
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !remoteStream) return;
    v.srcObject = remoteStream;
    v.play().catch(() => setNeedsTap(true));
  }, [remoteStream]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Esc closes the viewer
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleSend = async () => {
    const text = chatInput;
    if (!text.trim() || ended) return;
    setChatInput("");
    await send(text);
  };

  return (
    <div className="lw-page" role="dialog" aria-label={`Watching ${stream.title}`}>
      <div className="lw-main">
        <div className="lw-stage">
          <video
            ref={videoRef}
            className="lw-video"
            autoPlay
            playsInline
            style={{ opacity: remoteStream ? 1 : 0 }}
          />

          {!remoteStream && !ended && (
            <div className="lw-state">
              <div className="lw-pulse" />
              <p>
                {slow
                  ? "Taking longer than usual. The host may be on a weak connection."
                  : "Connecting to the stream..."}
              </p>
              {detail && <small>{detail}</small>}
            </div>
          )}

          {needsTap && remoteStream && !ended && (
            <button
              className="lw-tap"
              onClick={() => { videoRef.current?.play(); setNeedsTap(false); }}
            >
              Tap to watch
            </button>
          )}

          {ended && (
            <div className="lw-ended">
              <h3>This stream has ended</h3>
              <p>Thanks for watching {stream.host?.username || "the stream"}.</p>
              <button className="lw-btn" onClick={onClose}>Back to Live</button>
            </div>
          )}

          <div className="lw-reactions" aria-hidden="true">
            {reactions.map((r) => (
              <span key={r.id} className="lw-reaction" style={{ left: `${r.left}%` }}>
                {r.emoji}
              </span>
            ))}
          </div>

          <div className="lw-topbar">
            <span className="lw-live"><BsFillCircleFill /> LIVE</span>
            <span className="lw-pill"><HiUsers /> {formatViewers(viewers)}</span>
            {status === "connecting" && !ended && <span className="lw-pill">connecting</span>}
            <button className="lw-close" onClick={onClose} aria-label="Close">
              <FiX />
            </button>
          </div>

          <div className="lw-info">
            {stream.host?.avatar_url ? (
              <img src={stream.host.avatar_url} alt="" className="lw-avatar" />
            ) : (
              <div className="lw-avatar lw-avatar-empty" />
            )}
            <div className="lw-info-text">
              <h3>{stream.title}</h3>
              <span>
                {stream.host?.username} · {stream.category}
              </span>
            </div>
            {myId && myId !== stream.host_id && (
              <button
                className={`lw-follow ${following ? "is-following" : ""}`}
                onClick={toggleFollow}
              >
                {following ? "Following" : "Follow"}
              </button>
            )}
          </div>
        </div>

        <div className="lw-reactbar">
          {REACTIONS.map((emoji) => (
            <button
              key={emoji}
              className="lw-react-btn"
              disabled={ended}
              onClick={() => sendReaction(emoji)}
              aria-label={`Send ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      <aside className="lw-chat">
        <div className="lw-chat-head">
          <span>Live Chat</span>
          <span className="lw-chat-count"><HiUsers /> {formatViewers(viewers)} watching</span>
        </div>

        <div className="lw-chat-list">
          <div className="lw-chat-system">Welcome to the stream. Be kind in chat.</div>
          {messages.map((msg) => (
            <div key={msg.id} className={`lw-msg ${msg.user_id === myId ? "self" : ""}`}>
              <span className="lw-user" style={{ color: colorFor(msg.user_id) }}>
                {msg.user_id === myId ? "You" : msg.profiles?.username || "user"}
              </span>
              <span className="lw-text">{msg.body}</span>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="lw-chat-input">
          <input
            type="text"
            maxLength={300}
            placeholder={ended ? "Stream ended" : "Say something..."}
            disabled={ended}
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button onClick={handleSend} disabled={ended || !chatInput.trim()} aria-label="Send">
            <FiSend />
          </button>
        </div>
      </aside>
    </div>
  );
};

export default LiveWatch;