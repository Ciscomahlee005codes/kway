import React from "react";
import { FiSearch } from "react-icons/fi";
import { BsThreeDotsVertical } from "react-icons/bs";
import { MdAdd } from "react-icons/md";
import TechLogo from "../../assets/Tech-community.jpeg"
import FootBallIcon from "../../assets/manU.png";
import HealthLogo from "../../assets/health.png"
import "./Channels.css";

const Channels = () => {
  const channels = [
    {
      id: 1,
      name: "Tech Updates",
      description: "Latest news in tech",
      image: TechLogo,
    },
    {
      id: 2,
      name: "Football Hub",
      description: "All about football 🔥",
      image: FootBallIcon,
    },
    {
      id: 3,
      name: "Health & Fitness",
      description: "Daily fitness motivation",
      image: HealthLogo,
    },
  ];

  return (
    <div className="channels-page">
      {/* Header */}
      <div className="channels-header">
        <h2>Channels</h2>
        <div className="header-actions">
          <FiSearch className="icon" />
          <MdAdd className="icon" />
          <BsThreeDotsVertical className="icon" />
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="channel-filters">
        <button className="filter-btn active">All</button>
        <button className="filter-btn">Following</button>
        <button className="filter-btn">Popular</button>
        <button className="filter-btn">New</button>
      </div>

      {/* Channel List */}
      <div className="channel-list">
        {channels.map((channel) => (
          <div className="channel-card" key={channel.id}>
            <img src={channel.image} alt={channel.name} className="channel-img" />
            <div className="channel-info">
              <h4>{channel.name}</h4>
              <p>{channel.description}</p>
            </div>
            <button className="follow-btn">Follow</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Channels;
