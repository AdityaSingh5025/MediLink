import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginSuccess, setAuthLoading } from "../store/authSlice";
import { authApi } from "../services/authApi";

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    dispatch(setAuthLoading(true));

    try {
      const result = await authApi.login(data.email, data.password);

      if (result.success) {
        toast.success("Welcome back! 🎉");

        dispatch(
          loginSuccess({
            user: result.data.user,
            accessToken: result.data.accessToken,
          })
        );

        setTimeout(() => navigate("/"), 300);
      } else {
        toast.error(result.error || "Invalid credentials");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      dispatch(setAuthLoading(false));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-text">Welcome Back</h2>
        <p className="text-muted text-sm">
          Sign in to continue to your account
        </p>
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-text flex items-center gap-2">
          <Mail className="w-4 h-4" />
          Email Address
        </label>
        <motion.div whileTap={{ scale: 0.995 }}>
          <input
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
            type="email"
            className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-text placeholder-muted focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-200"
            placeholder="you@example.com"
          />
        </motion.div>
        {errors.email && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-xs mt-1 flex items-center gap-1"
          >
            <AlertCircle className="w-3 h-3" />
            {errors.email.message}
          </motion.p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-text flex items-center gap-2">
          <Lock className="w-4 h-4" />
          Password
        </label>
        <motion.div whileTap={{ scale: 0.995 }} className="relative">
          <input
            {...register("password", {
              required: "Password is required",
            })}
            type={showPassword ? "text" : "password"}
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
        {errors.password && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-xs mt-1 flex items-center gap-1"
          >
            <AlertCircle className="w-3 h-3" />
            {errors.password.message}
          </motion.p>
        )}
      </div>

      {/* Remember & Forgot */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 border-border rounded text-primary focus:ring-primary focus:ring-offset-0"
          />
          <span className="text-sm text-muted">Remember me</span>
        </label>
        <button
          type="button"
          onClick={() => navigate("/auth/forgot-password")} // Add this
          className="text-sm text-primary hover:text-accent transition-colors"
        >
          Forgot Password?
        </button>
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
            Signing in...
          </>
        ) : (
          <>
            <LogIn className="w-5 h-5" />
            Sign In
          </>
        )}
      </motion.button>
    </form>
  );
};

export default LoginForm;
