import { Route, Routes } from "react-router-dom"
import Sidebar from "./Components/Sidebar/Sidebar"
import StatusPage from "./Pages/StatusPage/StatusPage"
import ChatPage from "./Pages/ChatPage/ChatPage"
import ChannelPage from "./Pages/ChannelPage/ChannelPage"
import CommunityPage from "./Pages/CommunityPage/CommunityPage"

function App() {
  

  return (
    <div className="app">
      <Sidebar />
      <Routes>
        <Route path="/" element={<ChatPage />} />
        <Route path="/status" element={<StatusPage />} />
         <Route path="/channels" element={<ChannelPage />} />
         <Route path="/communities" element={<CommunityPage />} />
      </Routes>
    </div>
  )
}

export default App
