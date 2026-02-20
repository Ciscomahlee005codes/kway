import React, { useState } from 'react'
import "../AdminHomePage/AdminHomePage.css"
import AdminSidebar from '../../AdminComponents/AdminSidebar/AdminSidebar'
import UserManagement from '../../AdminComponents/UserManagement/UserManagement'

const UserManagePage = () => {
   const [collapsed, setCollapsed] = useState(true);
  return (
    <div className='adminDash-layout'>
        <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={`adminDash-content ${collapsed ? "collapsed" : ""}`}>
        <UserManagement />
      </div>
    </div>
  )
}

export default UserManagePage
