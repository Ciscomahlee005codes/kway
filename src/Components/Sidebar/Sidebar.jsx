import React from 'react'
import "./Sidebar.css"
import { BsFillChatSquareTextFill } from "react-icons/bs";
import { HiOutlineStatusOnline } from "react-icons/hi";
import { MdLiveTv } from "react-icons/md";
import { FaUsers } from "react-icons/fa";
import { TiContacts } from "react-icons/ti";
import { IoSettingsSharp } from "react-icons/io5";
import { FaUserCircle } from "react-icons/fa";
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const topLinks = [
    { icon: <BsFillChatSquareTextFill />, label: "Chats", link: "/chat" },
    { icon: <HiOutlineStatusOnline />, label: "Status", link: "/status" },
    { icon: <MdLiveTv />, label: "Channels", link: "/channels" },
    { icon: <FaUsers />, label: "Groups", link: "/communities" },
    { icon: <TiContacts />, label: "Contacts", link: "/contactlist" },
  ];

  const bottomLinks = [
    { icon: <FaUserCircle />, label: "Profile", link: "/profile" },
    { icon: <IoSettingsSharp />, label: "Settings", link: "/settings" },
  ];

  return (
    <div>
      {/* Sidebar for Large Devices */}
      <div className="sidebar">
        <div className="sidebar-top">
          {topLinks.map((link, idx) => (
            <NavLink 
              key={idx} 
              to={link.link} 
              className={({ isActive }) => 
                `sidebar-link ${isActive ? "active-link" : ""}`
              }
            >
              {link.icon}
              <span className="sidebar-text">{link.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="sidebar-bottom">
          {bottomLinks.map((link, idx) => (
            <NavLink 
              key={idx} 
              to={link.link} 
              className={({ isActive }) => 
                `sidebar-link ${isActive ? "active-link" : ""}`
              }
            >
              {link.icon}
              <span className="sidebar-text">{link.label}</span>
            </NavLink>
          ))}
        </div>
      </div>

      {/* Bottom Nav for Mobile */}
<div className="bottom-nav">
  {[...topLinks, ...bottomLinks]
    .filter(link => link.label !== "Settings") // ✅ hide settings on mobile
    .map((link, idx) => (
      <NavLink 
        key={idx}  
        to={link.link} 
        className={({ isActive }) => 
          `bottom-link ${isActive ? "active-bottom-link" : ""}`
        }
      >
        {link.icon}
        <span>{link.label}</span>
      </NavLink>
  ))}
</div>

    </div>
  )
}

export default Sidebar;
