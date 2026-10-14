import React, { useEffect, useRef, useState } from "react";
import { FiX } from "react-icons/fi";
import { MdPlayArrow, MdDelete } from "react-icons/md";
import { useSavedVideos } from "../../hooks/useRecordings"; 
import "./SavedVideos.css";

const fmtDuration = (s = 0) => {
  const m = Math.floor(s / 60);
  const sec = String(s % 60).padStart(2, "0");
  return m >= 60
    ? `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}:${sec}`
    : `${m}:${sec}`;
};

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

const SavedVideos = () => {
  const { videos, loading, remove } = useSavedVideos();
  const [playing, setPlaying] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const cancelDeleteRef = useRef(null);

  useEffect(() => {
    if (!pendingDelete) return undefined;

    cancelDeleteRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !deleting) setPendingDelete(null);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [pendingDelete, deleting]);

  const handleDelete = async (e, rec) => {
    e.stopPropagation();
    setDeleteError("");
    setPendingDelete(rec);
  };

  const confirmDelete = async () => {
    if (!pendingDelete || deleting) return;
    setDeleting(true);
    try {
      await remove(pendingDelete);
      setPendingDelete(null);
    } catch (error) {
      setDeleteError(
        error instanceof Error && error.message
          ? `Could not delete the video: ${error.message}`
          : "Could not delete the video. Please try again."
      );
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <p className="empty-state">Loading your videos...</p>;

  return (
    <>
      <div className="section-label">Saved videos</div>

      <div className="live-grid">
        {videos.map((rec) => (
          <div className="live-card" key={rec.id} onClick={() => setPlaying(rec)}>
            <div className="live-thumbnail">
              {/* #t=0.5 makes the browser show a frame as the thumbnail */}
              <video src={`${rec.url}#t=0.5`} preload="metadata" muted playsInline />
              <span className="viewer-badge">{fmtDuration(rec.duration_seconds)}</span>
              <button
                className="saved-delete-btn"
                onClick={(e) => handleDelete(e, rec)}
                aria-label={`Delete ${rec.title}`}
              >
                <MdDelete />
              </button>
              <div className="hover-overlay">
                <MdPlayArrow className="hover-play-icon" />
              </div>
            </div>
            <div className="live-card-info">
              <div className="live-card-text">
                <h4>{rec.title}</h4>
                <p>
                  {fmtDate(rec.created_at)} <span className="dot">•</span> {rec.category}
                  <span className="dot"> •</span> {rec.peak_viewers} peak
                </p>
              </div>
            </div>
          </div>
        ))}

        {videos.length === 0 && (
          <p className="empty-state">
            No saved videos yet. When you end a stream, choose "Save video".
          </p>
        )}
      </div>

      {playing && (
        <div className="player-backdrop" onClick={() => setPlaying(null)}>
          <div className="player-box" onClick={(e) => e.stopPropagation()}>
            <div className="player-head">
              <h3>{playing.title}</h3>
              <FiX className="close-icon" onClick={() => setPlaying(null)} />
            </div>
            <video src={playing.url} controls autoPlay playsInline />
          </div>
        </div>
      )}

      {pendingDelete && (
        <div
          className="saved-delete-backdrop"
          onClick={() => !deleting && setPendingDelete(null)}
        >
          <div
            className="saved-delete-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="saved-delete-title"
            aria-describedby="saved-delete-description"
            aria-busy={deleting}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="saved-delete-icon"><MdDelete /></div>
            <div className="saved-delete-copy">
              <h3 id="saved-delete-title">Delete this saved video?</h3>
              <p id="saved-delete-description">
                <strong>{pendingDelete.title}</strong> will be permanently removed. This can't be undone.
              </p>
            </div>
            {deleteError && <p className="saved-delete-error" role="alert">{deleteError}</p>}
            <div className="saved-delete-actions">
              <button
                type="button"
                className="saved-delete-cancel"
                onClick={() => setPendingDelete(null)}
                disabled={deleting}
                ref={cancelDeleteRef}
              >
                Cancel
              </button>
              <button
                type="button"
                className="saved-delete-confirm"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete video"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SavedVideos;