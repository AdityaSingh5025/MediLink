import React, { useEffect, useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { authApi } from "../services/authApi";
import { useNavigate } from "react-router-dom";

const VerifyEmailForm = ({ email, onVerifySuccess }) => {
  const navigate = useNavigate();
  const {
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: { otp: ["", "", "", "", "", ""] },
  });

  const otp = watch("otp");
  const inputRefs = useRef([]);
  const [timeLeft, setTimeLeft] = useState(300); // OTP validity timer (5 minutes)
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Countdown for OTP expiration
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Countdown for resend button
  useEffect(() => {
    if (resendTimer <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [resendTimer]);

  // Handle OTP input behavior
  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setValue("otp", newOtp);
    if (value && index < 5) inputRefs.current[index + 1].focus();
  };

  // Handle backspace navigation
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Format seconds into mm:ss
  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  // Handle form submission
  const onSubmit = async (data) => {
    const code = data.otp.join("");
    if (code.length !== 6) {
      toast.error("Please enter all 6 digits");
      return;
    }

    const result = await authApi.verifyEmail(email, code);
    if (result.success) {
      toast.success("Email verified successfully!");
      reset();
      onVerifySuccess();
      navigate("/auth");
    } else {
      toast.error(result.error);
    }
  };

  // Handle resend OTP action
  const handleResend = () => {
    toast.success("Verification code resent!");
    setCanResend(false);
    setResendTimer(60);
    setTimeLeft(300);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-text px-4">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-glow p-8 text-center">
        {/* Header */}
        <div className="flex items-center justify-center mb-6">
          <img src="/logo.svg" alt="MediLink Logo" className="h-10 w-10 mr-2" />
          <h1 className="text-2xl font-semibold text-primary">MediLink</h1>
        </div>

        <h2 className="text-xl font-semibold mb-1 text-text">Verify Your Email</h2>
        <p className="text-sm text-muted mb-3">We’ve sent a 6-digit verification code to</p>
        <p className="font-medium text-primary mb-6">{email}</p>

        {/* Countdown timer */}
        <p className="text-sm text-muted mb-6">
          Code expires in{" "}
          <span className="text-primary font-medium">{formatTime(timeLeft)}</span>
        </p>

        {/* OTP input fields */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex justify-center gap-2 mb-6">
            {otp.map((digit, index) => (
              <Controller
                key={index}
                name={`otp.${index}`}
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength={1}
                    value={field.value || ""}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-10 h-12 text-center text-lg font-medium bg-surface border border-border text-text rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all"
                  />
                )}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-primary to-accent hover:from-blue-600 hover:to-blue-700 py-2.5 rounded-lg font-medium text-white transition-all duration-200 disabled:opacity-50 shadow-soft"
          >
            {isSubmitting ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        {/* Resend section */}
        <div className="mt-6 text-sm text-muted">
          <p>Didn’t receive the code?</p>
          {canResend ? (
            <button
              onClick={handleResend}
              className="text-primary hover:underline mt-1"
            >
              Resend Code
            </button>
          ) : (
            <p className="mt-1 text-muted">
              Resend in{" "}
              <span className="text-primary font-medium">
                {formatTime(resendTimer)}
              </span>
            </p>
          )}
        </div>

        {/* Demo information */}
        <p className="text-[13px] text-muted mt-6">
          For demo purposes, use code:{" "}
          <span className="text-primary font-semibold">123456</span>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmailForm;
