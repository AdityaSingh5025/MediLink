import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowLeft, CheckCircle, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "../services/authApi";

const VerifyEmailForm = ({ email, onVerifySuccess, onBack }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef([]);

  // OTP expiry countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // Resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (index, value) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (index === 5 && value) {
      const fullOtp = [...newOtp].join("");
      if (fullOtp.length === 6) {
        handleVerify(fullOtp);
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    const newOtp = [...otp];
    
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i];
    }
    
    setOtp(newOtp);
    inputRefs.current[Math.min(pastedData.length, 5)]?.focus();

    // Auto-verify if complete
    if (pastedData.length === 6) {
      handleVerify(pastedData);
    }
  };

  const handleVerify = async (otpCode = null) => {
    const code = otpCode || otp.join("");
    
    if (code.length !== 6) {
      toast.error("Please enter all 6 digits");
      return;
    }

    setIsVerifying(true);

    try {
      const result = await authApi.verifyEmail(email, code);
      
      if (result.success) {
        toast.success("Email verified successfully! 🎉");
        setTimeout(() => {
          onVerifySuccess();
        }, 1000);
      } else {
        toast.error(result.error || "Invalid OTP. Please try again.");
        // Clear OTP on error
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      toast.error("Verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) {
      toast.error(`Please wait ${resendCooldown} seconds before resending`);
      return;
    }

    setIsResending(true);

    try {
      // Trigger signup endpoint again which will resend OTP
      const result = await authApi.signup({ email });
      
      if (result.success) {
        toast.success("New verification code sent! 📧");
        setTimeLeft(300);
        setResendCooldown(60);
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      } else {
        toast.error(result.error || "Failed to resend code");
      }
    } catch (error) {
      toast.error("Failed to resend code");
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      )}

      {/* Header */}
      <div className="text-center space-y-3">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto"
        >
          <Mail className="w-8 h-8 text-white" />
        </motion.div>
        
        <h2 className="text-2xl font-bold text-white">Verify Your Email</h2>
        <p className="text-gray-400 text-sm">
          We've sent a 6-digit code to
        </p>
        <p className="text-purple-400 font-medium">{email}</p>
      </div>

      {/* Timer */}
      <div className="text-center">
        <AnimatePresence mode="wait">
          {timeLeft > 0 ? (
            <motion.p
              key="timer"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="text-sm text-gray-400"
            >
              Code expires in{" "}
              <span className={`font-medium ${timeLeft < 60 ? 'text-red-400' : 'text-purple-400'}`}>
                {formatTime(timeLeft)}
              </span>
            </motion.p>
          ) : (
            <motion.p
              key="expired"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-400"
            >
              Code expired. Please request a new one.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* OTP Inputs */}
      <div className="flex justify-center gap-2">
        {otp.map((digit, index) => (
          <motion.input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            whileFocus={{ scale: 1.05 }}
            className="w-11 h-14 sm:w-12 sm:h-14 text-center text-xl font-bold bg-white/10 border-2 border-white/20 rounded-xl text-white focus:border-purple-400 focus:bg-white/15 outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isVerifying}
          />
        ))}
      </div>

      {/* Verify Button */}
      <motion.button
        onClick={() => handleVerify()}
        disabled={isVerifying || otp.join("").length !== 6}
        whileHover={{ scale: isVerifying ? 1 : 1.02 }}
        whileTap={{ scale: isVerifying ? 1 : 0.98 }}
        className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
      >
        {isVerifying ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Verifying...
          </>
        ) : (
          <>
            <CheckCircle className="w-5 h-5" />
            Verify Email
          </>
        )}
      </motion.button>

      {/* Resend */}
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-400">
          Didn't receive the code?
        </p>
        {resendCooldown > 0 ? (
          <p className="text-gray-500 text-sm">
            Resend available in{" "}
            <span className="text-purple-400 font-medium">
              {resendCooldown}s
            </span>
          </p>
        ) : (
          <motion.button
            onClick={handleResend}
            disabled={isResending}
            whileHover={{ scale: isResending ? 1 : 1.05 }}
            whileTap={{ scale: isResending ? 1 : 0.95 }}
            className="text-purple-400 hover:text-purple-300 font-medium flex items-center gap-2 mx-auto disabled:opacity-50"
          >
            {isResending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Resend Code
              </>
            )}
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailForm;