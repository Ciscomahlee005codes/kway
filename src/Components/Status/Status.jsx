import React, { useState, useEffect } from "react";
import KwayLogo from "../../assets/kway-logo-1.png";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FiPlus } from "react-icons/fi";
import { IoChevronBack, IoChevronForward, IoClose } from "react-icons/io5";
import "./Status.css";

const statuses = [
  {
    id: 1,
    name: "John Doe",
    time: "Today, 10:30 AM",
    stories: [
      { img: "https://i.pravatar.cc/600?img=1", caption: "Good vibes only 🌞" },
      { img: "https://i.pravatar.cc/600?img=12", caption: "Keep smiling 😊" },
      { img: "https://i.pravatar.cc/600?img=15", caption: "Feeling blessed 🙏" },
    ],
  },
  {
    id: 2,
    name: "Sarah Smith",
    time: "Today, 9:15 AM",
    stories: [
      { img: "https://i.pravatar.cc/600?img=2", caption: "Morning walk 🚶‍♀️" },
      { img: "https://i.pravatar.cc/600?img=13", caption: "Fresh air 💨" },
      { img: "https://i.pravatar.cc/600?img=25", caption: "Grateful for today ❤️" },
    ],
  },
  {
    id: 3,
    name: "Michael Lee",
    time: "Yesterday, 8:00 PM",
    stories: [
      { img: "https://i.pravatar.cc/600?img=3", caption: "Chillin’ 😎" },
      { img: "https://i.pravatar.cc/600?img=30", caption: "Night vibes 🌙" },
      { img: "https://i.pravatar.cc/600?img=31", caption: "Peace ✌️" },
    ],
  },
  {
    id: 4,
    name: "Anna Brown",
    time: "Yesterday, 5:45 PM",
    stories: [
      { img: "https://i.pravatar.cc/600?img=4", caption: "Self-care time 🧘‍♀️" },
      { img: "https://i.pravatar.cc/600?img=34", caption: "Coffee break ☕" },
      { img: "https://i.pravatar.cc/600?img=35", caption: "New day, same grace 🙌" },
    ],
  },
  {
    id: 5,
    name: "Chris Evans",
    time: "Yesterday, 2:30 PM",
    stories: [
      { img: "https://i.pravatar.cc/600?img=5", caption: "Focus mode ⚡" },
      { img: "https://i.pravatar.cc/600?img=36", caption: "Let’s build 🚀" },
      { img: "https://i.pravatar.cc/600?img=37", caption: "Stay winning 🏆" },
    ],
  },
];

const Status = () => {
  const [activeUserIndex, setActiveUserIndex] = useState(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Auto progress logic
  useEffect(() => {
    if (activeUserIndex !== null) {
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            nextStory();
            return 0;
          }
          return prev + 2.5; // speed
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
    if (activeStoryIndex < currentUser.stories.length - 1) {
      setActiveStoryIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      nextUser();
    }
  };

  const prevStory = () => {
    if (activeStoryIndex > 0) {
      setActiveStoryIndex((prev) => prev - 1);
      setProgress(0);
    } else {
      prevUser();
    }
  };

  const nextUser = () => {
    if (activeUserIndex < statuses.length - 1) {
      setActiveUserIndex((prev) => prev + 1);
      setActiveStoryIndex(0);
      setProgress(0);
    } else {
      closeStatus();
    }
  };

  const prevUser = () => {
    if (activeUserIndex > 0) {
      setActiveUserIndex((prev) => prev - 1);
      const lastStory = statuses[activeUserIndex - 1].stories.length - 1;
      setActiveStoryIndex(lastStory);
      setProgress(0);
    }
  };

  return (
    <div className="status-page">
      {/* Header */}
      <div className="status-header">
        <div className="status-logo">
          <img src={KwayLogo} alt="Logo" />
        </div>
        <h2 className="status-title">Status</h2>
        <BsThreeDotsVertical className="status-menu" />
      </div>

      {/* My Status */}
      <div className="my-status">
        <div className="status-avatar">
          <img src="https://i.pravatar.cc/100?img=10" alt="My Status" className="avatar" />
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
              <img src={s.stories[0].img} alt={s.name} className="avatar" />
            </div>
            <div className="status-text">
              <h3>{s.name}</h3>
              <p>{s.time}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal View */}
      {activeUserIndex !== null && (
        <div className="status-modal">
          <div className="status-modal-content">
            {/* Progress */}
            <div className="progress-container">
              {statuses[activeUserIndex].stories.map((_, i) => (
                <div key={i} className={`progress-bar ${i < activeStoryIndex ? "filled" : ""}`}>
                  {i === activeStoryIndex && (
                    <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                  )}
                </div>
              ))}
            </div>

            <img
              src={statuses[activeUserIndex].stories[activeStoryIndex].img}
              alt="status"
              className="status-modal-img"
            />

            {/* Top Overlay */}
            <div className="status-top-overlay">
              <div className="status-user-info">
                <img
                  src={statuses[activeUserIndex].stories[0].img}
                  alt="profile"
                  className="status-profile-pic"
                />
                <div>
                  <h3>{statuses[activeUserIndex].name}</h3>
                  <p>{statuses[activeUserIndex].time}</p>
                </div>
              </div>
            </div>

            {/* Bottom Overlay */}
            <div className="status-bottom-overlay">
              <p className="status-caption">
                {statuses[activeUserIndex].stories[activeStoryIndex].caption}
              </p>
            </div>

            {/* Controls */}
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
