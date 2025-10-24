import { Route, Routes, useLocation } from "react-router-dom";
import Sidebar from "./Components/Sidebar/Sidebar";
import StatusPage from "./Pages/StatusPage/StatusPage";
import ChatPage from "./Pages/ChatPage/ChatPage";
import ChannelPage from "./Pages/ChannelPage/ChannelPage";
import CommunityPage from "./Pages/CommunityPage/CommunityPage";
import ContactPage from "./Pages/ContactPage/ContactPage";
import ProfilePage from "./Pages/ProfilePage/ProfilePage";
import SettingsPage from "./Pages/SettingsPage/SettingsPage";
import Auth from "./Components/Auth/Auth";

function App() {
  const location = useLocation();

  // Hide sidebar on Auth route
  const hideSidebar = location.pathname === "/";

  return (
    <div className="app">
      {!hideSidebar && <Sidebar />}
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/status" element={<StatusPage />} />
        <Route path="/channels" element={<ChannelPage />} />
        <Route path="/communities" element={<CommunityPage />} />
        <Route path="/contactlist" element={<ContactPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </div>
  );
}

export default App;
