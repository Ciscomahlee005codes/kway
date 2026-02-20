import React, { useState } from 'react'
import "../AdminHomePage/AdminHomePage.css"
import AdminSidebar from '../../AdminComponents/AdminSidebar/AdminSidebar'
import AdminNotification from '../../AdminComponents/AdminNotification/AdminNotification'

const AdminNotificationPage = () => {
  const [collapsed, setCollapsed] = useState(true);
  return (
    <div className='adminDash-layout'>
        <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={`adminDash-content ${collapsed ? "collapsed" : ""}`}>
        <AdminNotification collapsed={collapsed} />
      </div>
    </div>
  )
}

export default AdminNotificationPage
