import React, { useState } from 'react'
import "../AdminHomePage/AdminHomePage.css"
import AdminSidebar from '../../AdminComponents/AdminSidebar/AdminSidebar'
import AdminTestimonials from '../../AdminComponents/AdminTestimonials/AdminTestimonials';


const AdminTestPage = () => {
  const [collapsed, setCollapsed] = useState(true);
  return (
    <div className='adminDash-layout'>
        <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={`adminDash-content ${collapsed ? "collapsed" : ""}`}>
        <AdminTestimonials collapsed={collapsed} />
      </div>
    </div>
  )
}

export default AdminTestPage
