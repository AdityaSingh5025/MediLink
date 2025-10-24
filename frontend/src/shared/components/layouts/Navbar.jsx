import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../../modules/auth/store/authSlice";

import {
  Heart,
  Menu,
  LogIn,
  LogOut,
  User,
  Package,
  FileText,
  MessageCircle,
  Trophy,
  X,
} from "lucide-react";

const Navbar = () => {
  const { isAuthenticated, userInfo } = useSelector((state) => state.auth);

  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <nav className="w-full bg-[#0A0F2C]/95 backdrop-blur-md border-b border-gray-800 fixed top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-blue-400">MediLink</h1>
        </div>

        {/* Desktop Nav Links */}
        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-6 text-gray-300">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `hover:text-blue-400 transition ${
                isActive ? "text-blue-400 font-semibold" : ""
              }`
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/listings"
            className={({ isActive }) =>
              `hover:text-blue-400 transition ${
                isActive ? "text-blue-400 font-semibold" : ""
              }`
            }
          >
            Listings
          </NavLink>

          <NavLink
            to="/requests"
            className={({ isActive }) =>
              `hover:text-blue-400 transition ${
                isActive ? "text-blue-400 font-semibold" : ""
              }`
            }
          >
            Requests
          </NavLink>

          <NavLink
            to="/chat"
            className={({ isActive }) =>
              `hover:text-blue-400 transition ${
                isActive ? "text-blue-400 font-semibold" : ""
              }`
            }
          >
            Chat
          </NavLink>

          <NavLink
            to="/leaderboard"
            className={({ isActive }) =>
              `hover:text-blue-400 transition ${
                isActive ? "text-blue-400 font-semibold" : ""
              }`
            }
          >
            Leaderboard
          </NavLink>

          {/* ✅ Dashboard only visible if logged in */}
          {isAuthenticated && (
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `hover:text-blue-400 transition ${
                  isActive ? "text-blue-400 font-semibold" : ""
                }`
              }
            >
              Dashboard
            </NavLink>
          )}
        </div>

        {/* Right Side */}
        <div className="hidden md:flex items-center gap-4">
          {!isAuthenticated ? (
            <button
              onClick={() => navigate("/auth")}
              className="flex items-center gap-2 border border-blue-500 text-blue-400 hover:bg-blue-600 hover:text-white px-4 py-1.5 rounded-lg transition"
            >
              <LogIn size={16} />
              Login
            </button>
          ) : (
            <>
            <NavLink to={'/dashboard/profile'}>
              <div className="flex items-center gap-2 text-gray-300">
                <User size={18} className="text-blue-400" />
                <span className="text-sm">
                  {userInfo?.name || userInfo?.fullName || "User"}
                </span>
              </div>
            </NavLink>
              

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-400 hover:text-red-500 transition"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-gray-300 hover:text-blue-400 transition"
        >
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#101935] border-t border-gray-800 px-6 py-4 space-y-3 text-gray-300">
          <NavLink
            to="/"
            onClick={() => setIsMenuOpen(false)}
            className="block hover:text-blue-400 transition"
          >
            Home
          </NavLink>

          {isAuthenticated ? (
            <>
              <NavLink
                to="/dashboard"
                onClick={() => setIsMenuOpen(false)}
                className="block hover:text-blue-400 transition"
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/listings"
                onClick={() => setIsMenuOpen(false)}
                className="block hover:text-blue-400 transition"
              >
                Listings
              </NavLink>
              <NavLink
                to="/requests"
                onClick={() => setIsMenuOpen(false)}
                className="block hover:text-blue-400 transition"
              >
                Requests
              </NavLink>
              <NavLink
                to="/chat"
                onClick={() => setIsMenuOpen(false)}
                className="block hover:text-blue-400 transition"
              >
                Chat
              </NavLink>
              <NavLink
                to="/leaderboard"
                onClick={() => setIsMenuOpen(false)}
                className="block hover:text-blue-400 transition"
              >
                Leaderboard
              </NavLink>

              <div className="border-t border-gray-700 my-2"></div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 text-red-400 hover:text-red-500 transition"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                navigate("/auth");
                setIsMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 border border-blue-500 text-blue-400 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-lg transition"
            >
              <LogIn size={16} />
              Login
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
