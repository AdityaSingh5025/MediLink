import React, { useState } from "react";
import { Heart } from "lucide-react";
import LoginForm from "../components/LoginForm";
import VerifyEmailForm from "../components/VerifyForm";
import SignupForm from "../components/SignupForm";

const AuthPage = () => {
  const [activeView, setActiveView] = useState("login"); // "login" | "signup" | "verify"
  const [emailForVerification, setEmailForVerification] = useState("");

  // Switch to email verification view after successful signup
  const handleSignupSuccess = (email) => {
    setEmailForVerification(email);
    setActiveView("verify");
  };

  // Return to login after successful verification
  const handleVerifySuccess = () => {
    setActiveView("login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 text-text">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-glow p-8 text-center">
        {/* Logo and App Title */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center shadow-[0_0_12px_rgba(59,130,246,0.4)]">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-primary">MediLink</h1>
          </div>
        </div>

        {/* Login/Signup Tabs */}
        {activeView !== "verify" && (
          <div className="flex justify-center gap-6 mb-6">
            <button
              onClick={() => setActiveView("login")}
              className={`text-sm font-medium px-5 py-2.5 rounded-full transition-all duration-300 ${
                activeView === "login"
                  ? "bg-gradient-to-r from-primary to-accent text-white shadow-md"
                  : "text-muted hover:text-primary hover:bg-surface"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setActiveView("signup")}
              className={`text-sm font-medium px-5 py-2.5 rounded-full transition-all duration-300 ${
                activeView === "signup"
                  ? "bg-gradient-to-r from-primary to-accent text-white shadow-md"
                  : "text-muted hover:text-primary hover:bg-surface"
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Conditional Rendering for Auth States */}
        {activeView === "login" && <LoginForm />}
        {activeView === "signup" && (
          <SignupForm onSignupSuccess={handleSignupSuccess} />
        )}
        {activeView === "verify" && (
          <VerifyEmailForm
            email={emailForVerification}
            onVerifySuccess={handleVerifySuccess}
          />
        )}

        {/* Footer */}
        <p className="text-[13px] text-muted mt-8">
          Secure authentication powered by industry-standard encryption
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
