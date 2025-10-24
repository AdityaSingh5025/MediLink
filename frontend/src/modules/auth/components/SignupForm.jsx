import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { setAuthLoading } from "../store/authSlice";
import { authApi } from "../services/authApi";

const SignupForm = ({ onSignupSuccess }) => {
  const { register, handleSubmit, reset } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const [accountType, setAccountType] = useState("user");
  const dispatch = useDispatch();
  const { authLoading } = useSelector((state) => state.auth);

  // Handle signup form submission
  const onSubmit = async (data) => {
    try {
      dispatch(setAuthLoading(true));

      const payload = {
        name: data.name,
        email: data.email,
        password: data.password,
        accountType: accountType || "user",
      };

      const result = await authApi.signup(payload);

      if (result?.success) {
        toast.success(result.message || "Signup successful! Verify your email.");
        reset();
        if (onSignupSuccess) onSignupSuccess(data.email);
      } else {
        toast.error(result?.message || "Signup failed. Please try again.");
      }
    } catch (err) {
      toast.error(err.message || "Unexpected error occurred.");
    } finally {
      dispatch(setAuthLoading(false));
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 text-text text-left bg-surface border border-border rounded-xl p-8 shadow-glow max-w-md mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-text">Create Account</h2>
        <p className="text-sm text-muted">Join the MediLink community</p>
      </div>

      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium mb-1 text-text">
          Full Name
        </label>
        <input
          {...register("name")}
          type="text"
          placeholder="Enter your full name"
          className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-text placeholder-muted focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all duration-200"
          required
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium mb-1 text-text">Email</label>
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
            placeholder="Create a strong password"
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

      {/* Account Type */}
      <div>
        <label className="block text-sm font-medium mb-1 text-text">
          Account Type
        </label>
        <select
          value={accountType}
          onChange={(e) => setAccountType(e.target.value)}
          className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-text placeholder-muted focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all duration-200"
        >
          <option value="user">User</option>
          <option value="seller">Seller</option>
        </select>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={authLoading}
        className="w-full bg-gradient-to-r from-primary to-accent hover:from-blue-600 hover:to-blue-700 py-2.5 rounded-lg font-medium text-white transition-all duration-200 disabled:opacity-50 shadow-soft"
      >
        {authLoading ? "Creating Account..." : "Sign Up"}
      </button>

      {/* Terms */}
      <p className="text-[13px] text-center text-muted mt-4">
        By signing up, you agree to MediLink’s{" "}
        <a href="#" className="text-primary hover:underline">
          Terms of Service
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
