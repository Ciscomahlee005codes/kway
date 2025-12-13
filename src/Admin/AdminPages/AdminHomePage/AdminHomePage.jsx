import React from 'react'
import AdminSidebar from '../../AdminComponents/AdminSidebar/AdminSidebar'
import AdminHome from '../../AdminComponents/AdminHome/AdminHome'
import "./AdminHomePage.css"

const AdminHomePage = () => {
  return (
    <div className='adminDash-layout'>
      <AdminSidebar />
      <div className="adminDash-content">
        <AdminHome />
      </div>
    </div>
  )
}

export default AdminHomePage
