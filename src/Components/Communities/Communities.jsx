import React from "react";
import { FaUsers } from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";
import TechLogo from "../../assets/Tech-community.jpeg"
import HealthLogo from "../../assets/health.png"
import StudentIcon from "../../assets/school-logo.jpeg"
import "./Communities.css";

const Communities = () => {
  const communities = [
    {
      id: 1,
      name: "Tech Enthusiasts",
      description: "A hub for developers, designers & techies.",
      groups: ["Web Devs", "AI Researchers", "UI/UX Team"],
      image: TechLogo,
    },
    {
      id: 2,
      name: "Fitness & Health",
      description: "Stay fit, eat well, and live healthy.",
      groups: ["Yoga", "Workout Buddies", "Diet Plans"],
      image: HealthLogo,
    },
    {
      id: 3,
      name: "Student Connect",
      description: "For learners across different universities.",
      groups: ["Engineering", "Medical Students", "Business Class"],
      image: StudentIcon,
    },
  ];

  return (
    <div className="communities">
      {/* Header */}
      <div className="communities-header">
        <h2>Communities</h2>
      </div>

      {/* Community List */}
      <div className="communities-list">
        {communities.map((community) => (
          <div key={community.id} className="community-card">
            <img src={community.image} alt={community.name} />
            <div className="community-info">
              <h3>{community.name}</h3>
              <p>{community.description}</p>
              <div className="community-groups">
                {community.groups.map((group, idx) => (
                  <span key={idx} className="group-tag">
                    {group}
                  </span>
                ))}
              </div>
            </div>
            <IoIosArrowForward className="arrow-icon" />
          </div>
        ))}
      </div>

      {/* Create Community Section */}
      <div className="create-community">
        <FaUsers className="create-icon" />
        <span>Create a New Community</span>
      </div>
    </div>
  );
};

export default Communities;
