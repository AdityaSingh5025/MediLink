import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginSuccess, setAuthLoading } from "../store/authSlice";
import { authApi } from "../services/authApi";

const LoginForm = () => {
  const { register, handleSubmit } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { authLoading } = useSelector((state) => state.auth);

  // Handle login form submission
  const onSubmit = async (data) => {
    dispatch(setAuthLoading(true));
    const result = await authApi.login(data.email, data.password);

    if (result.success) {
      dispatch(
        loginSuccess({
          user: result.data.user,
          accessToken: result.data.accessToken,
        })
      );
      toast.success("Login successful!");
      navigate("/");
    } else {
      toast.error(result.error || "Login failed");
    }

    dispatch(setAuthLoading(false));
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 text-text text-left bg-surface border border-border rounded-xl p-8 shadow-glow max-w-md mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-text">Welcome Back</h2>
        <p className="text-sm text-muted">Sign in to your MediLink account</p>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium mb-1 text-text">
          Email
        </label>
        <input
          {...register("email")}
          type="email"
          placeholder="Enter your email"
          className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-text placeholder-muted focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all duration-200"
          required
        />
      </div>

      {/* Password with toggle */}
      <div>
        <label className="block text-sm font-medium mb-1 text-text">
          Password
        </label>
        <div className="relative">
          <input
            {...register("password")}
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-text placeholder-muted focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all duration-200"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-muted hover:text-text transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* Forgot Password link */}
      <div className="text-right">
        <button
          type="button"
          className="text-sm text-primary hover:underline focus:outline-none"
        >
          Forgot your password?
        </button>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={authLoading}
        className="w-full bg-gradient-to-r from-primary to-accent hover:from-blue-600 hover:to-blue-700 py-2.5 rounded-lg font-medium text-white transition-all duration-200 disabled:opacity-50 shadow-soft"
      >
        {authLoading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
};

export default LoginForm;
