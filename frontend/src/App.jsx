// App.jsx
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { useSelector } from "react-redux";
import Navbar from "./shared/components/layouts/Navbar";
import AuthPage from "./modules/auth/pages/AuthPage";
import { LandingPage } from "./modules/landing/pages/LandingPage";
import { PublicListingPage } from "./modules/listing/pages/ListingPage";
import PrivateRoute from "./core/router/PrivateRoute";
import { DashboardPage } from "./modules/home/pages/Dashboard";
import { RequestsPage } from "./modules/request/pages/RequestPage";
import { ChatPage } from "./modules/chat/pages/Chatpage";
import { LeaderboardPage } from "./modules/leaderboard/pages/LeaderBoardPage";
import ForgotPasswordPage from "./modules/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "./modules/auth/pages/ResetPasswordPage";
import { disconnectSocket } from "./modules/chat/hooks/useChatHook";

const App = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Cleanup socket on app unmount
  useEffect(() => {
    return () => {
      console.log("🧹 App unmounting, cleaning up socket");
      disconnectSocket();
    };
  }, []);

  return (
    <Router>
      {/* Sonner Toast Configuration */}
      <Toaster
        position="top-center"
        expand={false}
        richColors
        closeButton
        toastOptions={{
          style: {
            background: "rgba(15, 23, 42, 0.95)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "#fff",
            fontSize: "14px",
          },
        }}
      />

      <Navbar isAuthenticated={isAuthenticated} />

      <main className="pt-10">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/auth/forgot-password"
            element={<ForgotPasswordPage />}
          />
          <Route
            path="/reset-password/:token"
            element={<ResetPasswordPage />}
          />
          <Route path="/listings" element={<PublicListingPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />

          <Route
            path="/chat"
            element={
              <PrivateRoute>
                <ChatPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/chat/:listingId"
            element={
              <PrivateRoute>
                <ChatPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/requests"
            element={
              <PrivateRoute>
                <RequestsPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/dashboard/*"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </main>
    </Router>
  );
};

export default App;