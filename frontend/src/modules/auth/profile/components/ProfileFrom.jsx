import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Edit2,
  Save,
  X,
  Loader2,
  Plus,
  Trash2,
  MapPin,
} from "lucide-react";
import { userProfileApi } from "../service/profileApi";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { setProfileData, updateUserInfo } from "../../../auth/store/authSlice";

export default function ProfileForm({ userInfo, profileData, refreshProfile }) {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(!profileData);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);

  const { register, handleSubmit, reset, control, setValue } = useForm({
    defaultValues: {
      name: "",
      email: "",
      contactNumber: "",
      dateOfBirth: "",
      gender: "",
      addresses: [],
      profilePicture: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "addresses",
  });

  useEffect(() => {
    if (profileData) {
      setIsEditing(false);
    }
  }, [profileData]);

  useEffect(() => {
    if (profileData && profileData.user) {
      const user = profileData.user;
      const dobValue = profileData.dateOfBirth
        ? new Date(profileData.dateOfBirth).toISOString().split("T")[0]
        : "";

      reset({
        name: user.name,
        email: user.email,
        contactNumber: profileData.contactNumber || "",
        dateOfBirth: dobValue,
        gender: profileData.gender || "",
        addresses: profileData.addresses?.length ? profileData.addresses : [],
      });

      setProfilePicturePreview(
        profileData.profilePicture ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
            user.name
          )}`
      );
    } else if (userInfo) {
      reset({
        name: userInfo.name,
        email: userInfo.email,
        contactNumber: "",
        dateOfBirth: "",
        gender: "",
        addresses: [],
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
      setIsUploading(true);
      const loadingToast = toast.loading("Uploading image...");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${
          import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
        }/image/upload`,
        { method: "POST", body: data }
      );
      const json = await res.json();

      toast.dismiss(loadingToast);

      if (json.secure_url) {
        toast.success("Image uploaded successfully!");
        return json.secure_url;
      } else {
        toast.error("Image upload failed");
        return null;
      }
    } catch (err) {
      toast.error("Image upload failed");
      console.error("Cloudinary upload error:", err);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setProfilePicturePreview(previewUrl);

    const cloudinaryUrl = await uploadToCloudinary(file);
    if (cloudinaryUrl) {
      setValue("profilePicture", cloudinaryUrl);
    } else {
      setProfilePicturePreview(
        profileData?.profilePicture ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
            userInfo?.name || "User"
          )}`
      );
    }
  };

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      // Step 1: Update user info (WITHOUT accountType - backend doesn't accept it)
      const userInfoPayload = {
        name: data.name.trim(),
        email: data.email.trim(),
      };

      const userUpdate = await userProfileApi.updateUserInfo(userInfoPayload);
      if (!userUpdate.success) {
        toast.error(userUpdate.error || "Failed to update user info");
        setIsSaving(false);
        return;
      }
      dispatch(updateUserInfo(userInfoPayload));

      // Step 2: Filter out empty addresses (addresses without city)
      const validAddresses = data.addresses
        .filter((addr) => addr.city && addr.city.trim().length > 0)
        .map((addr) => ({
          label: addr.label?.toLowerCase() || "other",
          street: addr.street?.trim() || "",
          city: addr.city.trim(),
          state: addr.state?.trim() || "",
          country: addr.country?.trim() || "",
          postalCode: addr.postalCode?.trim() || "",
        }));

      // Step 3: Build profile payload
      const profilePayload = {};

      if (data.dateOfBirth) {
        profilePayload.dateOfBirth = data.dateOfBirth;
      }

      if (data.gender) {
        profilePayload.gender = data.gender.toLowerCase();
      }

      if (data.contactNumber) {
        profilePayload.contactNumber = data.contactNumber.trim();
      }

      if (validAddresses.length > 0) {
        profilePayload.addresses = validAddresses;
      }

      profilePayload.profilePicture =
        data.profilePicture || profilePicturePreview;

      const res = await userProfileApi.saveprofile(profilePayload);
      if (res.success) {
        toast.success(
          profileData
            ? "Profile updated successfully! ✅"
            : "Profile created successfully! 🎉"
        );
        setIsEditing(false);
        // Refresh profile to get updated data with populated user
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
    if (profileData && profileData.user) {
      const user = profileData.user;
      const dobValue = profileData.dateOfBirth
        ? new Date(profileData.dateOfBirth).toISOString().split("T")[0]
        : "";

      reset({
        name: user.name,
        email: user.email,
        contactNumber: profileData.contactNumber || "",
        dateOfBirth: dobValue,
        gender: profileData.gender || "",
        addresses: profileData.addresses?.length ? profileData.addresses : [],
      });

      setProfilePicturePreview(
        profileData.profilePicture ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
            user.name
          )}`
      );
    }
  };

  return (
    <form className="space-y-6 sm:space-y-8">
      {/* Profile Picture */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-3 sm:gap-4"
      >
        <div className="relative group">
          <motion.img
            whileHover={{ scale: 1.05 }}
            src={profilePicturePreview}
            alt="Profile"
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-primary/30 object-cover shadow-2xl"
          />
          {isEditing && (
            <motion.label
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute bottom-0 right-0 bg-gradient-to-r from-primary to-accent text-white p-2 sm:p-3 rounded-full cursor-pointer shadow-lg"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              ) : (
                <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImage}
                disabled={isUploading}
              />
            </motion.label>
          )}
        </div>
        <div className="text-center">
          <h3 className="text-lg sm:text-xl font-bold text-text">
            {profileData?.user?.name || userInfo?.name}
          </h3>
          <p className="text-xs sm:text-sm text-muted break-all px-4">
            {profileData?.user?.email || userInfo?.email}
          </p>
        </div>
      </motion.div>

      {/* Basic Info - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="sm:col-span-2 md:col-span-1"
        >
          <label className="block text-sm font-medium text-text mb-2">
            Full Name
          </label>
          <input
            {...register("name", { required: true })}
            disabled={!isEditing}
            className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-background border border-border rounded-xl text-text text-sm sm:text-base focus:border-primary focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Enter your name"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="sm:col-span-2 md:col-span-1"
        >
          <label className="block text-sm font-medium text-text mb-2">
            Email
          </label>
          <input
            {...register("email", { required: true })}
            disabled={!isEditing}
            type="email"
            className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-background border border-border rounded-xl text-text text-sm sm:text-base focus:border-primary focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Enter your email"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <label className="block text-sm font-medium text-text mb-2">
            Account Type
          </label>
          <select
            disabled={true}
            value={
              profileData?.user?.accountType || userInfo?.accountType || "user"
            }
            className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-background border border-border rounded-xl text-text text-sm sm:text-base focus:border-primary focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="user">User</option>
            <option value="seller">Seller</option>
          </select>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <label className="block text-sm font-medium text-text mb-2">
            Contact Number
          </label>
          <input
            {...register("contactNumber")}
            disabled={!isEditing}
            type="tel"
            className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-background border border-border rounded-xl text-text text-sm sm:text-base focus:border-primary focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="+1 234 567 8900"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <label className="block text-sm font-medium text-text mb-2">
            Date of Birth
          </label>
          <input
            {...register("dateOfBirth")}
            disabled={!isEditing}
            type="date"
            className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-background border border-border rounded-xl text-text text-sm sm:text-base focus:border-primary focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <label className="block text-sm font-medium text-text mb-2">
            Gender
          </label>
          <select
            {...register("gender")}
            disabled={!isEditing}
            className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-background border border-border rounded-xl text-text text-sm sm:text-base focus:border-primary focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </motion.div>
      </div>

      {/* Addresses - Responsive */}
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
            <h3 className="text-base sm:text-lg font-semibold text-text">
              Addresses
            </h3>
          </div>
          {isEditing && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() =>
                append({
                  label: "home",
                  street: "",
                  city: "",
                  state: "",
                  country: "",
                  postalCode: "",
                })
              }
              className="px-3 py-2 sm:px-4 sm:py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg flex items-center gap-2 text-xs sm:text-sm w-full sm:w-auto justify-center"
            >
              <Plus className="w-4 h-4" />
              Add Address
            </motion.button>
          )}
        </div>

        {fields.length === 0 && (
          <div className="text-center py-8 text-muted">
            <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No addresses added yet</p>
          </div>
        )}

        <AnimatePresence>
          {fields.map((field, index) => (
            <motion.div
              key={field.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-background border border-border rounded-xl p-4 sm:p-6 space-y-4"
            >
              <div className="flex justify-between items-center gap-2">
                <select
                  {...register(`addresses.${index}.label`)}
                  disabled={!isEditing}
                  className="flex-1 px-3 py-1.5 sm:py-2 bg-surface border border-border rounded-lg text-text text-xs sm:text-sm capitalize"
                >
                  <option value="home">🏠 Home</option>
                  <option value="work">💼 Work</option>
                  <option value="other">📍 Other</option>
                </select>
                {isEditing && (
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => remove(index)}
                    className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <input
                  {...register(`addresses.${index}.street`)}
                  disabled={!isEditing}
                  placeholder="Street Address"
                  className="sm:col-span-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-surface border border-border rounded-lg text-text text-sm focus:border-primary focus:outline-none transition-all disabled:opacity-50"
                />
                <input
                  {...register(`addresses.${index}.city`)}
                  disabled={!isEditing}
                  placeholder="City (Required)"
                  className="px-3 py-2 sm:px-4 sm:py-2.5 bg-surface border border-border rounded-lg text-text text-sm focus:border-primary focus:outline-none transition-all disabled:opacity-50"
                />
                <input
                  {...register(`addresses.${index}.state`)}
                  disabled={!isEditing}
                  placeholder="State"
                  className="px-3 py-2 sm:px-4 sm:py-2.5 bg-surface border border-border rounded-lg text-text text-sm focus:border-primary focus:outline-none transition-all disabled:opacity-50"
                />
                <input
                  {...register(`addresses.${index}.country`)}
                  disabled={!isEditing}
                  placeholder="Country"
                  className="px-3 py-2 sm:px-4 sm:py-2.5 bg-surface border border-border rounded-lg text-text text-sm focus:border-primary focus:outline-none transition-all disabled:opacity-50"
                />
                <input
                  {...register(`addresses.${index}.postalCode`)}
                  disabled={!isEditing}
                  placeholder="Postal Code"
                  className="px-3 py-2 sm:px-4 sm:py-2.5 bg-surface border border-border rounded-lg text-text text-sm focus:border-primary focus:outline-none transition-all disabled:opacity-50"
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Action Buttons - Responsive */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
        {!isEditing ? (
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsEditing(true)}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl flex items-center justify-center gap-2 font-medium shadow-lg text-sm sm:text-base"
          >
            <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" />
            Edit Profile
          </motion.button>
        ) : (
          <>
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCancel}
              disabled={isSaving}
              className="w-full sm:w-auto order-2 sm:order-1 px-6 py-3 bg-surface border border-border text-text rounded-xl flex items-center justify-center gap-2 font-medium hover:bg-background transition-all disabled:opacity-50 text-sm sm:text-base"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
              Cancel
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit(onSubmit)}
              disabled={isSaving || isUploading}
              className="w-full sm:w-auto order-1 sm:order-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl flex items-center justify-center gap-2 font-medium shadow-lg disabled:opacity-50 text-sm sm:text-base"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              ) : (
                <Save className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
              {isSaving ? "Saving..." : "Save Changes"}
            </motion.button>
          </>
        )}
      </div>
    </form>
  );
}
