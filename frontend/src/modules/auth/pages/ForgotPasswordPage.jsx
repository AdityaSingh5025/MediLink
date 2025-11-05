import React from "react";
import { motion } from "framer-motion";
import ForgotPasswordForm from "../components/ForgotPasswordForm";

const ForgotPasswordPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-surface/30 to-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-surface border border-border rounded-2xl shadow-2xl p-8">
          <ForgotPasswordForm />
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;