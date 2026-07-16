import React, { useState, useRef, useEffect } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import { BsThreeDotsVertical, BsFillCircleFill } from "react-icons/bs";
import { MdAdd, MdPlayArrow, MdRefresh, MdSort, MdFlag } from "react-icons/md";
import { HiUsers } from "react-icons/hi2";
import TechLogo from "../../assets/Tech-community.jpeg";
import FootBallIcon from "../../assets/manU.png";
import HealthLogo from "../../assets/health.png";
import LiveBroadcast from "./LiveBroadcast";
import "./Channels.css";

// =====================================================================
// 🔴 DUMMY DATA — replace with real API data once the backend is ready.
// Expected shape from API (suggested):
// {
//   id, title, streamerName, streamerAvatar, thumbnail,
//   category, viewers, isLive, startedAt, tags: []
// }
// =====================================================================

const FEATURED_STREAM = {
  id: "f1",
  title: "Champions League Watch Party 🔥 Matchday Reactions Live",
  streamerName: "Football Hub",
  streamerAvatar: FootBallIcon,
  thumbnail: FootBallIcon,
  category: "Sports",
  viewers: 12800,
  isLive: true,
};

const INITIAL_LIVE_STREAMS = [
  {
    id: 1,
    title: "Building a Full Stack App in Real Time — Ep.14",
    streamerName: "Tech Updates",
    streamerAvatar: TechLogo,
    thumbnail: TechLogo,
    category: "Tech",
    viewers: 3420,
    isLive: true,
  },
  {
    id: 2,
    title: "Morning Fitness Grind — Full Body Burn",
    streamerName: "Health & Fitness",
    streamerAvatar: HealthLogo,
    thumbnail: HealthLogo,
    category: "Fitness",
    viewers: 986,
    isLive: true,
  },
  {
    id: 3,
    title: "Post-Match Analysis: Tactics Breakdown",
    streamerName: "Football Hub",
    streamerAvatar: FootBallIcon,
    thumbnail: FootBallIcon,
    category: "Sports",
    viewers: 5210,
    isLive: true,
  },
  {
    id: 4,
    title: "AI Tools Every Dev Should Know in 2026",
    streamerName: "Tech Updates",
    streamerAvatar: TechLogo,
    thumbnail: TechLogo,
    category: "Tech",
    viewers: 1750,
    isLive: true,
  },
  {
    id: 5,
    title: "Guided Meditation + Stretch Session",
    streamerName: "Health & Fitness",
    streamerAvatar: HealthLogo,
    thumbnail: HealthLogo,
    category: "Fitness",
    viewers: 642,
    isLive: true,
  },
  {
    id: 6,
    title: "Transfer Window Live Updates",
    streamerName: "Football Hub",
    streamerAvatar: FootBallIcon,
    thumbnail: FootBallIcon,
    category: "Sports",
    viewers: 2130,
    isLive: true,
  },
];

const CATEGORIES = ["All", "Following", "Sports", "Tech", "Fitness"];

// Formats 12800 -> "12.8K"
const formatViewers = (num) => {
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return `${num}`;
};

const Live = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [liveStreams, setLiveStreams] = useState(INITIAL_LIVE_STREAMS);
const [isBroadcasting, setIsBroadcasting] = useState(false);
const [liveStreamTitle, setLiveStreamTitle] = useState("");
const [liveStreamCategory, setLiveStreamCategory] = useState("");

  // ===== Search =====
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef(null);

  const toggleSearch = () => {
    setSearchOpen((prev) => !prev);
    if (searchOpen) setSearchQuery(""); // clear when closing
  };

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // ===== Go Live panel =====
  const [goLiveOpen, setGoLiveOpen] = useState(false);
  const [streamTitle, setStreamTitle] = useState("");
  const [streamCategory, setStreamCategory] = useState("Tech");

 const handleGoLive = () => {
  if (!streamTitle.trim()) return;
  // 🔴 TODO: replace with real "start stream" API call
  setLiveStreamTitle(streamTitle);
  setLiveStreamCategory(streamCategory);
  setGoLiveOpen(false);
  setIsBroadcasting(true);
  setStreamTitle("");
};

  // ===== Options menu =====
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRefresh = () => {
    // 🔴 TODO: replace with real refetch from API
    setLiveStreams([...INITIAL_LIVE_STREAMS].sort(() => Math.random() - 0.5));
    setMenuOpen(false);
  };

  const handleSortByViewers = () => {
    setLiveStreams((prev) => [...prev].sort((a, b) => b.viewers - a.viewers));
    setMenuOpen(false);
  };

  const handleReport = () => {
    // 🔴 TODO: hook up to real report/feedback flow
    alert("Report submitted (dummy action).");
    setMenuOpen(false);
  };

  // ===== Filtering: category + search query together =====
  const filteredStreams = liveStreams
    .filter((s) => activeFilter === "All" || s.category === activeFilter)
    .filter((s) => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;
      return (
        s.title.toLowerCase().includes(q) ||
        s.streamerName.toLowerCase().includes(q)
      );
    });

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
                <BsThreeDotsVertical
                  className="icon"
                  onClick={() => setMenuOpen((prev) => !prev)}
                />
                {menuOpen && (
                  <div className="dropdown-menu">
                    <button onClick={handleRefresh}>
                      <MdRefresh /> Refresh
                    </button>
                    <button onClick={handleSortByViewers}>
                      <MdSort /> Sort by viewers
                    </button>
                    <button onClick={handleReport}>
                      <MdFlag /> Report an issue
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

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

      {/* Featured Stream — hidden while actively searching */}
      {!searchQuery && (
        <div className="featured-stream">
          <div className="featured-thumbnail">
            <img src={FEATURED_STREAM.thumbnail} alt={FEATURED_STREAM.title} />
            <div className="featured-overlay" />
            <span className="live-badge featured-badge">
              <BsFillCircleFill /> LIVE
            </span>
            <span className="viewer-badge featured-viewer-badge">
              <HiUsers /> {formatViewers(FEATURED_STREAM.viewers)} watching
            </span>
            <button className="play-btn">
              <MdPlayArrow />
            </button>
          </div>
          <div className="featured-info">
            <img
              src={FEATURED_STREAM.streamerAvatar}
              alt={FEATURED_STREAM.streamerName}
              className="featured-avatar"
            />
            <div>
              <h3>{FEATURED_STREAM.title}</h3>
              <p>
                {FEATURED_STREAM.streamerName} · {FEATURED_STREAM.category}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Section Label */}
      <div className="section-label">
        {searchQuery ? `Results for "${searchQuery}"` : "Live Now"}
      </div>

      {/* Live Streams Grid */}
      <div className="live-grid">
        {filteredStreams.map((stream) => (
          <div className="live-card" key={stream.id}>
            <div className="live-thumbnail">
              <img src={stream.thumbnail} alt={stream.title} />
              <span className="live-badge">
                <BsFillCircleFill /> LIVE
              </span>
              <span className="viewer-badge">
                <HiUsers /> {formatViewers(stream.viewers)}
              </span>
              <div className="hover-overlay">
                <MdPlayArrow className="hover-play-icon" />
              </div>
            </div>
            <div className="live-card-info">
              <img
                src={stream.streamerAvatar}
                alt={stream.streamerName}
                className="live-card-avatar"
              />
              <div className="live-card-text">
                <h4>{stream.title}</h4>
                <p>
                  {stream.streamerName} <span className="dot">•</span>{" "}
                  {stream.category}
                </p>
              </div>
            </div>
          </div>
        ))}

        {filteredStreams.length === 0 && (
          <p className="empty-state">
            {searchQuery
              ? `No streams found for "${searchQuery}".`
              : "No live streams in this category right now."}
          </p>
        )}
      </div>

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
              placeholder="What are you streaming today?"
              value={streamTitle}
              onChange={(e) => setStreamTitle(e.target.value)}
            />

            <label>Category</label>
            <select
              value={streamCategory}
              onChange={(e) => setStreamCategory(e.target.value)}
            >
              {CATEGORIES.filter((c) => c !== "All" && c !== "Following").map(
                (c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                )
              )}
            </select>

            <button className="go-live-btn" onClick={handleGoLive}>
              <BsFillCircleFill /> Start Streaming
            </button>
          </div>
        </div>
      )}
      {isBroadcasting && (
  <LiveBroadcast
    streamTitle={liveStreamTitle}
    streamCategory={liveStreamCategory}
    onEndStream={() => setIsBroadcasting(false)}
  />
)}
    </div>
  );
};

export default Live;