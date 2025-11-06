import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { logout } from "../../../modules/auth/store/authSlice";
import { Heart, Menu, LogIn, LogOut, User, X, ChevronDown } from "lucide-react";

const Navbar = () => {
  const { isAuthenticated, userInfo } = useSelector((state) => state.auth);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Listings", path: "/listings" },
    { name: "Requests", path: "/requests", protected: true },
    { name: "Chat", path: "/chat", protected: true },
    { name: "Leaderboard", path: "/leaderboard" },
    { name: "Dashboard", path: "/dashboard", protected: true },
  ];

  return (
    <nav className={`w-full ${
      isMobile 
        ? 'bg-surface border-b border-border' // Simple background on mobile
        : 'bg-surface/95 backdrop-blur-md border-b border-border' // Blur only on desktop
    } fixed top-0 z-50 shadow-sm`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Simplified animation */}
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-9 h-9 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center shadow-md">
              <Heart className="w-5 h-5 text-white" fill="currentColor" />
            </div>
            <h1 className="text-xl font-bold text-primary">MediLink</h1>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              if (link.protected && !isAuthenticated) return null;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                      isActive
                        ? "text-primary bg-primary/10"
                        : "text-muted hover:text-text hover:bg-surface"
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              );
            })}
          </div>

          {/* Right Side - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            {!isAuthenticated ? (
              <motion.button
                whileHover={!isMobile ? { scale: 1.05 } : {}}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/auth")}
                className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white px-6 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <LogIn size={18} />
                Login
              </motion.button>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface border border-border hover:border-primary transition-colors duration-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                    <User size={18} className="text-white" />
                  </div>
                  <span className="text-sm font-medium text-text">
                    {userInfo?.name || "User"}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      showProfileMenu ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }} // Faster animation
                      className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-lg shadow-xl overflow-hidden"
                    >
                      <button
                        onClick={() => {
                          navigate("/dashboard/profile");
                          setShowProfileMenu(false);
                        }}
                        className="w-full px-4 py-3 text-left text-text hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-2"
                      >
                        <User size={16} />
                        Profile
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 text-left text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-text hover:text-primary transition-colors p-2"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu - Simplified animation */}
      {isMobile && (
        <div
          className={`md:hidden bg-surface border-t border-border transition-all duration-200 ease-out ${
            isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
          }`}
        >
          <div className="px-6 py-4 space-y-2">
            {navLinks.map((link) => {
              if (link.protected && !isAuthenticated) return null;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-3 rounded-lg font-medium transition-colors duration-200 ${
                      isActive
                        ? "text-primary bg-primary/10"
                        : "text-muted hover:text-text hover:bg-background"
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              );
            })}

            {isAuthenticated && (
              <>
                <div className="border-t border-border my-2"></div>
                <button
                  onClick={() => {
                    navigate("/dashboard/profile");
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-3 rounded-lg text-text hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <User size={18} />
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-3 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            )}

            {!isAuthenticated && (
              <button
                onClick={() => {
                  navigate("/auth");
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-lg font-medium shadow-md"
              >
                <LogIn size={18} />
                Login
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;