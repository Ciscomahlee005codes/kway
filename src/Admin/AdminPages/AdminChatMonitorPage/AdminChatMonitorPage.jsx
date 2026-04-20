import React, { useState } from 'react'
import "../AdminHomePage/AdminHomePage.css"
import AdminSidebar from '../../AdminComponents/AdminSidebar/AdminSidebar'
import AdminChatMonitor from '../../AdminComponents/AdminChatMonitor/AdminChatMonitor'

const AdminChatMonitorPage = () => {
  const [collapsed, setCollapsed] = useState(true);
  return (
    <div className='adminDash-layout'>
        <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={`adminDash-content ${collapsed ? "collapsed" : ""}`}>
        <AdminChatMonitor collapsed={collapsed} />
      </div>
    </div>
  )
}

export default AdminChatMonitorPage
