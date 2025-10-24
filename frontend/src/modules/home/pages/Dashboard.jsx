import React from "react";
import { NavLink, Routes, Route, Outlet, Navigate } from "react-router-dom";
import { ClipboardList, PlusCircle, User } from "lucide-react";
import { useSelector } from "react-redux";
import { MyListingsPage } from "../../listing/pages/MyListingPage";
import { CreateListingForm } from "../../listing/components/ListingForm";
import  ProfilePage  from "../../auth/profile/pages/ProfilePage";

export const DashboardPage = () => {
  const { userInfo } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-background text-text">
      {/* Header */}
      <header className="bg-surface border-border shadow-soft backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6">
          <div>
            <h1 className="text-2xl font-semibold text-primary">
              Welcome, {userInfo?.name?.split(" ")[0] || "User"} 👋
            </h1>
            <p className="text-sm text-muted">
              Manage your listings, create new donations, and edit your profile.
            </p>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="sticky top-0 z-20 bg-surface/80 border-border backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex justify-center sm:justify-start gap-6 px-4 py-3">
          <NavLink
            to="/dashboard/my-listings"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-primary to-accent text-white shadow-md"
                  : "text-muted hover:text-primary hover:bg-surface/60"
              }`
            }
          >
            <ClipboardList size={16} /> My Listings
          </NavLink>

          <NavLink
            to="/dashboard/create-listing"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-primary to-accent text-white shadow-md"
                  : "text-muted hover:text-primary hover:bg-surface/60"
              }`
            }
          >
            <PlusCircle size={16} /> Create Listing
          </NavLink>

          <NavLink
            to="/dashboard/profile"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-primary to-accent text-white shadow-md"
                  : "text-muted hover:text-primary hover:bg-surface/60"
              }`
            }
          >
            <User size={16} /> My Profile
          </NavLink>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
        <Routes>
          <Route index element={<Navigate to="my-listings" replace />} />
          <Route path="my-listings" element={<MyListingsPage />} />
          <Route path="create-listing" element={<CreateListingForm />} />
          <Route
            path="profile"
            element={
              <div className="text-center text-muted p-10">
              <ProfilePage/>
              </div>
            }
          />
          <Route
            path="*"
            element={
              <div className="text-center text-muted mt-10">
                Page not found.
              </div>
            }
          />
        </Routes>
        <Outlet />
      </main>
    </div>
  );
};
