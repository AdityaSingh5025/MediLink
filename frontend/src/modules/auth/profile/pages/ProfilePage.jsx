import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Lock, Trash2, Loader2, Shield } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  setProfileData,
  setProfileLoading,
  logout,
} from "../../../auth/store/authSlice";
import { userProfileApi } from "../service/profileApi";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import ProfileForm from "../components/ProfileFrom";
import PasswordSection from "../components/PasswordChange";
import DeleteAccountSection from "../components/DeleteAccount";

export default function ProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [profileData, setProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoadingProfile(true);
    dispatch(setProfileLoading(true));
    try {
      const response = await userProfileApi.getUserDetails();
      if (response.success && response.data) {
        dispatch(setProfileData(response.data));
        setProfile(response.data);
      } else {
        setProfile(null);
      }
    } catch (error) {
      toast.error("Failed to load profile");
      setProfile(null);
    } finally {
      setIsLoadingProfile(false);
      dispatch(setProfileLoading(false));
    }
  };

  const tabs = [
    {
      id: "profile",
      label: "Profile",
      icon: User,
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "password",
      label: "Security",
      icon: Lock,
      color: "from-purple-500 to-pink-500",
    },
    {
      id: "danger",
      label: "Danger Zone",
      icon: Trash2,
      color: "from-red-500 to-orange-500",
    },
  ];

  if (isLoadingProfile) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background px-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-6 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.2, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
          }}
          className="absolute top-10 sm:top-20 right-10 sm:right-20 w-48 h-48 sm:w-96 sm:h-96 bg-primary/20 rounded-full blur-[80px] sm:blur-[100px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
          }}
          className="absolute bottom-10 sm:bottom-20 left-10 sm:left-20 w-48 h-48 sm:w-96 sm:h-96 bg-accent/20 rounded-full blur-[80px] sm:blur-[100px]"
        />
      </div>

      <div className="max-w-5xl mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-12"
        >
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text mb-2">
            Account Settings
          </h1>
          <p className="text-sm sm:text-base text-muted">
            Manage your profile and preferences
          </p>
        </motion.div>

        {/* Tabs - Mobile Scrollable */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 sm:mb-8 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          <div className="flex sm:justify-center gap-2 sm:gap-4 min-w-max sm:min-w-0">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 text-sm sm:text-base whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-white shadow-lg"
                    : "text-muted bg-surface border border-border hover:border-primary"
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className={`absolute inset-0 bg-gradient-to-r ${tab.color} rounded-xl`}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <tab.icon className="w-4 h-4 sm:w-5 sm:h-5 relative z-10" />
                <span className="relative z-10 hidden sm:inline">
                  {tab.label}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-surface border border-border rounded-xl sm:rounded-2xl shadow-xl overflow-hidden"
          >
            {activeTab === "profile" && (
              <div className="p-4 sm:p-6 lg:p-8">
                <div className="flex items-center gap-3 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-border">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-text">
                      Profile Information
                    </h2>
                    <p className="text-xs sm:text-sm text-muted">
                      Update your personal details
                    </p>
                  </div>
                </div>
                <ProfileForm
                  userInfo={userInfo}
                  profileData={profileData}
                  refreshProfile={fetchProfile}
                />
              </div>
            )}

            {activeTab === "password" && (
              <div className="p-4 sm:p-6 lg:p-8">
                <div className="flex items-center gap-3 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-border">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-text">
                      Change Password
                    </h2>
                    <p className="text-xs sm:text-sm text-muted">
                      Keep your account secure
                    </p>
                  </div>
                </div>
                <PasswordSection />
              </div>
            )}

            {activeTab === "danger" && (
              <div className="p-4 sm:p-6 lg:p-8">
                <div className="flex items-center gap-3 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-border">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Trash2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-text">
                      Danger Zone
                    </h2>
                    <p className="text-xs sm:text-sm text-muted">
                      Irreversible actions
                    </p>
                  </div>
                </div>
                <DeleteAccountSection
                  dispatch={dispatch}
                  navigate={navigate}
                  logout={logout}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
