import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Loader2, Eye, EyeOff } from "lucide-react";
import { userProfileApi } from "../service/profileApi";
import { toast } from "sonner";

export default function DeleteAccountSection({ dispatch, navigate, logout }) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleDelete = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await userProfileApi.deleteAccount({ password });
    setLoading(false);

    if (res.success) {
      toast.success("Account deleted successfully");
      dispatch(logout());
      navigate("/");
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6 px-4 sm:px-0">
      <div className="bg-red-500/10 border-2 border-red-500/20 rounded-xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
          </div>
          <div className="flex-1 w-full">
            <h3 className="text-base sm:text-lg font-semibold text-text mb-2">
              Delete Account
            </h3>
            <p className="text-xs sm:text-sm text-muted mb-4">
              Once you delete your account, there is no going back. All your
              data including profile, listings, and messages will be permanently
              deleted.
            </p>

            {!showConfirm ? (
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowConfirm(true)}
                className="w-full sm:w-auto px-4 sm:px-6 py-2.5 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors text-sm sm:text-base"
              >
                I want to delete my account
              </motion.button>
            ) : (
              <AnimatePresence>
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleDelete}
                  className="space-y-4 mt-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Enter your password to confirm
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-background border border-border rounded-xl text-text text-sm sm:text-base focus:border-red-500 focus:outline-none transition-all pr-12"
                        placeholder="Enter your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-red-600 transition-colors text-sm sm:text-base"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        "Yes, Delete My Account"
                      )}
                    </motion.button>

                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setShowConfirm(false);
                        setPassword("");
                      }}
                      disabled={loading}
                      className="px-4 sm:px-6 py-3 bg-surface border border-border text-text rounded-xl font-medium hover:bg-background transition-all text-sm sm:text-base"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </motion.form>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
