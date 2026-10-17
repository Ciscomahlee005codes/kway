import React, { useState, useEffect, useRef, useCallback } from "react";
import { BsFillCircleFill } from "react-icons/bs";
import { HiUsers } from "react-icons/hi2";
import { FiX, FiSend, FiGift, FiUserPlus, FiMic, FiMicOff, FiVideoOff } from "react-icons/fi";
import { supabase } from "../../supabase";
import { useLiveChat, useLiveRoom, useLiveGuests } from "../../hooks/useLive";
import { usePeerViewer } from "../../hooks/useP2PVideo";
import "./LiveWatch.css";

const COLORS = ["#ff5d73", "#4f8cff", "#2ecc71", "#b073ff", "#ffb020", "#22c7e8"];
const GIFTS = [
  { name: "Rose", emoji: "🌹" },
  { name: "Heart", emoji: "💖" },
  { name: "Star", emoji: "🌟" },
  { name: "Crown", emoji: "👑" },
  { name: "Rocket", emoji: "🚀" },
];
const colorFor = (id = "") =>
  COLORS[[...id].reduce((a, c) => a + c.charCodeAt(0), 0) % COLORS.length];
const formatViewers = (n = 0) => (n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`);
const REACTIONS = ["❤️", "🔥", "👏", "😂", "💯"];

const LiveWatch = ({ stream, onClose }) => {
  const { messages, send } = useLiveChat(stream.id);
  const {
    viewers,
    reactions,
    sendReaction,
    gifts,
    sendGift,
    joinStatus,
    requestToJoin,
  } = useLiveRoom(stream.id, { isHost: false, hostId: stream.host_id });
  const { remoteStream, status, slow, detail } = usePeerViewer(stream.id);
  const {
    guestStatus,
    guestError,
    localGuestStream,
    startGuest,
    stopGuest,
    setGuestTrackEnabled,
    resetGuest,
  } = useLiveGuests(stream.id, { hostId: stream.host_id });

  const [chatInput, setChatInput] = useState("");
  const [giftError, setGiftError] = useState("");
  const [joinError, setJoinError] = useState("");
  const [myId, setMyId] = useState(null);
  const [following, setFollowing] = useState(false);
  const [ended, setEnded] = useState(false);
  const [needsTap, setNeedsTap] = useState(false);
  const [guestMicOn, setGuestMicOn] = useState(true);
  const [guestCameraOn, setGuestCameraOn] = useState(true);

  const videoRef = useRef(null);
  const guestVideoRef = useRef(null);
  const chatEndRef = useRef(null);
  const previousJoinStatus = useRef(joinStatus);

  const handleClose = useCallback(async () => {
    if (["requesting-media", "connecting", "connected"].includes(guestStatus)) await stopGuest();
    onClose();
  }, [guestStatus, stopGuest, onClose]);

  const handleStartGuest = () => {
    setGuestMicOn(true);
    setGuestCameraOn(true);
    startGuest().catch(() => {});
  };

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
    const video = guestVideoRef.current;
    if (!video || !localGuestStream) return;
    video.srcObject = localGuestStream;
    video.play().catch(() => {});
    return () => {
      video.srcObject = null;
    };
  }, [localGuestStream, guestStatus]);

  useEffect(() => {
    if (ended && ["requesting-media", "connecting", "connected"].includes(guestStatus)) {
      stopGuest();
    }
  }, [ended, guestStatus, stopGuest]);

  useEffect(() => {
    if (joinStatus === "accepted" && previousJoinStatus.current === "pending") {
      resetGuest();
    }
    previousJoinStatus.current = joinStatus;
  }, [joinStatus, resetGuest]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Esc closes the viewer
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && void handleClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleClose]);

  const handleSend = async () => {
    const text = chatInput;
    if (!text.trim() || ended) return;
    setChatInput("");
    await send(text);
  };

  const handleGift = async (gift) => {
    setGiftError("");
    try {
      await sendGift(gift);
    } catch (error) {
      setGiftError(error.message || "Couldn't send that gift.");
    }
  };

  const handleJoinRequest = async () => {
    setJoinError("");
    try {
      await requestToJoin();
    } catch (error) {
      setJoinError(error.message || "Couldn't send your request.");
    }
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
              <button className="lw-btn" onClick={handleClose}>Back to Live</button>
            </div>
          )}

          {joinStatus === "accepted" && !["connected", "ended"].includes(guestStatus) && (
            <div className="lw-guest-invite" role="status">
              <strong>The host invited you on stage</strong>
              <span>Allow camera and microphone to join the conversation.</span>
              <button
                type="button"
                onClick={handleStartGuest}
                disabled={guestStatus === "requesting-media" || guestStatus === "connecting"}
              >
                {guestStatus === "requesting-media" ? "Waiting for permission..." :
                  guestStatus === "connecting" ? "Connecting..." : "Join with camera"}
              </button>
              {guestError && <small role="alert">{guestError}</small>}
            </div>
          )}
          {guestStatus === "connected" && (
            <div className="lw-guest-self-preview">
              <video
                ref={guestVideoRef}
                autoPlay
                playsInline
                muted
                aria-label="Your camera preview"
                style={{ opacity: guestCameraOn ? 1 : 0 }}
              />
              {!guestCameraOn && <div className="lw-guest-camera-off">Camera off</div>}
              <span><i /> You're on stage</span>
              <div className="lw-guest-controls">
                <button
                  type="button"
                  onClick={() => {
                    const next = !guestMicOn;
                    setGuestTrackEnabled("audio", next);
                    setGuestMicOn(next);
                  }}
                  aria-label={guestMicOn ? "Mute your microphone" : "Unmute your microphone"}
                >
                  {guestMicOn ? <FiMic /> : <FiMicOff />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const next = !guestCameraOn;
                    setGuestTrackEnabled("video", next);
                    setGuestCameraOn(next);
                  }}
                  aria-label={guestCameraOn ? "Turn off your camera" : "Turn on your camera"}
                >
                  <FiVideoOff />
                </button>
                <button type="button" onClick={stopGuest}>Leave</button>
              </div>
            </div>
          )}

          <div className="lw-reactions" aria-hidden="true">
            {reactions.map((r) => (
              <span key={r.id} className="lw-reaction" style={{ left: `${r.left}%` }}>
                {r.emoji}
              </span>
            ))}
          </div>

          <div className="lw-gifts-overlay" aria-live="polite">
            {gifts.map((gift) => (
              <div className="lw-gift-burst" key={gift.id}>
                <span className="lw-gift-emoji">{gift.emoji}</span>
                <span><strong>{gift.username}</strong> sent {gift.name}</span>
              </div>
            ))}
          </div>

          <div className="lw-topbar">
            <span className="lw-live"><BsFillCircleFill /> LIVE</span>
            <span className="lw-pill"><HiUsers /> {formatViewers(viewers)}</span>
            {status === "connecting" && !ended && <span className="lw-pill">connecting</span>}
            <button className="lw-close" onClick={handleClose} aria-label="Close">
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
          <div className="lw-reaction-actions">
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
          <div className="lw-gift-actions" aria-label="Send a free gift">
            <span className="lw-gift-label"><FiGift /> Send a gift</span>
            <div className="lw-gift-options">
              {GIFTS.map((gift) => (
                <button
                  type="button"
                  key={gift.name}
                  className="lw-gift-btn"
                  disabled={ended}
                  onClick={() => handleGift(gift)}
                  aria-label={`Send ${gift.name} gift`}
                  title={`Send ${gift.name} (free)`}
                >
                  {gift.emoji}
                </button>
              ))}
            </div>
            {giftError && <span className="lw-action-error" role="alert">{giftError}</span>}
          </div>
          {myId && myId !== stream.host_id && (
            <div className="lw-join-action">
              <button
                type="button"
                className={`lw-join-btn ${joinStatus}`}
                onClick={joinStatus === "accepted" && guestStatus !== "ended" ? handleStartGuest : handleJoinRequest}
                disabled={ended || ["pending", "connected", "connecting", "requesting-media"].includes(joinStatus) ||
                  ["connected", "connecting", "requesting-media"].includes(guestStatus)}
              >
                <FiUserPlus />
                {joinStatus === "pending" ? "Request sent" :
                  joinStatus === "accepted" ? guestStatus === "ended" ? "Request to join again" :
                    guestStatus === "connected" ? "You're on stage" : "Join with camera" :
                    joinStatus === "declined" ? "Request again" : "Request to join"}
              </button>
              {joinError && <span className="lw-action-error" role="alert">{joinError}</span>}
              {guestError && <span className="lw-action-error" role="alert">{guestError}</span>}
              {joinStatus === "declined" && <span className="lw-join-feedback">The host declined this request.</span>}
              {joinStatus === "accepted" && guestStatus === "ended" && (
                <span className="lw-join-feedback">Your guest session ended. You can request to join again.</span>
              )}
            </div>
          )}
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
            style={{
              backgroundColor: "#fff",
              color: "#111",
              WebkitTextFillColor: "#111",
              caretColor: "#111",
            }}
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