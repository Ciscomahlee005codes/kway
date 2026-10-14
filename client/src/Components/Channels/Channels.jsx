import React, { useState, useRef, useEffect, useMemo } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import { BsThreeDotsVertical, BsFillCircleFill } from "react-icons/bs";
import { MdAdd, MdPlayArrow, MdRefresh, MdSort, MdFlag } from "react-icons/md";
import { HiUsers } from "react-icons/hi2";
import { supabase } from "../../supabase"; 
import { useLiveStreams, startStream } from "../../hooks/useLive";
import LiveBroadcast from "./LiveBroadcast";
import SavedVideos from "./SavedVideos";
import "./Channels.css";

const CATEGORIES = ["All", "Following", "Sports", "Tech", "Fitness"];

const formatViewers = (num = 0) =>
  num >= 1000 ? `${(num / 1000).toFixed(1)}K` : `${num}`;

// Thumbnail with fallback to host avatar, then a plain gradient
const Thumb = ({ stream }) => {
  const src = stream.thumbnail_url || stream.host?.avatar_url;
  return src ? (
    <img src={src} alt={stream.title} />
  ) : (
    <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#2a2a35,#0b0b0f)" }} />
  );
};

const Avatar = ({ host, className }) =>
  host?.avatar_url ? (
    <img src={host.avatar_url} alt={host.username} className={className} />
  ) : (
    <div className={className} style={{ background: "#444" }} />
  );

const Live = () => {
  const { streams, refetch } = useLiveStreams();
  const [activeFilter, setActiveFilter] = useState("All");
  const [sortByViewers, setSortByViewers] = useState(false);
  const [followingIds, setFollowingIds] = useState([]);
  const [view, setView] = useState("live"); // "live" | "saved"

  // Broadcasting state
  const [broadcast, setBroadcast] = useState(null); // { id, title, category } | null
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState("");

  // Who the current user follows (for the "Following" filter)
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("follows").select("followee_id").eq("follower_id", user.id);
      setFollowingIds((data ?? []).map((f) => f.followee_id));
    })();
  }, []);

  // ===== Search =====
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef(null);

  const toggleSearch = () => {
    setSearchOpen((prev) => !prev);
    if (searchOpen) setSearchQuery("");
  };

  useEffect(() => {
    if (searchOpen && searchInputRef.current) searchInputRef.current.focus();
  }, [searchOpen]);

  // ===== Go Live panel =====
  const [goLiveOpen, setGoLiveOpen] = useState(false);
  const [streamTitle, setStreamTitle] = useState("");
  const [streamCategory, setStreamCategory] = useState("Tech");

  const handleGoLive = async () => {
    if (!streamTitle.trim() || starting) return;
    setStarting(true);
    setStartError("");
    try {
      const row = await startStream({ title: streamTitle, category: streamCategory });
      setBroadcast({ id: row.id, title: row.title, category: row.category });
      setGoLiveOpen(false);
      setStreamTitle("");
    } catch (err) {
      setStartError(err.message || "Could not start the stream. Try again.");
    } finally {
      setStarting(false);
    }
  };

  // ===== Options menu =====
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRefresh = () => { refetch(); setMenuOpen(false); };
  const handleSortByViewers = () => { setSortByViewers((s) => !s); setMenuOpen(false); };
  const handleReport = () => {
    // TODO: hook up to a real reports table
    alert("Thanks, we'll look into it.");
    setMenuOpen(false);
  };

  // ===== Filtering =====
  const filteredStreams = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = streams
      .filter((s) => {
        if (activeFilter === "All") return true;
        if (activeFilter === "Following") return followingIds.includes(s.host_id);
        return s.category === activeFilter;
      })
      .filter((s) =>
        !q ||
        s.title.toLowerCase().includes(q) ||
        (s.host?.username || "").toLowerCase().includes(q)
      );
    return sortByViewers
      ? [...list].sort((a, b) => (b.viewer_count || 0) - (a.viewer_count || 0))
      : list;
  }, [streams, activeFilter, searchQuery, followingIds, sortByViewers]);

  // Featured = most-watched live stream right now (none if nobody is live)
  const featured = useMemo(
    () => [...streams].sort((a, b) => (b.viewer_count || 0) - (a.viewer_count || 0))[0],
    [streams]
  );

  return (
    <div className="live-page">
      {/* Header */}
      <div className="live-header">
        {searchOpen ? (
          <div className="search-bar">
            <FiSearch className="search-bar-icon" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search streams or streamers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FiX className="search-close-icon" onClick={toggleSearch} />
          </div>
        ) : (
          <>
            <h2>
              Live <BsFillCircleFill className="live-dot-title" />
            </h2>
            <div className="header-actions">
              <FiSearch className="icon" onClick={toggleSearch} />
              <MdAdd className="icon" onClick={() => setGoLiveOpen(true)} />
              <div className="menu-wrapper" ref={menuRef}>
                <BsThreeDotsVertical className="icon" onClick={() => setMenuOpen((p) => !p)} />
                {menuOpen && (
                  <div className="dropdown-menu">
                    <button onClick={handleRefresh}><MdRefresh /> Refresh</button>
                    <button onClick={handleSortByViewers}>
                      <MdSort /> {sortByViewers ? "Sort by newest" : "Sort by viewers"}
                    </button>
                    <button onClick={handleReport}><MdFlag /> Report an issue</button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Live / Saved tabs */}
      <div className="live-tabs">
        <button
          className={`live-tab ${view === "live" ? "active" : ""}`}
          onClick={() => setView("live")}
        >
          Live now
        </button>
        <button
          className={`live-tab ${view === "saved" ? "active" : ""}`}
          onClick={() => setView("saved")}
        >
          Saved videos
        </button>
      </div>

      {view === "saved" ? (
        <SavedVideos />
      ) : (
      <>
      {/* Category Filters */}
      <div className="live-filters">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`filter-btn ${activeFilter === cat ? "active" : ""}`}
            onClick={() => setActiveFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Featured Stream — only when someone is live and user isn't searching */}
      {!searchQuery && featured && (
        <div className="featured-stream">
          <div className="featured-thumbnail">
            <Thumb stream={featured} />
            <div className="featured-overlay" />
            <span className="live-badge featured-badge">
              <BsFillCircleFill /> LIVE
            </span>
            <span className="viewer-badge featured-viewer-badge">
              <HiUsers /> {formatViewers(featured.viewer_count)} watching
            </span>
            <button className="play-btn"><MdPlayArrow /></button>
          </div>
          <div className="featured-info">
            <Avatar host={featured.host} className="featured-avatar" />
            <div>
              <h3>{featured.title}</h3>
              <p>{featured.host?.username} · {featured.category}</p>
            </div>
          </div>
        </div>
      )}

      <div className="section-label">
        {searchQuery ? `Results for "${searchQuery}"` : "Live Now"}
      </div>

      {/* Live Streams Grid */}
      <div className="live-grid">
        {filteredStreams.map((stream) => (
          <div className="live-card" key={stream.id}>
            <div className="live-thumbnail">
              <Thumb stream={stream} />
              <span className="live-badge"><BsFillCircleFill /> LIVE</span>
              <span className="viewer-badge">
                <HiUsers /> {formatViewers(stream.viewer_count)}
              </span>
              <div className="hover-overlay">
                <MdPlayArrow className="hover-play-icon" />
              </div>
            </div>
            <div className="live-card-info">
              <Avatar host={stream.host} className="live-card-avatar" />
              <div className="live-card-text">
                <h4>{stream.title}</h4>
                <p>
                  {stream.host?.username} <span className="dot">•</span> {stream.category}
                </p>
              </div>
            </div>
          </div>
        ))}

        {filteredStreams.length === 0 && (
          <p className="empty-state">
            {searchQuery
              ? `No streams found for "${searchQuery}".`
              : activeFilter === "Following"
              ? "Nobody you follow is live right now."
              : "No one is live yet. Be the first, tap + to go live."}
          </p>
        )}
      </div>

      </>
      )}

      {/* ===== Go Live Panel ===== */}
      {goLiveOpen && (
        <div className="modal-backdrop" onClick={() => setGoLiveOpen(false)}>
          <div className="go-live-panel" onClick={(e) => e.stopPropagation()}>
            <div className="go-live-header">
              <h3>Go Live</h3>
              <FiX className="close-icon" onClick={() => setGoLiveOpen(false)} />
            </div>

            <label>Stream title</label>
            <input
              type="text"
              maxLength={100}
              placeholder="What are you streaming today?"
              value={streamTitle}
              onChange={(e) => setStreamTitle(e.target.value)}
            />

            <label>Category</label>
            <select value={streamCategory} onChange={(e) => setStreamCategory(e.target.value)}>
              {CATEGORIES.filter((c) => c !== "All" && c !== "Following").map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {startError && (
              <p style={{ color: "#ff6b7d", fontSize: "0.8rem", marginTop: 10 }}>{startError}</p>
            )}

            <button className="go-live-btn" onClick={handleGoLive} disabled={starting}>
              <BsFillCircleFill /> {starting ? "Starting..." : "Start Streaming"}
            </button>
          </div>
        </div>
      )}

      {broadcast && (
        <LiveBroadcast
          streamId={broadcast.id}
          streamTitle={broadcast.title}
          streamCategory={broadcast.category}
          onEndStream={(saved) => {
            setBroadcast(null);
            refetch();
            if (saved) setView("saved"); // jump to the saved videos tab
          }}
        />
      )}
    </div>
  );
};

export default Live;