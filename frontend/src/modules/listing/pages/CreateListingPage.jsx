import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { listingApi } from "../services/listingApi";
import {
  Package,
  FileText,
  MapPin,
  Calendar,
  Image as ImageIcon,
  Loader2,
  Save,
  ArrowLeft,
  AlertCircle,
  Pill,
  Stethoscope,
  Upload,
  X,
  Navigation,
} from "lucide-react";

export const CreateListingPage = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      type: "medicine",
      expiryDate: "",
      city: "",
      photoURL: "",
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [gettingLocation, setGettingLocation] = useState(false);
  const [location, setLocation] = useState(null);

  const selectedType = watch("type");

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
        toast.success("Image uploaded!");
        return json.secure_url;
      } else {
        toast.error("Upload failed");
        return null;
      }
    } catch (err) {
      toast.error("Upload failed");
      console.error("Upload error:", err);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    const preview = URL.createObjectURL(file);
    setImagePreview(preview);

    const url = await uploadToCloudinary(file);
    if (url) {
      setValue("photoURL", url);
    } else {
      setImagePreview("");
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }

    setGettingLocation(true);
    const loadingToast = toast.loading("Getting your location...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        toast.dismiss(loadingToast);
        toast.success("Location detected!");
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setGettingLocation(false);
      },
      (err) => {
        toast.dismiss(loadingToast);
        toast.error("Failed to get location");
        console.error("Location error:", err);
        setGettingLocation(false);
      }
    );
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      const payload = {
        title: data.title.trim(),
        description: data.description.trim(),
        type: data.type,
        location: {
          city: data.city.trim(),
          lat: location?.lat || null,
          lng: location?.lng || null,
        },
        photoURL: data.photoURL || null,
      };

      if (data.type === "medicine") {
        if (!data.expiryDate) {
          toast.error("Expiry date is required for medicine");
          setIsSubmitting(false);
          return;
        }
        payload.expiryDate = data.expiryDate;
      }

      const result = await listingApi.createListing(payload);

      if (result.success) {
        toast.success("Listing created successfully! 🎉");
        navigate("/dashboard/my-listings");
      } else {
        toast.error(result.error || "Failed to create listing");
      }
    } catch (error) {
      toast.error("Something went wrong");
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <motion.button
            whileHover={{ scale: 1.05, x: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted hover:text-text transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </motion.button>

          <h1 className="text-3xl sm:text-4xl font-bold text-text mb-2">
            Create New Listing
          </h1>
          <p className="text-muted">
            Share medical supplies with those who need them
          </p>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface border border-border rounded-2xl shadow-xl overflow-hidden"
        >
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="p-6 sm:p-8 space-y-6"
          >
            {/* Type Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-text">
                Listing Type *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <motion.label
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedType === "medicine"
                      ? "border-primary bg-primary/5"
                      : "border-border bg-background hover:border-primary/50"
                  }`}
                >
                  <input
                    {...register("type")}
                    type="radio"
                    value="medicine"
                    className="sr-only"
                  />
                  <Pill
                    className={`w-6 h-6 flex-shrink-0 ${
                      selectedType === "medicine"
                        ? "text-primary"
                        : "text-muted"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text">Medicine</p>
                    <p className="text-xs text-muted truncate">
                      Drugs, pills, syrups
                    </p>
                  </div>
                </motion.label>

                <motion.label
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedType === "equipment"
                      ? "border-primary bg-primary/5"
                      : "border-border bg-background hover:border-primary/50"
                  }`}
                >
                  <input
                    {...register("type")}
                    type="radio"
                    value="equipment"
                    className="sr-only"
                  />
                  <Stethoscope
                    className={`w-6 h-6 flex-shrink-0 ${
                      selectedType === "equipment"
                        ? "text-primary"
                        : "text-muted"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text">Equipment</p>
                    <p className="text-xs text-muted truncate">
                      Devices, tools
                    </p>
                  </div>
                </motion.label>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text flex items-center gap-2">
                <Package className="w-4 h-4" />
                Title *
              </label>
              <input
                {...register("title", {
                  required: "Title is required",
                  minLength: { value: 3, message: "Min 3 characters" },
                  maxLength: { value: 100, message: "Max 100 characters" },
                })}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text placeholder-muted focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                placeholder="e.g., Paracetamol 500mg Tablets"
              />
              {errors.title && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-xs flex items-center gap-1"
                >
                  <AlertCircle className="w-3 h-3" />
                  {errors.title.message}
                </motion.p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Description *
              </label>
              <textarea
                {...register("description", {
                  required: "Description is required",
                  minLength: { value: 10, message: "Min 10 characters" },
                  maxLength: { value: 1000, message: "Max 1000 characters" },
                })}
                rows={4}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text placeholder-muted focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all resize-none"
                placeholder="Describe the item, quantity, condition, usage instructions, etc."
              />
              {errors.description && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-xs flex items-center gap-1"
                >
                  <AlertCircle className="w-3 h-3" />
                  {errors.description.message}
                </motion.p>
              )}
            </div>

            {/* Expiry Date (Medicine only) */}
            <AnimatePresence>
              {selectedType === "medicine" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <label className="text-sm font-medium text-text flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Expiry Date *
                  </label>
                  <input
                    {...register("expiryDate", {
                      required:
                        selectedType === "medicine"
                          ? "Expiry date is required"
                          : false,
                    })}
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                  />
                  {errors.expiryDate && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-xs flex items-center gap-1"
                    >
                      <AlertCircle className="w-3 h-3" />
                      {errors.expiryDate.message}
                    </motion.p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Location */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-text flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  City *
                </label>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={getCurrentLocation}
                  disabled={gettingLocation}
                  className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-all disabled:opacity-50"
                >
                  {gettingLocation ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Navigation className="w-4 h-4" />
                  )}
                  Get Location
                </motion.button>
              </div>

              <input
                {...register("city", {
                  required: "City is required",
                })}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text placeholder-muted focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                placeholder="e.g., Mumbai, Delhi, Bangalore"
              />
              {errors.city && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-xs flex items-center gap-1"
                >
                  <AlertCircle className="w-3 h-3" />
                  {errors.city.message}
                </motion.p>
              )}

              {location && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 text-xs text-muted bg-primary/5 border border-primary/20 rounded-lg p-2"
                >
                  <Navigation className="w-3 h-3 text-primary" />
                  <span>
                    Location: {location.lat.toFixed(4)},{" "}
                    {location.lng.toFixed(4)}
                  </span>
                </motion.div>
              )}
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Product Image (Optional)
              </label>

              <AnimatePresence mode="wait">
                {imagePreview ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative group"
                  >
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-xl border-2 border-border"
                    />
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => {
                        setImagePreview("");
                        setValue("photoURL", "");
                      }}
                      className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.label
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ scale: 1.01 }}
                    className="block"
                  >
                    <div className="border-2 border-dashed border-border rounded-xl p-12 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
                      {isUploading ? (
                        <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
                      ) : (
                        <>
                          <Upload className="w-12 h-12 mx-auto text-muted mb-3" />
                          <p className="text-sm text-text font-medium mb-1">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-muted">
                            PNG, JPG, WEBP up to 5MB
                          </p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                  </motion.label>
                )}
              </AnimatePresence>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t border-border">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(-1)}
                className="w-full sm:w-auto px-6 py-3 bg-surface border border-border text-text rounded-xl font-medium hover:bg-background transition-all"
              >
                Cancel
              </motion.button>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting || isUploading}
                className="w-full sm:flex-1 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-medium shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Create Listing
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};
