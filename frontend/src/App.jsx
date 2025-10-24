import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./shared/components/layouts/Navbar";
import AuthPage from "./modules/auth/pages/AuthPage";
import { LandingPage } from "./modules/home/pages/LandingPage";
import { Toast } from "./shared/components/ui/Toast";
import { useSelector } from "react-redux";
import { PublicListingPage } from "./modules/listing/pages/ListingPage";
import PrivateRoute from "./core/router/PrivateRoute";
import { DashboardPage } from "./modules/home/pages/Dashboard";
import { RequestsPage } from "./modules/request/pages/RequestPage";
import { ChatPage } from "./modules/chat/pages/Chatpage";
import { LeaderboardPage } from "./modules/leaderboard/pages/LeaderBoardPage";

const App = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return (
    <Router>
      <Toast />
      <Navbar isAuthenticated={isAuthenticated} />
      <main className="pt-10">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/listings" element={<PublicListingPage />} />
           <Route path="/leaderboard" element={<LeaderboardPage/>} />
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
