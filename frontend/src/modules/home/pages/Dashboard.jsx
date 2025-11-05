import React, { useState } from "react";
import {
  NavLink,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList,
  PlusCircle,
  User,
  Sparkles,
  TrendingUp,
  Package,
  Menu,
  X,
  Heart,
  Clock,
  CheckCircle,
} from "lucide-react";
import { useSelector } from "react-redux";
import { MyListingsPage } from "../../listing/pages/MyListingPage";
import { CreateListingPage } from "../../listing/pages/CreateListingPage";
import ProfilePage from "../../auth/profile/pages/ProfilePage";

export const DashboardPage = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { myListing } = useSelector((state) => state.listing);
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const stats = [
    {
      label: "Total Items",
      value: myListing?.length || 0,
      icon: Package,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Available",
      value: myListing?.filter((l) => l.status === "available").length || 0,
      icon: CheckCircle,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Donated",
      value: myListing?.filter((l) => l.status === "donated").length || 0,
      icon: Heart,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "Reserved",
      value: myListing?.filter((l) => l.status === "reserved").length || 0,
      icon: Clock,
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-500/10",
    },
  ];

  const navLinks = [
    {
      to: "/dashboard/my-listings",
      icon: ClipboardList,
      label: "My Listings",
      description: "View & manage your items",
    },
    {
      to: "/dashboard/create-listing",
      icon: PlusCircle,
      label: "Create New",
      description: "Add a new donation",
    },
    {
      to: "/dashboard/profile",
      icon: User,
      label: "Profile",
      description: "Edit your information",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface/20 to-background">
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-primary/30 to-accent/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.15, 0.25, 0.15],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-accent/30 to-primary/30 rounded-full blur-3xl"
        />
      </div>

      {/* Header - NOT FIXED */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface/50 backdrop-blur-xl border-b border-border/50 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Greeting Section */}
          <div className="flex items-center justify-between mb-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  {getGreeting()}, {userInfo?.name?.split(" ")[0] || "User"}!
                </span>
              </h1>
              <p className="text-sm text-muted mt-1">
                Welcome back to your dashboard 🎉
              </p>
            </motion.div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-background/50 rounded-xl transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-text" />
              ) : (
                <Menu className="w-6 h-6 text-text" />
              )}
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="relative overflow-hidden bg-gradient-to-br from-surface/80 to-background/80 backdrop-blur-sm border border-border/50 rounded-2xl p-4 sm:p-6 shadow-soft hover:shadow-xl transition-all duration-300 group"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm text-muted mb-1 font-medium">
                      {stat.label}
                    </p>
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <stat.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                </div>

                {/* Animated Background on Hover */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  className={`absolute inset-0 ${stat.bgColor} -z-10 blur-xl`}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Desktop Navigation */}
      <div className="hidden lg:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-3 gap-4">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <NavLink key={link.to} to={link.to}>
                <motion.div
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative overflow-hidden rounded-2xl p-6 transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-br from-primary to-accent text-white shadow-2xl"
                      : "bg-surface/50 backdrop-blur-sm border border-border/50 hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                        isActive ? "bg-white/20" : "bg-primary/10"
                      }`}
                    >
                      <link.icon
                        className={`w-7 h-7 ${
                          isActive ? "text-white" : "text-primary"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`text-lg font-semibold mb-1 ${
                          isActive ? "text-white" : "text-text"
                        }`}
                      >
                        {link.label}
                      </h3>
                      <p
                        className={`text-sm ${
                          isActive ? "text-white/80" : "text-muted"
                        }`}
                      >
                        {link.description}
                      </p>
                    </div>
                  </div>

                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute inset-0 bg-gradient-to-br from-primary to-accent -z-10"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />
                  )}
                </motion.div>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-surface/95 backdrop-blur-xl border-b border-border/50 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
              {navLinks.map((link, index) => {
                const isActive = location.pathname === link.to;
                return (
                  <motion.div
                    key={link.to}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <NavLink
                      to={link.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg"
                          : "bg-background/50 hover:bg-background"
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          isActive ? "bg-white/20" : "bg-primary/10"
                        }`}
                      >
                        <link.icon
                          className={`w-6 h-6 ${
                            isActive ? "text-white" : "text-primary"
                          }`}
                        />
                      </div>
                      <div>
                        <h3
                          className={`font-semibold ${
                            isActive ? "text-white" : "text-text"
                          }`}
                        >
                          {link.label}
                        </h3>
                        <p
                          className={`text-xs ${
                            isActive ? "text-white/80" : "text-muted"
                          }`}
                        >
                          {link.description}
                        </p>
                      </div>
                    </NavLink>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Routes>
              <Route index element={<Navigate to="my-listings" replace />} />
              <Route path="my-listings" element={<MyListingsPage />} />
              <Route path="create-listing" element={<CreateListingPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};
