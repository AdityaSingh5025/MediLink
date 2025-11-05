import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { User, Mail, Lock, Eye, EyeOff, UserPlus, AlertCircle, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { setAuthLoading } from "../store/authSlice";
import { authApi } from "../services/authApi";
import zxcvbn from "zxcvbn";

const SignupForm = ({ onSignupSuccess }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const [accountType, setAccountType] = useState("user");
  const dispatch = useDispatch();
  
  const password = watch("password");
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    if (password) {
      const strength = zxcvbn(password);
      setPasswordStrength(strength.score);
    } else {
      setPasswordStrength(0);
    }
  }, [password]);

  const getStrengthColor = () => {
    const colors = {
      0: "#ef4444",
      1: "#f97316", 
      2: "#eab308",
      3: "#84cc16",
      4: "#22c55e"
    };
    return colors[passwordStrength] || "#6b7280";
  };

  const getStrengthText = () => {
    const texts = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
    return texts[passwordStrength] || "";
  };

  const onSubmit = async (data) => {
    dispatch(setAuthLoading(true));
    
    try {
      const payload = {
        name: data.name,
        email: data.email,
        password: data.password,
        accountType: accountType,
      };

      const result = await authApi.signup(payload);

      if (result?.success) {
        toast.success("Account created! Check your email for verification code 📧");
        if (onSignupSuccess) onSignupSuccess(data.email);
      } else {
        toast.error(result?.error || "Signup failed. Please try again.");
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      dispatch(setAuthLoading(false));
    }
  };

  const passwordRequirements = [
    { met: password?.length >= 6, text: "At least 6 characters" },
    { met: /[A-Z]/.test(password), text: "One uppercase letter" },
    { met: /[a-z]/.test(password), text: "One lowercase letter" },
    { met: /[0-9]/.test(password), text: "One number" },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-text">Create Account</h2>
        <p className="text-muted text-sm">
          Join MediLink community today
        </p>
      </div>

      {/* Name Field */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-text flex items-center gap-2">
          <User className="w-4 h-4" />
          Full Name
        </label>
        <motion.div whileTap={{ scale: 0.995 }}>
          <input
            {...register("name", {
              required: "Name is required",
              minLength: {
                value: 2,
                message: "Name must be at least 2 characters",
              },
            })}
            type="text"
            className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-text placeholder-muted focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-200"
            placeholder="John Doe"
          />
        </motion.div>
        {errors.name && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-xs mt-1 flex items-center gap-1"
          >
            <AlertCircle className="w-3 h-3" />
            {errors.name.message}
          </motion.p>
        )}
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
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
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
        
        {/* Password Strength Indicator */}
        {password && (
          <div className="space-y-2">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: i <= passwordStrength ? 1 : 0.3 }}
                  transition={{ duration: 0.3 }}
                  className="h-1 flex-1 rounded-full origin-left"
                  style={{
                    backgroundColor: i <= passwordStrength 
                      ? getStrengthColor() 
                      : '#e5e7eb'
                  }}
                />
              ))}
            </div>
            <p className="text-xs" style={{ color: getStrengthColor() }}>
              {getStrengthText()}
            </p>
            
            {/* Requirements */}
            <div className="space-y-1 mt-2">
              {passwordRequirements.map((req, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-2 text-xs"
                >
                  {req.met ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <X className="w-3 h-3 text-gray-400" />
                  )}
                  <span className={req.met ? "text-green-500" : "text-muted"}>
                    {req.text}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        )}
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

      {/* Account Type */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-text">
          Account Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {["user", "seller"].map((type) => (
            <motion.button
              key={type}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => setAccountType(type)}
              className={`py-2.5 px-4 rounded-lg capitalize font-medium transition-all duration-200 ${
                accountType === type
                  ? "bg-gradient-to-r from-primary to-accent text-white shadow-soft"
                  : "bg-surface border border-border text-muted hover:border-primary hover:text-text"
              }`}
            >
              {type}
            </motion.button>
          ))}
        </div>
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
            Creating Account...
          </>
        ) : (
          <>
            <UserPlus className="w-5 h-5" />
            Create Account
          </>
        )}
      </motion.button>

      {/* Terms */}
      <p className="text-xs text-center text-muted">
        By signing up, you agree to our{" "}
        <a href="#" className="text-primary hover:underline">
          Terms
        </a>{" "}
        and{" "}
        <a href="#" className="text-primary hover:underline">
          Privacy Policy
        </a>
      </p>
    </form>
  );
};

export default SignupForm;