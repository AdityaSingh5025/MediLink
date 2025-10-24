import React, { useState } from "react";
import { Input } from "../../../../shared/components/ui/Input";
import { Button } from "../../../../shared/components/ui/Button";
import { userProfileApi } from "../service/profileApi";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function PasswordSection() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { oldPassword, newPassword, confirmNewPassword } = e.target;
    const res = await userProfileApi.updatePassword({
      oldPassword: oldPassword.value,
      newPassword: newPassword.value,
      confirmNewPassword: confirmNewPassword.value,
    });
    setLoading(false);
    if (res.success) toast.success("Password updated successfully!");
    else toast.error(res.error);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
      <Input type="password" name="oldPassword" placeholder="Current Password" required />
      <Input type="password" name="newPassword" placeholder="New Password" required />
      <Input type="password" name="confirmNewPassword" placeholder="Confirm New Password" required />
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white"
      >
        {loading ? <Loader2 className="animate-spin" /> : "Update Password"}
      </Button>
    </form>
  );
}
