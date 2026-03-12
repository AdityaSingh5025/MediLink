import React, { useEffect, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { useSelector } from "react-redux";
import Navbar from "./shared/components/layouts/Navbar";
import PrivateRoute from "./core/router/PrivateRoute";
import { disconnectSocket } from "./modules/chat/hooks/useChatHook";
import { Loader2 } from "lucide-react";

const LandingPage = lazy(() => import("./modules/landing/pages/LandingPage").then(m => ({ default: m.LandingPage })));
const AuthPage = lazy(() => import("./modules/auth/pages/AuthPage"));
const PublicListingPage = lazy(() => import("./modules/listing/pages/ListingPage").then(m => ({ default: m.PublicListingPage })));
const DashboardPage = lazy(() => import("./modules/home/pages/Dashboard").then(m => ({ default: m.DashboardPage })));
const RequestsPage = lazy(() => import("./modules/request/pages/RequestPage").then(m => ({ default: m.RequestsPage })));
const ChatPage = lazy(() => import("./modules/chat/pages/Chatpage").then(m => ({ default: m.ChatPage })));
const LeaderboardPage = lazy(() => import("./modules/leaderboard/pages/LeaderBoardPage").then(m => ({ default: m.LeaderboardPage })));
const ForgotPasswordPage = lazy(() => import("./modules/auth/pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./modules/auth/pages/ResetPasswordPage"));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <Loader2 className="w-10 h-10 text-primary animate-spin" />
  </div>
);

const App = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    return () => {
      disconnectSocket();
    };
  }, []);

  return (
    <Router>
      <Toaster
        position="top-right"
        expand={false}
        richColors
        closeButton
        duration={2500}
        offset="80px"
        toastOptions={{
          style: {
            background: "rgba(15, 23, 42, 0.95)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "#fff",
            fontSize: "14px",
            width: "var(--toast-width, 356px)",
          },
        }}
      />

      <Navbar isAuthenticated={isAuthenticated} />

      <main className="pt-16 sm:pt-20">
        <Suspense fallback={<PageLoader />}>
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
        </Suspense>
      </main>
    </Router>
  );
};

export default App;