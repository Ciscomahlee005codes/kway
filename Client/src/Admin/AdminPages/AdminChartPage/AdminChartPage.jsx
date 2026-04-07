import React, { useState } from 'react'
import "../AdminHomePage/AdminHomePage.css"
import AdminSidebar from '../../AdminComponents/AdminSidebar/AdminSidebar'
import KwayChatStats from '../../AdminChart/KwayChatStats';

const AdminChartPage = () => {
  const [collapsed, setCollapsed] = useState(true);
  return (
    <div className='adminDash-layout'>
        <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={`adminDash-content ${collapsed ? "collapsed" : ""}`}>
        <KwayChatStats collapsed={collapsed} />
      </div>
    </div>
  )
}

export default AdminChartPage
