import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Shield, Users, Zap } from "lucide-react";
import LoginForm from "../components/LoginForm";
import SignupForm from "../components/SignupForm";
import VerifyEmailForm from "../components/VerifyForm";

const AuthPage = () => {
  const [activeView, setActiveView] = useState("login");
  const [emailForVerification, setEmailForVerification] = useState("");

  const handleSignupSuccess = (email) => {
    setEmailForVerification(email);
    setActiveView("verify");
  };

  const handleVerifySuccess = () => {
    setActiveView("login");
  };

  const features = [
    { icon: Shield, text: "Secure & Encrypted", color: "from-blue-500 to-cyan-500" },
    { icon: Users, text: "Join 10K+ Users", color: "from-purple-500 to-pink-500" },
    { icon: Zap, text: "Lightning Fast", color: "from-yellow-500 to-orange-500" },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Subtle animated background effects */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side - Branding */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden lg:block text-text space-y-8"
          >
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-14 h-14 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.4)]"
              >
                <Heart className="w-7 h-7 text-white" fill="currentColor" />
              </motion.div>
              <h1 className="text-4xl font-bold text-primary">
                MediLink
              </h1>
            </div>
            
            <div className="space-y-3">
              <h2 className="text-3xl font-semibold text-text">
                Your Health, <span className="text-primary">Connected</span>
              </h2>
              <p className="text-muted text-lg leading-relaxed">
                Join thousands of users who trust MediLink for secure medical record management and seamless healthcare connectivity.
              </p>
            </div>

            <div className="space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 + 0.6 }}
                  className="flex items-center gap-3"
                >
                  <div className={`w-10 h-10 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center shadow-lg`}>
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-text font-medium">{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Side - Auth Forms */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md mx-auto"
          >
            <div className="bg-surface border border-border rounded-2xl shadow-glow overflow-hidden">
              {/* Mobile Logo */}
              <div className="lg:hidden p-6 border-b border-border">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center shadow-[0_0_12px_rgba(59,130,246,0.4)]">
                    <Heart className="w-5 h-5 text-white" fill="currentColor" />
                  </div>
                  <h1 className="text-2xl font-bold text-primary">MediLink</h1>
                </div>
              </div>

              {/* Auth Tabs */}
              {activeView !== "verify" && (
                <div className="flex border-b border-border">
                  <motion.button
                    onClick={() => setActiveView("login")}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex-1 py-4 px-6 text-sm font-medium transition-all duration-300 ${
                      activeView === "login"
                        ? "text-white bg-gradient-to-r from-primary to-accent border-b-2 border-primary"
                        : "text-muted hover:text-text hover:bg-surface"
                    }`}
                  >
                    Sign In
                  </motion.button>
                  <motion.button
                    onClick={() => setActiveView("signup")}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex-1 py-4 px-6 text-sm font-medium transition-all duration-300 ${
                      activeView === "signup"
                        ? "text-white bg-gradient-to-r from-primary to-accent border-b-2 border-primary"
                        : "text-muted hover:text-text hover:bg-surface"
                    }`}
                  >
                    Create Account
                  </motion.button>
                </div>
              )}

              {/* Form Container */}
              <div className="p-8">
                <AnimatePresence mode="wait">
                  {activeView === "login" && (
                    <motion.div
                      key="login"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <LoginForm />
                    </motion.div>
                  )}
                  
                  {activeView === "signup" && (
                    <motion.div
                      key="signup"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <SignupForm onSignupSuccess={handleSignupSuccess} />
                    </motion.div>
                  )}
                  
                  {activeView === "verify" && (
                    <motion.div
                      key="verify"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                    >
                      <VerifyEmailForm
                        email={emailForVerification}
                        onVerifySuccess={handleVerifySuccess}
                        onBack={() => setActiveView("signup")}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-border bg-surface">
                <p className="text-xs text-center text-muted">
                  🔒 Secure authentication powered by industry-standard encryption
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;