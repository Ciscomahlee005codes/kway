import { useEffect, useRef, useState } from "react";
import { FiVolume2, FiVolumeX, FiX } from "react-icons/fi";

const LiveGuestTile = ({ guest, onRemove }) => {
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !guest.stream) return;
    video.srcObject = guest.stream;
    video.play().catch(() => setMuted(true));
    return () => {
      video.srcObject = null;
    };
  }, [guest.stream]);

  return (
    <article className="broadcast-guest-tile">
      {guest.stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={muted}
          aria-label={`${guest.username}'s live camera`}
        />
      ) : (
        <div className="broadcast-guest-waiting">
          <span>{guest.username?.charAt(0).toUpperCase() || "G"}</span>
          <small>{guest.status === "error" ? "Connection issue" : "Connecting..."}</small>
        </div>
      )}
      <div className="broadcast-guest-name">
        <span className="broadcast-guest-live-dot" />
        <span>{guest.username}</span>
        <button
          type="button"
          onClick={() => setMuted((value) => !value)}
          aria-label={muted ? `Unmute ${guest.username}` : `Mute ${guest.username}`}
          title={muted ? "Unmute guest" : "Mute guest"}
        >
          {muted ? <FiVolumeX /> : <FiVolume2 />}
        </button>
        <button
          type="button"
          className="broadcast-guest-remove"
          onClick={() => onRemove(guest.userId)}
          aria-label={`Remove ${guest.username} from the live`}
          title="Remove guest"
        >
          <FiX />
        </button>
      </div>
    </article>
  );
};

export default LiveGuestTile;
