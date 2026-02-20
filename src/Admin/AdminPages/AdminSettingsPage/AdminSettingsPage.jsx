import React, { useState } from 'react'
import AdminSidebar from '../../AdminComponents/AdminSidebar/AdminSidebar'
import AdminSettings from '../../AdminComponents/AdminSettings/AdminSettings'
import "../AdminHomePage/AdminHomePage.css"

const AdminSettingsPage = () => {
  const [collapsed, setCollapsed] = useState(true);
  return (
     <div className='adminDash-layout'>
        <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={`adminDash-content ${collapsed ? "collapsed" : ""}`}>
        <AdminSettings collapsed={collapsed} />
      </div>
    </div>
  )
}

export default AdminSettingsPage
