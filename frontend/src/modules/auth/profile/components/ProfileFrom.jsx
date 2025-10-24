import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Input } from "../../../../shared/components/ui/Input";
import { Button } from "../../../../shared/components/ui/Button";
import { Camera, Edit2, Save, X, Loader2, Plus, Trash2 } from "lucide-react";
import { userProfileApi } from "../service/profileApi";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { setProfileData, updateUserInfo } from "../../../auth/store/authSlice";

export default function ProfileForm({ userInfo, profileData, refreshProfile }) {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(!profileData);
  const [isSaving, setIsSaving] = useState(false);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);

  const { register, handleSubmit, reset, control, setValue } = useForm({
    defaultValues: {
      name: "",
      email: "",
      accountType: "",
      contactNumber: "",
      dateOfBirth: "",
      gender: "",
      addresses: [
        {
          label: "Home",
          street: "",
          city: "",
          state: "",
          country: "",
          postalCode: "",
          isDefault: true,
        },
      ],
      profilePicture: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "addresses",
  });

  // Update isEditing when profileData changes
  useEffect(() => {
    if (profileData) {
      setIsEditing(false);
    }
  }, [profileData]);

  useEffect(() => {
    if (profileData && userInfo) {
      const dobValue = profileData.dateOfBirth
        ? new Date(profileData.dateOfBirth).toISOString().split("T")[0]
        : "";

      reset({
        name: userInfo.name,
        email: userInfo.email,
        accountType: userInfo.accountType,
        contactNumber: profileData.contactNumber || "",
        dateOfBirth: dobValue,
        gender: profileData.gender || "",
        addresses: profileData.addresses?.length
          ? profileData.addresses
          : [
              {
                label: "Home",
                street: "",
                city: "",
                state: "",
                country: "",
                postalCode: "",
                isDefault: true,
              },
            ],
      });

      setProfilePicturePreview(
        profileData.profilePicture ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
            userInfo.name
          )}`
      );
    } else if (userInfo) {
      reset({
        name: userInfo.name,
        email: userInfo.email,
        accountType: userInfo.accountType,
      });
      
      setProfilePicturePreview(
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
          userInfo.name
        )}`
      );
    }
  }, [profileData, userInfo, reset]);

  const uploadToCloudinary = async (file) => {
    if (!file) return null;
    
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

    try {
      toast.loading("Uploading image...");
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${
          import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
        }/image/upload`,
        { method: "POST", body: data }
      );
      const json = await res.json();
      toast.dismiss();
      
      if (json.secure_url) {
        toast.success("Image uploaded successfully!");
        return json.secure_url;
      } else {
        toast.error("Image upload failed");
        return null;
      }
    } catch (err) {
      toast.dismiss();
      toast.error("Image upload failed");
      console.error("Cloudinary upload error:", err);
      return null;
    }
  };

  const handleImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Show preview immediately
    const previewUrl = URL.createObjectURL(file);
    setProfilePicturePreview(previewUrl);
    
    // Upload to Cloudinary
    const cloudinaryUrl = await uploadToCloudinary(file);
    if (cloudinaryUrl) {
      setValue("profilePicture", cloudinaryUrl);
    }
  };

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      const userInfoPayload = {
        name: data.name.trim(),
        email: data.email.trim(),
        accountType: data.accountType.trim(),
      };

      const userUpdate = await userProfileApi.updateUserInfo(userInfoPayload);
      if (!userUpdate.success) {
        toast.error(userUpdate.error || "Failed to update user info");
        setIsSaving(false);
        return;
      }
      dispatch(updateUserInfo(userInfoPayload));

      // Use the Cloudinary URL from profilePicture field (already uploaded)
      const profilePayload = {
        dateOfBirth: data.dateOfBirth || null,
        gender: data.gender,
        contactNumber: data.contactNumber?.trim() || "",
        addresses: data.addresses.map((addr, i) => ({
          ...addr,
          isDefault: i === 0,
        })),
        profilePicture: data.profilePicture || profilePicturePreview,
      };

      const res = await userProfileApi.saveprofile(profilePayload);
      if (res.success) {
        dispatch(setProfileData(res.data.profile || res.data));
        toast.success(
          profileData
            ? "Profile updated successfully! ✅"
            : "Profile created successfully! 🎉"
        );
        setIsEditing(false);
        await refreshProfile();
      } else {
        toast.error(res.error);
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Error saving profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form to original values
    if (profileData && userInfo) {
      const dobValue = profileData.dateOfBirth
        ? new Date(profileData.dateOfBirth).toISOString().split("T")[0]
        : "";

      reset({
        name: userInfo.name,
        email: userInfo.email,
        accountType: userInfo.accountType,
        contactNumber: profileData.contactNumber || "",
        dateOfBirth: dobValue,
        gender: profileData.gender || "",
        addresses: profileData.addresses?.length
          ? profileData.addresses
          : [
              {
                label: "Home",
                street: "",
                city: "",
                state: "",
                country: "",
                postalCode: "",
                isDefault: true,
              },
            ],
      });

      setProfilePicturePreview(
        profileData.profilePicture ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
            userInfo.name
          )}`
      );
    }
  };

  return (
    <form className="space-y-8">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="relative">
          <img
            src={profilePicturePreview}
            alt="Profile"
            className="w-32 h-32 rounded-full border-4 border-blue-500/30 object-cover shadow-[0_0_25px_rgba(59,130,246,0.3)]"
          />
          {isEditing && (
            <label className="absolute bottom-0 right-0 bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-2 rounded-full cursor-pointer hover:scale-110 transition-transform shadow-md">
              <Camera size={18} />
              <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
            </label>
          )}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-blue-400">{userInfo?.name}</h2>
          <p className="text-gray-300">{userInfo?.email}</p>
        </div>
      </div>

      {/* Basic Info */}
      <div className="grid md:grid-cols-2 gap-6">
        <Input {...register("name")} disabled={!isEditing} placeholder="Full Name" />
        <Input {...register("email")} disabled={!isEditing} placeholder="Email" />
        <Input {...register("accountType")} disabled={!isEditing} placeholder="Account Type" />
        <Input {...register("contactNumber")} disabled={!isEditing} placeholder="Phone Number" />
        <Input type="date" {...register("dateOfBirth")} disabled={!isEditing} />
        <Input {...register("gender")} disabled={!isEditing} placeholder="Gender" />
      </div>

      {/* Addresses Section */}
      <div className="mt-8 space-y-6">
        <h3 className="text-lg font-semibold text-blue-400">Addresses</h3>
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="bg-[#0f172a]/60 border border-blue-500/20 rounded-xl p-5 shadow-md space-y-3"
          >
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-200">
                {field.label || `Address ${index + 1}`}
              </span>
              {isEditing && fields.length > 1 && (
                <Button
                  type="button"
                  onClick={() => remove(index)}
                  className="bg-red-600/70 hover:bg-red-700 text-white px-3 py-1 rounded-lg"
                >
                  <Trash2 size={16} />
                </Button>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Input {...register(`addresses.${index}.label`)} disabled={!isEditing} placeholder="Label (Home, Work)" />
              <Input {...register(`addresses.${index}.street`)} disabled={!isEditing} placeholder="Street" />
              <Input {...register(`addresses.${index}.city`)} disabled={!isEditing} placeholder="City" />
              <Input {...register(`addresses.${index}.state`)} disabled={!isEditing} placeholder="State" />
              <Input {...register(`addresses.${index}.country`)} disabled={!isEditing} placeholder="Country" />
              <Input {...register(`addresses.${index}.postalCode`)} disabled={!isEditing} placeholder="Postal Code" />
            </div>
          </div>
        ))}

        {isEditing && (
          <Button
            type="button"
            onClick={() =>
              append({
                label: "",
                street: "",
                city: "",
                state: "",
                country: "",
                postalCode: "",
                isDefault: false,
              })
            }
            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white mt-3"
          >
            <Plus size={16} className="mr-2" /> Add Another Address
          </Button>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mt-8">
        {!isEditing ? (
          <Button
            type="button"
            onClick={() => setIsEditing(true)}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
          >
            <Edit2 size={16} className="mr-1" /> Edit
          </Button>
        ) : (
          <>
            <Button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={isSaving}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
            >
              {isSaving ? <Loader2 className="animate-spin mr-1" size={16} /> : <Save className="mr-1" size={16} />} 
              {isSaving ? "Saving..." : "Save"}
            </Button>
            <Button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              className="bg-gray-600 hover:bg-gray-700 text-white"
            >
              <X className="mr-1" size={16} /> Cancel
            </Button>
          </>
        )}
      </div>
    </form>
  );
}