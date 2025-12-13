import React from 'react'
import "../AdminHomePage/AdminHomePage.css"
import AdminSidebar from '../../AdminComponents/AdminSidebar/AdminSidebar'
import UserManagement from '../../AdminComponents/UserManagement/UserManagement'

const UserManagePage = () => {
  return (
    <div className='adminDash-layout'>
        <AdminSidebar />
      <div className="adminDash-content">
        <UserManagement />
      </div>
    </div>
  )
}

export default UserManagePage
