import React, { useState, useEffect } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FiPlus } from "react-icons/fi";
import { IoChevronBack, IoChevronForward, IoClose } from "react-icons/io5";
import "./Status.css";

const initialStatuses = [
  {
    id: 1,
    name: "John Doe",
    time: "Today, 10:30 AM",
    stories: [
      { type: "text", caption: "Good vibes only 🌞", bgColor: "#25d366" },
      { type: "media", img: "https://i.pravatar.cc/600?img=11", caption: "Check this out!" },
    ],
  },
  {
    id: 2,
    name: "Sarah Smith",
    time: "Today, 9:15 AM",
    stories: [
      { type: "media", img: "https://i.pravatar.cc/600?img=2", caption: "Morning walk 🚶‍♀️" },
    ],
  },
  {
    id: 3,
    name: "Michael Scott",
    time: "Yesterday, 6:20 PM",
    stories: [
      { type: "text", caption: "That's what she said!", bgColor: "#ffeb3b" },
    ],
  },
];

const bgColors = ["#25d366", "#34b7f1", "#ffeb3b", "#f44336", "#9c27b0"];

const Status = () => {
  const [statuses, setStatuses] = useState(initialStatuses);
  const [activeUserIndex, setActiveUserIndex] = useState(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showPostModal, setShowPostModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [postType, setPostType] = useState(null);
  const [postContent, setPostContent] = useState("");
  const [preview, setPreview] = useState(null);
  const [selectedBg, setSelectedBg] = useState(bgColors[0]);

  useEffect(() => {
    if (activeUserIndex !== null) {
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            nextStory();
            return 0;
          }
          return prev + 2.5;
        });
      }, 100);
      return () => clearInterval(timer);
    }
  }, [activeUserIndex, activeStoryIndex]);

  const openStatus = (index) => {
    setActiveUserIndex(index);
    setActiveStoryIndex(0);
    setProgress(0);
  };

  const closeStatus = () => {
    setActiveUserIndex(null);
    setProgress(0);
  };

  const nextStory = () => {
    const currentUser = statuses[activeUserIndex];
    if (activeStoryIndex < currentUser.stories.length - 1) setActiveStoryIndex(prev => prev + 1);
    else nextUser();
    setProgress(0);
  };

  const prevStory = () => {
    if (activeStoryIndex > 0) setActiveStoryIndex(prev => prev - 1);
    else prevUser();
    setProgress(0);
  };

  const nextUser = () => {
    if (activeUserIndex < statuses.length - 1) setActiveUserIndex(prev => prev + 1);
    else closeStatus();
    setActiveStoryIndex(0);
    setProgress(0);
  };

  const prevUser = () => {
    if (activeUserIndex > 0) setActiveUserIndex(prev => prev - 1);
    setActiveStoryIndex(statuses[activeUserIndex - 1].stories.length - 1);
    setProgress(0);
  };

  const handlePost = () => {
    if (!postContent && !preview) return;

    const newStory = postType === "text"
      ? { type: "text", caption: postContent, bgColor: selectedBg }
      : { type: "media", caption: postContent, img: preview };

    const existingMyStatusIndex = statuses.findIndex(s => s.name === "My Status");
    if (existingMyStatusIndex !== -1) {
      // Add to existing My Status
      const updatedStatuses = [...statuses];
      updatedStatuses[existingMyStatusIndex].stories.push(newStory);
      updatedStatuses[existingMyStatusIndex].time = "Just now";
      setStatuses(updatedStatuses);
    } else {
      const newStatus = {
        id: Date.now(),
        name: "My Status",
        time: "Just now",
        stories: [newStory],
      };
      setStatuses([newStatus, ...statuses]);
    }

    setPostType(null);
    setPostContent("");
    setPreview(null);
    setShowPostModal(false);
    setSelectedBg(bgColors[0]);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="status-page">
      {/* Post Modal */}
      {/* Post Modal */}
{showPostModal && (
  <div className="post-modal">
    <div className="post-box">
      <h3>Create Status</h3>

      {/* Post Type Selection */}
      {!postType && (
        <div className="post-type-selection">
          <button className="post-btn" onClick={() => setPostType("text")}>Text Post</button>
          <button className="post-btn" onClick={() => setPostType("media")}>Media Post</button>
        </div>
      )}

      {/* Text Post */}
      {postType === "text" && (
        <>
          <textarea
            placeholder="Type your status…"
            className="post-textarea"
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
          />
          <div className="bg-picker">
            {bgColors.map(color => (
              <span
                key={color}
                className={`color-circle ${selectedBg === color ? "selected" : ""}`}
                style={{ backgroundColor: color }}
                onClick={() => setSelectedBg(color)}
              />
            ))}
          </div>
          {postContent && (
            <div className="status-preview" style={{ backgroundColor: selectedBg }}>
              <p>{postContent}</p>
            </div>
          )}
        </>
      )}

      {/* Media Post */}
      {postType === "media" && (
        <>
          <input type="file" accept="image/*,video/*" onChange={handleFileChange} className="file-input" />
          {preview && (
            <div className="status-preview">
              {preview.startsWith("data:image") ? (
                <img src={preview} alt="Preview" className="preview-img" />
              ) : (
                <video src={preview} controls className="preview-img" />
              )}
            </div>
          )}
          <textarea
            placeholder="Write a caption…"
            className="post-textarea"
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
          />
        </>
      )}

      {/* Actions */}
      <div className="post-actions">
        <button onClick={() => { setShowPostModal(false); setPostType(null); setPostContent(""); setPreview(null); }}>Cancel</button>
        <button className="send-btn" onClick={handlePost}>Post</button>
      </div>
    </div>
  </div>
)}

    

      {/* Header */}
      <div className="status-header">
        <h2 className="status-title">Status</h2>
        <div className="dropdown-wrapper">
          <BsThreeDotsVertical className="status-menu" onClick={() => setDropdownOpen(!dropdownOpen)} />
          {dropdownOpen && (
            <div className="dropdown-menu">
              <p>Refresh</p>
              <p>Status Privacy</p>
              <p>Clear My Status</p>
              <p>Settings</p>
            </div>
          )}
        </div>
      </div>

      {/* My Status */}
      <div className="my-status" onClick={() => setShowPostModal(true)}>
        <div className="status-avatar">
          <img src="https://i.pravatar.cc/100?img=10" alt="My Profile" className="avatar" />
          <FiPlus className="add-icon" />
        </div>
        <div className="status-text">
          <h3>My Status</h3>
          <p>Tap to add status update</p>
        </div>
      </div>

      {/* Recent Updates */}
      <h4 className="section-title">Recent updates</h4>
      <div className="status-list">
        {statuses.map((s, index) => (
          <div className="status-item" key={s.id} onClick={() => openStatus(index)}>
            <div className="status-avatar ring">
              {s.stories[0].type === "text" ? (
                <div style={{ backgroundColor: s.stories[0].bgColor }} className="text-avatar">{s.stories[0].caption}</div>
              ) : (
                <img src={s.stories[0].img || "https://i.pravatar.cc/100"} alt={s.name} className="avatar" />
              )}
            </div>
            <div className="status-text">
              <h3>{s.name}</h3>
              <p>{s.time}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Status Modal */}
      {activeUserIndex !== null && (
        <div className="status-modal">
          <div className="status-modal-content">
            <div className="progress-container">
              {statuses[activeUserIndex].stories.map((_, i) => (
                <div key={i} className={`progress-bar ${i < activeStoryIndex ? "filled" : ""}`}>
                  {i === activeStoryIndex && <div className="progress-fill" style={{ width: `${progress}%` }} />}
                </div>
              ))}
            </div>

            {statuses[activeUserIndex].stories[activeStoryIndex].type === "text" ? (
              <div className="status-text-full" style={{ backgroundColor: statuses[activeUserIndex].stories[activeStoryIndex].bgColor }}>
                <p>{statuses[activeUserIndex].stories[activeStoryIndex].caption}</p>
              </div>
            ) : (
              <img src={statuses[activeUserIndex].stories[activeStoryIndex].img} alt="status" className="status-modal-img" />
            )}

            <div className="status-top-overlay">
              <div className="status-user-info">
                <img
                  src={statuses[activeUserIndex].stories[0].img || "https://i.pravatar.cc/100"}
                  alt="profile"
                  className="status-profile-pic"
                />
                <div>
                  <h3>{statuses[activeUserIndex].name}</h3>
                  <p>{statuses[activeUserIndex].time}</p>
                </div>
              </div>
            </div>
            <div className="status-bottom-overlay">
              <p className="status-caption">{statuses[activeUserIndex].stories[activeStoryIndex].caption}</p>
            </div>
            <IoClose className="close-btn" onClick={closeStatus} />
            <IoChevronBack className="nav-btn left" onClick={prevStory} />
            <IoChevronForward className="nav-btn right" onClick={nextStory} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Status;
