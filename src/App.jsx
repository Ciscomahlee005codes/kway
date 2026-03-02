import { Route, Routes, useLocation } from "react-router-dom";
import { UserAuth } from "./Context/AuthContext";
import Sidebar from "./Components/Sidebar/Sidebar";
import StatusPage from "./Pages/StatusPage/StatusPage";
import ChatPage from "./Pages/ChatPage/ChatPage";
import ChannelPage from "./Pages/ChannelPage/ChannelPage";
import LinkUp from "./Components/ContactList/LinkUp";
import ProfilePage from "./Pages/ProfilePage/ProfilePage";
import SettingsPage from "./Pages/SettingsPage/SettingsPage";
import Auth from "./Components/Auth/Auth";
import AccountPage from "./Pages/AccountPage/AccountPage";
import NotificationPage from "./Components/NotificationPage/NotificationPage";
import LanguagePage from "./Components/LanguagePage/LanguagePage";
import Help from "./Components/Help/Help";
import About from "./Components/About/About";
import AdminAuth from "./Admin/AdminAuth/AdminAuth";
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
import ProfileView from "./Components/ContactList/ProfileView";
import Chats from "./Components/Chats/Chats";
import AuthCallback from "./Components/Auth/AuthCallback";
import AdminProtectedRoute from "./Admin/AdminAuth/AdminProtectedRoute";
import ProtectedRoute from "./Components/Auth/ProtectedRoute";
import KwayChatStats from "./Admin/AdminChart/KwayChatStats";
import AdminChartPage from "./Admin/AdminPages/AdminChartPage/AdminChartPage";
import AdminTestPage from "./Admin/AdminPages/AdminTestPage/AdminTestPage";
import ResetPassword from "./Components/Auth/ResetPassword";
import GroupPage from "./Pages/GroupPage/GroupPage";

function App() {
  const location = useLocation();
  const { session } = UserAuth();

  // ✅ Hide sidebar if:
  // - Not logged in
  // - On auth page
  // - On admin pages
  // - On special standalone pages
  const hideSidebar =
    !session ||
    location.pathname === "/" ||
    location.pathname.startsWith("/admin") ||
    location.pathname === "/phonenumber/verification" ||
    location.pathname === "/profile-setup" ||
    location.pathname === "/forgot-password" ||
    location.pathname === "/reset-password";

  return (
    <div className="app">
      {!hideSidebar && <Sidebar />}

      <Toaster position="top-right" reverseOrder={false} />

      <Routes>
        {/* ================= AUTH ================= */}
        <Route path="/" element={<Auth />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* ================= PROTECTED USER ROUTES ================= */}
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat/:id"
          element={
            <ProtectedRoute>
              <Chats />
            </ProtectedRoute>
          }
        />

        <Route
          path="/status"
          element={
            <ProtectedRoute>
              <StatusPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/channels"
          element={
            <ProtectedRoute>
              <ChannelPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/groups"
          element={
            <ProtectedRoute>
              <GroupPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/linkup"
          element={
            <ProtectedRoute>
              <LinkUp />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/:id"
          element={
            <ProtectedRoute>
              <ProfileView />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user-profile/:id"
          element={
            <ProtectedRoute>
              <UsersProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings/account"
          element={
            <ProtectedRoute>
              <AccountPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings/notifications"
          element={
            <ProtectedRoute>
              <NotificationPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings/language"
          element={
            <ProtectedRoute>
              <LanguagePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings/help"
          element={
            <ProtectedRoute>
              <Help />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings/about"
          element={
            <ProtectedRoute>
              <About />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile-setup"
          element={
            <ProtectedRoute>
              <ProfileSetup />
            </ProtectedRoute>
          }
        />
      <Route path="/reset-password" element={<ResetPassword />} />

        <Route
          path="/phonenumber/verification"
          element={
            <ProtectedRoute>
              <PhoneVerification />
            </ProtectedRoute>
          }
        />

        {/* ================= ADMIN PANEL ================= */}
        <Route path="/admin/auth" element={<AdminAuth />} />

        <Route
          path="/admin/home"
          element={
            <ProtectedRoute>
              <AdminHomePage />
            </ProtectedRoute>
          }
        />

        <Route path="/admin/usermanagement" element={
          <ProtectedRoute>
            <UserManagePage />
          </ProtectedRoute>
        } />
        <Route path="/admin/chatMonitor" element={
          <ProtectedRoute><AdminChatMonitorPage /></ProtectedRoute>
        } />
         <Route path="/admin/chatStats" element={
          <ProtectedRoute><AdminChartPage /></ProtectedRoute>
         } />
        <Route path="/admin/notifications" element={
          <ProtectedRoute><AdminNotificationPage /></ProtectedRoute>
        } />
        <Route path="/admin/settings" element={
          <ProtectedRoute><AdminSettingsPage /></ProtectedRoute>
        } />
         <Route path="/admin/testimonials" element={
          <ProtectedRoute><AdminTestPage /></ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}

export default App;