import React, { useState } from "react";
import { Input } from "../../../../shared/components/ui/Input";
import { Button } from "../../../../shared/components/ui/Button";
import { userProfileApi } from "../service/profileApi";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function DeleteAccountSection({ dispatch, navigate, logout }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async (e) => {
    e.preventDefault();
    setLoading(true);
    const password = e.target.password.value;
    const res = await userProfileApi.deleteAccount({ password });
    setLoading(false);
    if (res.success) {
      toast.success("Account deleted successfully");
      dispatch(logout());
      navigate("/");
    } else toast.error(res.error);
  };

  return (
    <form onSubmit={handleDelete} className="max-w-md mx-auto space-y-4">
      <p className="text-gray-600 text-sm">
        Deleting your account is irreversible. Please confirm your password below to proceed.
      </p>
      <Input type="password" name="password" placeholder="Enter your password" required />
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:opacity-90 text-white"
      >
        {loading ? <Loader2 className="animate-spin" /> : "Delete My Account"}
      </Button>
    </form>
  );
}
