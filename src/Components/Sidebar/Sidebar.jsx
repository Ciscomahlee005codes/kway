import React from 'react'
import "./Sidebar.css"
import { BsFillChatSquareTextFill } from "react-icons/bs";
import { HiOutlineStatusOnline } from "react-icons/hi";
import { MdLiveTv } from "react-icons/md";
import { FaUsers } from "react-icons/fa";
import { IoSettingsSharp } from "react-icons/io5";
import { FaUserCircle } from "react-icons/fa";
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const topLinks = [
  { icon: <BsFillChatSquareTextFill />, label: "Chats", link: "/" },
  { icon: <HiOutlineStatusOnline />, label: "Status", link: "/status" },
  { icon: <MdLiveTv />, label: "Channels", link: "/channels" },
  { icon: <FaUsers />, label: "Communities", link: "/communities" }
];

const bottomLinks = [
  { icon: <FaUserCircle />, label: "Profile", link: "/profile" },
  { icon: <IoSettingsSharp />, label: "Settings", link: "/settings" }
];


  return (
    <div>
      {/* Sidebar for Large Devices */}
      <div className="sidebar">
        <div className="sidebar-top">
          {topLinks.map((link, idx) => (
            <NavLink key={idx}  to={link.link} className="sidebar-link">
              {link.icon}
              <span className="sidebar-text">{link.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="sidebar-bottom">
          {bottomLinks.map((link, idx) => (
            <NavLink key={idx}  to={link.link} className="sidebar-link">
              {link.icon}
              <span className="sidebar-text">{link.label}</span>
            </NavLink>
          ))}
        </div>
      </div>

      {/* Bottom Nav for Mobile */}
      <div className="bottom-nav">
        {[...topLinks, ...bottomLinks].map((link, idx) => (
          <NavLink key={idx}  to={link.link} className="bottom-link">
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  )
}

export default Sidebar
