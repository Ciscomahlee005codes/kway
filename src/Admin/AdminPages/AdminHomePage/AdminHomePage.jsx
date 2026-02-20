import React, { useState } from "react";
import AdminSidebar from "../../AdminComponents/AdminSidebar/AdminSidebar";
import AdminHome from "../../AdminComponents/AdminHome/AdminHome";
import "./AdminHomePage.css";

const AdminHomePage = () => {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div className="adminDash-layout">
      <AdminSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div className={`adminDash-content ${collapsed ? "collapsed" : ""}`}>
        <AdminHome />
      </div>
    </div>
  );
};

export default AdminHomePage;
