import React, { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Shield, Check, X } from "lucide-react";
import { userProfileApi } from "../service/profileApi";
import { toast } from "sonner";

export default function PasswordSection() {
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const passwordRequirements = [
    { met: passwords.newPassword.length >= 6, text: "At least 6 characters" },
    { met: /[A-Z]/.test(passwords.newPassword), text: "One uppercase letter" },
    { met: /[a-z]/.test(passwords.newPassword), text: "One lowercase letter" },
    { met: /[0-9]/.test(passwords.newPassword), text: "One number" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passwords.newPassword !== passwords.confirmNewPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    const res = await userProfileApi.updatePassword(passwords);
    setLoading(false);

    if (res.success) {
      toast.success("Password updated successfully!");
      setPasswords({
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    } else {
      toast.error(res.error);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onSubmit={handleSubmit}
      className="max-w-md mx-auto space-y-6"
    >
      {/* Old Password */}
      <div>
        <label className="block text-sm font-medium text-text mb-2">
          Current Password
        </label>
        <div className="relative">
          <input
            type={showPasswords.old ? "text" : "password"}
            value={passwords.oldPassword}
            onChange={(e) =>
              setPasswords({ ...passwords, oldPassword: e.target.value })
            }
            className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text focus:border-primary focus:outline-none transition-all pr-12"
            placeholder="Enter current password"
            required
          />
          <button
            type="button"
            onClick={() =>
              setShowPasswords({ ...showPasswords, old: !showPasswords.old })
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text"
          >
            {showPasswords.old ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      {/* New Password */}
      <div>
        <label className="block text-sm font-medium text-text mb-2">
          New Password
        </label>
        <div className="relative">
          <input
            type={showPasswords.new ? "text" : "password"}
            value={passwords.newPassword}
            onChange={(e) =>
              setPasswords({ ...passwords, newPassword: e.target.value })
            }
            className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text focus:border-primary focus:outline-none transition-all pr-12"
            placeholder="Enter new password"
            required
          />
          <button
            type="button"
            onClick={() =>
              setShowPasswords({ ...showPasswords, new: !showPasswords.new })
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text"
          >
            {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* Password Requirements */}
        {passwords.newPassword && (
          <div className="mt-3 space-y-2">
            {passwordRequirements.map((req, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                {req.met ? (
                  <Check className="w-3 h-3 text-green-500" />
                ) : (
                  <X className="w-3 h-3 text-gray-500" />
                )}
                <span className={req.met ? "text-green-500" : "text-muted"}>
                  {req.text}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-sm font-medium text-text mb-2">
          Confirm New Password
        </label>
        <div className="relative">
          <input
            type={showPasswords.confirm ? "text" : "password"}
            value={passwords.confirmNewPassword}
            onChange={(e) =>
              setPasswords({
                ...passwords,
                confirmNewPassword: e.target.value,
              })
            }
            className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text focus:border-primary focus:outline-none transition-all pr-12"
            placeholder="Confirm new password"
            required
          />
          <button
            type="button"
            onClick={() =>
              setShowPasswords({
                ...showPasswords,
                confirm: !showPasswords.confirm,
              })
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text"
          >
            {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      <motion.button
        type="submit"
        disabled={loading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Shield className="w-5 h-5" />
        )}
        {loading ? "Updating..." : "Update Password"}
      </motion.button>
    </motion.form>
  );
}
