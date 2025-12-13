import React from 'react'
import AdminSidebar from '../../AdminComponents/AdminSidebar/AdminSidebar'
import AdminSettings from '../../AdminComponents/AdminSettings/AdminSettings'
import "../AdminHomePage/AdminHomePage.css"

const AdminSettingsPage = () => {
  return (
     <div className='adminDash-layout'>
        <AdminSidebar />
      <div className="adminDash-content">
        <AdminSettings />
      </div>
    </div>
  )
}

export default AdminSettingsPage
