import React, { useState, useEffect, useRef } from "react";
import { BsFillCircleFill, BsMicFill, BsMicMuteFill } from "react-icons/bs";
import { HiUsers } from "react-icons/hi2";
import { FiX, FiSend, FiCameraOff, FiCamera } from "react-icons/fi";
import { MdCallEnd } from "react-icons/md";
import { supabase } from "../../supabase"; 
import { useLiveChat, useLiveRoom, endStream } from "../../hooks/useLive"; // adjust path
import { saveRecording } from "../../hooks/useRecordings"; // adjust path
import "./LiveBroadcast.css";
import "./EndModal.css";

const COLORS = ["#e0263f", "#2563eb", "#16a34a", "#9333ea", "#f59e0b", "#0891b2"];
const colorFor = (id = "") =>
  COLORS[[...id].reduce((a, c) => a + c.charCodeAt(0), 0) % COLORS.length];

const formatTime = (t) => {
  const h = String(Math.floor(t / 3600)).padStart(2, "0");
  const m = String(Math.floor((t % 3600) / 60)).padStart(2, "0");
  const s = String(t % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
};
const formatViewers = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`);

const pickMime = () =>
  ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm", "video/mp4"].find(
    (t) => window.MediaRecorder?.isTypeSupported?.(t)
  ) || "";

const LiveBroadcast = ({ streamId, streamTitle, streamCategory, onEndStream }) => {
  const { messages, send } = useLiveChat(streamId);
  const { viewers, reactions } = useLiveRoom(streamId, { isHost: true });

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [cameraError, setCameraError] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatError, setChatError] = useState("");
  const [myId, setMyId] = useState(null);

  // End-stream modal
  const [showEndModal, setShowEndModal] = useState(false);
  const [phase, setPhase] = useState("confirm"); // confirm | working | error
  const [wantsSave, setWantsSave] = useState(false);
  const [endError, setEndError] = useState("");
  const [canRecord, setCanRecord] = useState(true);

  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const blobRef = useRef(null);
  const chatEndRef = useRef(null);
  const peakRef = useRef(0);
  const streamEndedRef = useRef(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setMyId(data.user?.id ?? null));
  }, []);

  // ===== Real camera + mic, and a local recorder for "Save video" =====
  // TODO (video provider): publish these same tracks to your provider's SDK so
  // viewers can watch. Recording then moves to the provider (server-side).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        mediaStreamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;

        if (window.MediaRecorder) {
          const mime = pickMime();
          const rec = new MediaRecorder(stream, {
            ...(mime ? { mimeType: mime } : {}),
            videoBitsPerSecond: 1_000_000, // ~7.5 MB per minute
            audioBitsPerSecond: 96_000,
          });
          rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
          rec.start(1000);
          recorderRef.current = rec;
        } else {
          setCanRecord(false);
        }
      } catch {
        setCameraError("Camera or microphone permission was denied.");
        setCanRecord(false);
      }
    })();
    return () => {
      cancelled = true;
      mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  useEffect(() => {
    if (cameraOn && videoRef.current && mediaStreamRef.current) {
      videoRef.current.srcObject = mediaStreamRef.current;
    }
  }, [cameraOn]);

  const toggleMic = () => {
    const next = !micOn;
    mediaStreamRef.current?.getAudioTracks().forEach((t) => (t.enabled = next));
    setMicOn(next);
  };
  const toggleCamera = () => {
    const next = !cameraOn;
    mediaStreamRef.current?.getVideoTracks().forEach((t) => (t.enabled = next));
    setCameraOn(next);
  };

  useEffect(() => {
    const timer = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    peakRef.current = Math.max(peakRef.current, viewers);
  }, [viewers]);

  // Push live viewer count to the DB every 10s for the feed
  useEffect(() => {
    const push = () =>
      supabase
        .from("live_streams")
        .update({ viewer_count: viewers, peak_viewers: peakRef.current })
        .eq("id", streamId);
    const interval = setInterval(push, 10000);
    return () => clearInterval(interval);
  }, [viewers, streamId]);

  // If the host leaves without going through the modal, still end the stream
  useEffect(() => {
    return () => {
      if (!streamEndedRef.current) {
        streamEndedRef.current = true;
        endStream(streamId);
      }
    };
  }, [streamId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    const text = chatInput;
    if (!text.trim()) return;
    setChatInput("");
    setChatError("");
    try {
      await send(text);
    } catch (error) {
      setChatInput(text);
      setChatError(error.message || "Couldn't send your message. Please try again.");
    }
  };

  // ===== End stream flow =====
  const openEndModal = () => {
    setPhase("confirm");
    setEndError("");
    setShowEndModal(true);
  };

  const stopRecording = () =>
    new Promise((resolve) => {
      const rec = recorderRef.current;
      const make = () =>
        resolve(
          new Blob(chunksRef.current, {
            type: (rec?.mimeType || "video/webm").split(";")[0],
          })
        );
      if (!rec || rec.state === "inactive") return make();
      rec.onstop = make;
      rec.stop();
    });

  const finishStream = async (save) => {
    setWantsSave(save);
    setPhase("working");
    setEndError("");
    try {
      if (!streamEndedRef.current) {
        streamEndedRef.current = true;
        await endStream(streamId); // viewers see it end right away
      }
      if (blobRef.current === null) blobRef.current = await stopRecording();
      mediaStreamRef.current?.getTracks().forEach((t) => t.stop());

      let saved = false;
      if (save && blobRef.current.size > 0) {
        await saveRecording({
          streamId,
          blob: blobRef.current,
          title: streamTitle,
          category: streamCategory,
          duration: elapsedSeconds,
          peakViewers: peakRef.current,
        });
        saved = true;
      }
      onEndStream(saved);
    } catch (err) {
      const tooBig = /size|exceed/i.test(err?.message || "");
      setEndError(
        tooBig
          ? "This video is larger than your storage upload limit."
          : "We couldn't save the video. Check your connection and try again."
      );
      setPhase("error");
    }
  };

  return (
    <div className="broadcast-page">
      <div className="broadcast-video-area">
        <video
          ref={videoRef}
          className="camera-video"
          autoPlay
          playsInline
          muted
          style={{ display: cameraOn && !cameraError ? "block" : "none" }}
        />
        {cameraError ? (
          <div className="camera-off-placeholder">
            <FiCameraOff />
            <span>{cameraError}</span>
          </div>
        ) : (
          !cameraOn && (
            <div className="camera-off-placeholder">
              <FiCameraOff />
              <span>Camera is off</span>
            </div>
          )
        )}

        <div className="floating-reactions-layer">
          {reactions.map((r) => (
            <span key={r.id} className="floating-reaction" style={{ left: `${r.left}%` }}>
              {r.emoji}
            </span>
          ))}
        </div>

        <div className="broadcast-top-bar">
          <span className="live-badge-broadcast"><BsFillCircleFill /> LIVE</span>
          <span className="viewer-badge-broadcast"><HiUsers /> {formatViewers(viewers)}</span>
          <span className="duration-badge">{formatTime(elapsedSeconds)}</span>
          <button className="end-stream-x" onClick={openEndModal}><FiX /></button>
        </div>

        <div className="broadcast-info-bar">
          <h3>{streamTitle}</h3>
          <span className="category-pill">{streamCategory}</span>
        </div>
      </div>

      <div className="broadcast-controls">
        <button className={`control-btn ${!micOn ? "off" : ""}`} onClick={toggleMic}>
          {micOn ? <BsMicFill /> : <BsMicMuteFill />}
          <span>{micOn ? "Mute" : "Unmute"}</span>
        </button>
        <button className={`control-btn ${!cameraOn ? "off" : ""}`} onClick={toggleCamera}>
          {cameraOn ? <FiCamera /> : <FiCameraOff />}
          <span>{cameraOn ? "Stop Video" : "Start Video"}</span>
        </button>
        <button className="control-btn end-btn" onClick={openEndModal}>
          <MdCallEnd />
          <span>End Stream</span>
        </button>
      </div>

      <div className="broadcast-chat-panel">
        <div className="chat-panel-header">
          <span>Live Chat</span>
          <span className="chat-viewer-count"><HiUsers /> {formatViewers(viewers)} watching</span>
        </div>

        <div className="chat-messages">
          <div className="chat-system-msg">You started streaming.</div>
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-message ${msg.user_id === myId ? "self" : ""}`}>
              <span className="chat-username" style={{ color: colorFor(msg.user_id) }}>
                {msg.user_id === myId ? "You" : msg.profiles?.username || "user"}
              </span>
              <span className="chat-text">{msg.body}</span>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {chatError && <p className="chat-send-error" role="alert">{chatError}</p>}
        <div className="chat-input-row">
          <input
            type="text"
            maxLength={300}
            placeholder="Say something..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <button onClick={handleSendMessage}><FiSend /></button>
        </div>
      </div>

      {/* ===== End stream confirmation ===== */}
      {showEndModal && (
        <div className="end-modal-backdrop">
          <div
            className="end-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="end-modal-title"
            aria-busy={phase === "working"}
          >
            {phase === "confirm" && (
              <>
                <div className="end-modal-icon"><MdCallEnd /></div>
                <div className="end-modal-copy">
                  <h3 id="end-modal-title">End your live stream?</h3>
                  <p>
                    Your stream has been live for {formatTime(elapsedSeconds)}
                    {peakRef.current > 0 && ` and reached ${peakRef.current} viewers`}.
                  </p>
                </div>
                <div className="end-modal-summary">
                  <span className="end-modal-live-dot" />
                  <span>{streamTitle}</span>
                  <span className="end-modal-summary-time">{formatTime(elapsedSeconds)}</span>
                </div>
                <div className="end-modal-actions">
                  <button
                    className="end-modal-btn primary"
                    onClick={() => finishStream(true)}
                    disabled={!canRecord}
                  >
                    Save video &amp; end
                  </button>
                  {!canRecord && (
                    <small className="end-modal-note">
                      Recording isn't available on this device or camera access was denied.
                    </small>
                  )}
                  <button className="end-modal-btn danger" onClick={() => finishStream(false)}>
                    End without saving
                  </button>
                  <button className="end-modal-btn ghost" onClick={() => setShowEndModal(false)}>
                    Keep streaming
                  </button>
                </div>
              </>
            )}

            {phase === "working" && (
              <div className="end-modal-working">
                <div className="end-spinner" />
                <div className="end-modal-copy">
                  <h3 id="end-modal-title">{wantsSave ? "Saving your stream" : "Ending your stream"}</h3>
                  <p>{wantsSave ? "Please keep this page open while your video is saved." : "Wrapping things up..."}</p>
                </div>
              </div>
            )}

            {phase === "error" && (
              <>
                <div className="end-modal-icon error"><MdCallEnd /></div>
                <div className="end-modal-copy">
                  <h3 id="end-modal-title">Couldn't save your video</h3>
                  <p role="alert">{endError}</p>
                </div>
                <div className="end-modal-actions">
                  <button className="end-modal-btn primary" onClick={() => finishStream(true)}>
                    Try again
                  </button>
                  <button className="end-modal-btn danger" onClick={() => finishStream(false)}>
                    Discard video &amp; close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveBroadcast;