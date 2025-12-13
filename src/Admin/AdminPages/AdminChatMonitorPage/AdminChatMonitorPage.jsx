import React from 'react'
import "../AdminHomePage/AdminHomePage.css"
import AdminSidebar from '../../AdminComponents/AdminSidebar/AdminSidebar'
import AdminChatMonitor from '../../AdminComponents/AdminChatMonitor/AdminChatMonitor'

const AdminChatMonitorPage = () => {
  return (
    <div className='adminDash-layout'>
        <AdminSidebar />
      <div className="adminDash-content">
        <AdminChatMonitor />
      </div>
    </div>
  )
}

export default AdminChatMonitorPage
