import React, { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../../shared/components/ui/Tabs";
import { Card, CardHeader, CardTitle, CardContent } from "../../../../shared/components/ui/Card";
import { User, Lock, Trash2, Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setProfileData, setProfileLoading, logout } from "../../../auth/store/authSlice";
import { userProfileApi } from "../service/profileApi";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import ProfileForm from "../components/ProfileFrom";
import PasswordSection from "../components/PasswordChange";
import DeleteAccountSection from "../components/DeleteAccount";

export default function ProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [profileData, setProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoadingProfile(true);
    dispatch(setProfileLoading(true));
    try {
      const response = await userProfileApi.getUserDetails();
      if (response.success && response.data?.profile) {
        dispatch(setProfileData(response.data.profile));
        setProfile(response.data.profile);
      } else setProfile(null);
    } catch {
      toast.error("Failed to load profile");
      setProfile(null);
    } finally {
      setIsLoadingProfile(false);
      dispatch(setProfileLoading(false));
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e3a8a]">
        <Loader2 className="animate-spin text-blue-400 w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e3a8a] py-12 px-4 text-white">
      <div className="max-w-5xl mx-auto">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="flex justify-center mb-10 bg-[#1e293b] border border-[#334155] rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.15)]">
            <TabsTrigger value="profile" className="text-blue-400 hover:bg-blue-950/30">Profile</TabsTrigger>
            <TabsTrigger value="password" className="text-blue-400 hover:bg-blue-950/30">Change Password</TabsTrigger>
            <TabsTrigger value="danger" className="text-red-400 hover:bg-red-900/30">Danger Zone</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="bg-[#1e293b] border border-[#334155] rounded-2xl shadow-[0_0_30px_rgba(59,130,246,0.2)]">
              <CardHeader className="border-b border-[#334155] pb-4">
                <CardTitle className="flex items-center gap-2 text-blue-400 text-xl font-semibold">
                  <User /> Manage Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ProfileForm userInfo={userInfo} profileData={profileData} refreshProfile={fetchProfile} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password">
            <Card className="bg-[#1e293b] border border-[#334155] rounded-2xl shadow-[0_0_30px_rgba(59,130,246,0.2)]">
              <CardHeader className="border-b border-[#334155] pb-4">
                <CardTitle className="flex items-center gap-2 text-blue-400 text-xl font-semibold">
                  <Lock /> Change Password
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <PasswordSection />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="danger">
            <Card className="bg-[#1e293b] border border-[#334155] rounded-2xl shadow-[0_0_30px_rgba(239,68,68,0.2)]">
              <CardHeader className="border-b border-[#334155] pb-4">
                <CardTitle className="flex items-center gap-2 text-red-400 text-xl font-semibold">
                  <Trash2 /> Delete Account
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <DeleteAccountSection dispatch={dispatch} navigate={navigate} logout={logout} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
