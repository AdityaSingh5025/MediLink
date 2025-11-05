import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, CheckCircle, Loader2, AlertCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { authApi } from "../services/authApi";

const ResetPasswordForm = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [tokenError, setTokenError] = useState(false);
  const navigate = useNavigate();
  const { token } = useParams();

  const password = watch("newPassword");

  useEffect(() => {
    if (!token) {
      setTokenError(true);
      toast.error("Invalid reset link");
    }
  }, [token]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      const result = await authApi.resetPassword(
        token,
        data.newPassword,
        data.confirmNewPassword
      );

      if (result.success) {
        setResetSuccess(true);
        toast.success("Password reset successful! 🎉");
        setTimeout(() => navigate("/auth"), 3000);
      } else {
        toast.error(result.error || "Failed to reset password");
        if (result.error?.includes("expired") || result.error?.includes("Invalid")) {
          setTokenError(true);
        }
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (tokenError) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto"
        >
          <XCircle className="w-12 h-12 text-red-500" />
        </motion.div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-text">Invalid Reset Link</h2>
          <p className="text-muted text-sm max-w-md mx-auto">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/auth/forgot-password")}
          className="w-full py-3 bg-gradient-to-r from-primary to-accent text-white font-medium rounded-xl transition-all duration-200 shadow-soft"
        >
          Request New Link
        </motion.button>
      </motion.div>
    );
  }

  if (resetSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto"
        >
          <CheckCircle className="w-12 h-12 text-green-500" />
        </motion.div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-text">Password Reset!</h2>
          <p className="text-muted text-sm max-w-md mx-auto">
            Your password has been successfully reset. You can now login with your new password.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/auth")}
          className="w-full py-3 bg-gradient-to-r from-primary to-accent text-white font-medium rounded-xl transition-all duration-200 shadow-soft"
        >
          Go to Login
        </motion.button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-text">Reset Password</h2>
        <p className="text-muted text-sm">
          Enter your new password below
        </p>
      </div>

      {/* New Password Field */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-text flex items-center gap-2">
          <Lock className="w-4 h-4" />
          New Password
        </label>
        <motion.div whileTap={{ scale: 0.995 }} className="relative">
          <input
            {...register("newPassword", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
            type={showPassword ? "text" : "password"}
            autoFocus
            className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-text placeholder-muted focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-200 pr-12"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </motion.div>
        {errors.newPassword && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-xs mt-1 flex items-center gap-1"
          >
            <AlertCircle className="w-3 h-3" />
            {errors.newPassword.message}
          </motion.p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-text flex items-center gap-2">
          <Lock className="w-4 h-4" />
          Confirm New Password
        </label>
        <motion.div whileTap={{ scale: 0.995 }} className="relative">
          <input
            {...register("confirmNewPassword", {
              required: "Please confirm your password",
              validate: (value) =>
                value === password || "Passwords do not match",
            })}
            type={showConfirmPassword ? "text" : "password"}
            className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-text placeholder-muted focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-200 pr-12"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors"
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </motion.div>
        {errors.confirmNewPassword && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-xs mt-1 flex items-center gap-1"
          >
            <AlertCircle className="w-3 h-3" />
            {errors.confirmNewPassword.message}
          </motion.p>
        )}
      </div>

      {/* Password Requirements */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-xs text-muted space-y-2">
        <p className="font-medium text-text">Password must:</p>
        <ul className="list-disc list-inside space-y-1">
          <li className={password?.length >= 6 ? "text-green-500" : ""}>
            Be at least 6 characters long
          </li>
          <li className={password === watch("confirmNewPassword") && password ? "text-green-500" : ""}>
            Match the confirmation password
          </li>
        </ul>
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={isSubmitting}
        whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
        whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
        className="w-full py-3 bg-gradient-to-r from-primary to-accent hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-soft"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Resetting Password...
          </>
        ) : (
          <>
            <CheckCircle className="w-5 h-5" />
            Reset Password
          </>
        )}
      </motion.button>
    </form>
  );
};

export default ResetPasswordForm;