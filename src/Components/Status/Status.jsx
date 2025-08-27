import React from "react";
import KwayLogo from "../../assets/kway-logo-1.png"
import { BsThreeDotsVertical } from "react-icons/bs";
import { FiPlus } from "react-icons/fi";
import "./Status.css"

const statuses = [
  {
    id: 1,
    name: "John Doe",
    time: "Today, 10:30 AM",
    img: "https://i.pravatar.cc/100?img=1",
  },
  {
    id: 2,
    name: "Sarah Smith",
    time: "Today, 9:15 AM",
    img: "https://i.pravatar.cc/100?img=2",
  },
  {
    id: 3,
    name: "Michael Lee",
    time: "Yesterday, 8:00 PM",
    img: "https://i.pravatar.cc/100?img=3",
  },
];

const Status = () => {
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
          <img
            src="https://i.pravatar.cc/100?img=10"
            alt="My Status"
            className="avatar"
          />
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
        {statuses.map((s) => (
          <div className="status-item" key={s.id}>
            <div className="status-avatar">
              <img src={s.img} alt={s.name} className="avatar" />
            </div>
            <div className="status-text">
              <h3>{s.name}</h3>
              <p>{s.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Status;
