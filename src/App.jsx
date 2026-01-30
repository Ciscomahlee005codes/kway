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
import AccountPage from "./Pages/AccountPage/AccountPage";
import NotificationPage from "./Components/NotificationPage/NotificationPage";
import LanguagePage from "./Components/LanguagePage/LanguagePage";
import Help from "./Components/Help/Help";
import About from "./Components/About/About";
import AdminAuth from "./Admin/AdminAuth/AdminAuth";
import AdminSidebar from "./Admin/AdminComponents/AdminSidebar/AdminSidebar";
import AdminHomePage from "./Admin/AdminPages/AdminHomePage/AdminHomePage";
import UserManagePage from "./Admin/AdminPages/UserManagePage/UserManagePage";
import AdminChatMonitorPage from "./Admin/AdminPages/AdminChatMonitorPage/AdminChatMonitorPage";
import AdminNotificationPage from "./Admin/AdminPages/AdminNotificationPage/AdminNotificationPage";
import AdminSettingsPage from "./Admin/AdminPages/AdminSettingsPage/AdminSettingsPage";
import PhoneVerification from "./Components/Verification/PhoneVerification";
import ProfileSetup from "./Components/ProfileSetup/ProfileSetup";
import UsersProfile from "./Components/Chats/UsersProfile";
import { Toaster } from "react-hot-toast";
import ForgotPassword from "./Components/Auth/ForgotPassword";
import EditProfileModal from "./Components/Chats/EditProfileModal";

function App() {
  const location = useLocation();

  // Hide sidebar on Auth route
  const hideSidebar =
  location.pathname === "/" ||
  location.pathname.startsWith("/admin") ||  location.pathname === "/phonenumber/verification" || location.pathname === "/profile-setup" || location.pathname === "/forgot-password";


  return (
    <div className="app">
      {!hideSidebar && <Sidebar />}
      
<Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/status" element={<StatusPage />} />
        <Route path="/channels" element={<ChannelPage />} />
        <Route path="/communities" element={<CommunityPage />} />
        <Route path="/contactlist" element={<ContactPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/settings/account" element={<AccountPage />} />
         <Route path="/settings/notifications" element={<NotificationPage />} />
        <Route path="/settings/language" element={<LanguagePage />} /> 
        <Route path="/settings/help" element={<Help />} /> 
          <Route path="/settings/about" element={<About />} /> 
          <Route path="/phonenumber/verification" element={<PhoneVerification />} /> 
          <Route path="/profile-setup" element={<ProfileSetup />} /> 
          <Route path="/user-profile" element={<UsersProfile />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Admin Panel */}
          <Route path="/admin/auth" element={<AdminAuth />} /> 
          <Route path="/admin/home" element={<AdminHomePage />} /> 
          <Route path="/admin/usermanagement" element={<UserManagePage />} /> 
          <Route path="/admin/chatMonitor" element={<AdminChatMonitorPage />} /> 
           <Route path="/admin/notifications" element={<AdminNotificationPage />} />           
           <Route path="/admin/settings" element={<AdminSettingsPage />} />
      </Routes>
    </div>
  );
}

export default App;
