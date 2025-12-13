import React from 'react'
import "../AdminHomePage/AdminHomePage.css"
import AdminSidebar from '../../AdminComponents/AdminSidebar/AdminSidebar'
import AdminNotification from '../../AdminComponents/AdminNotification/AdminNotification'

const AdminNotificationPage = () => {
  return (
    <div className='adminDash-layout'>
        <AdminSidebar />
      <div className="adminDash-content">
        <AdminNotification />
      </div>
    </div>
  )
}

export default AdminNotificationPage
