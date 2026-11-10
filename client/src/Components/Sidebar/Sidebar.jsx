import React, { useMemo } from 'react'
import "./Sidebar.css"
import { BsFillChatSquareTextFill } from "react-icons/bs";
import { HiOutlineStatusOnline } from "react-icons/hi";
import { MdLiveTv } from "react-icons/md";
import { FaUsers, FaUserCircle } from "react-icons/fa";
import { GiThreeFriends } from "react-icons/gi";
import { IoSettingsSharp } from "react-icons/io5";
import { NavLink, useLocation } from 'react-router-dom';
import { useLanguage } from "../../Context/LanguageContext";

const Sidebar = () => {
  const { t } = useLanguage();

  // "Live" (Channels route) — permanent unique red feature on desktop,
  // and the default center bubble on mobile when no other page is active
  const topLinks = [
    { icon: <BsFillChatSquareTextFill />, label: "navChats", link: "/chat" },
    { icon: <HiOutlineStatusOnline />, label: "navStatus", link: "/status" },
    { icon: <MdLiveTv />, label: "navLive", link: "/channels", isLive: true },
    { icon: <FaUsers />, label: "navGroups", link: "/groups" },
    { icon: <GiThreeFriends />, label: "navLinkUp", link: "/linkup" },
  ];

  const bottomLinks = [
    { icon: <FaUserCircle />, label: "navProfile", link: "/profile" },
    { icon: <IoSettingsSharp />, label: "navSettings", link: "/settings" },
  ];

  const { pathname } = useLocation();

  // ✅ Mobile bottom nav = topLinks + Profile only (Settings stays desktop-only)
  const mobileSourceLinks = useMemo(
    () => [...topLinks, ...bottomLinks.filter((l) => l.label !== "navSettings")],
    []
  );

  // ✅ Which link is active right now — falls back to Live
  const activeIdx = useMemo(() => {
    const matchIdx = mobileSourceLinks.findIndex((l) =>
      pathname.startsWith(l.link)
    );
    if (matchIdx !== -1) return matchIdx;
    return mobileSourceLinks.findIndex((l) => l.isLive);
  }, [pathname, mobileSourceLinks]);

  // ✅ Reorder so the active link always sits dead-center
  const mobileLinks = useMemo(() => {
    const arr = [...mobileSourceLinks];
    const [centerLink] = arr.splice(activeIdx, 1);
    const centerPos = Math.floor(arr.length / 2);
    arr.splice(centerPos, 0, { ...centerLink, isCenter: true });
    return arr;
  }, [activeIdx, mobileSourceLinks]);

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
                `sidebar-link ${link.isLive ? "raised-sidebar-link live-sidebar-link" : ""} ${
                  isActive ? "active-link" : ""
                }`
              }
            >
              {link.isLive ? (
                <span className="sidebar-icon-badge">{link.icon}</span>
              ) : (
                link.icon
              )}
              <span className="sidebar-text">{t(link.label)}</span>
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
              <span className="sidebar-text">{t(link.label)}</span>
            </NavLink>
          ))}
        </div>
      </div>

      {/* Bottom Nav for Mobile */}
      <div className="bottom-nav">
        {mobileLinks.map((link, idx) => (
          <NavLink
            key={idx}
            to={link.link}
            className={({ isActive }) =>
              `bottom-link ${link.isCenter ? "raised-link" : ""} ${
                link.isCenter && link.isLive ? "live-link" : ""
              } ${isActive ? "active-bottom-link" : ""}`
            }
          >
            {link.isCenter ? (
              <span className="icon-wrapper">{link.icon}</span>
            ) : (
              link.icon
            )}
            <span>{t(link.label)}</span>
          </NavLink>
        ))}
      </div>
    </div>
  )
}

export default Sidebar;