import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import {
  Mail,
  ArrowLeft,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { authApi } from "../services/authApi";

const ForgotPasswordForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      const result = await authApi.forgotPassword(data.email);

      if (result.success) {
        setEmailSent(true);
        toast.success("Password reset link sent to your email! 📧");
      } else {
        toast.error(result.error || "Failed to send reset link");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (emailSent) {
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
          <h2 className="text-2xl font-bold text-text">Check Your Email</h2>
          <p className="text-muted text-sm max-w-md mx-auto">
            We've sent a password reset link to your email address. Please check
            your inbox and follow the instructions.
          </p>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm text-muted">
          <p className="mb-2">Didn't receive the email?</p>
          <ul className="list-disc list-inside text-left space-y-1 text-xs">
            <li>Check your spam/junk folder</li>
            <li>Make sure the email address is correct</li>
            <li>Wait a few minutes for the email to arrive</li>
          </ul>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/auth")}
          className="w-full py-3 bg-gradient-to-r from-primary to-accent text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-soft"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Login
        </motion.button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-text">Forgot Password?</h2>
        <p className="text-muted text-sm">
          Enter your email and we'll send you a reset link
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
            autoFocus
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
            Sending...
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Send Reset Link
          </>
        )}
      </motion.button>

      {/* Back to Login */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate("/auth")}
        className="w-full py-3 bg-surface border border-border text-text font-medium rounded-xl hover:bg-background transition-all duration-200 flex items-center justify-center gap-2"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Login
      </motion.button>
    </form>
  );
};

export default ForgotPasswordForm;
