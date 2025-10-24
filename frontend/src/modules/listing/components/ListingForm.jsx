import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { listingApi } from "../services/listingApi";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../shared/components/ui/Card";
import { Input } from "../../../shared/components/ui/Input";
import { Textarea } from "../../../shared/components/ui/TextArea";
import { Button } from "../../../shared/components/ui/Button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../../shared/components/ui/Select";
import { Compass } from "lucide-react";

export const CreateListingForm = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [coords, setCoords] = useState({ lat: null, lng: null });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      type: "",
      expiryDate: "",
      address: "",
      city: "",
      postalCode: "",
      photoFile: null,
    },
  });

  const selectedType = watch("type");

  // 🔹 Upload image to Cloudinary
  const uploadToCloudinary = async (file) => {
    if (!file) return null;
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

    try {
      setIsUploading(true);
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${
          import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
        }/image/upload`,
        { method: "POST", body: data }
      );
      const json = await res.json();
      setIsUploading(false);
      return json.secure_url;
    } catch (err) {
      setIsUploading(false);
      toast.error("Image upload failed");
      return null;
    }
  };

  // 🔹 Preview image
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setValue("photoFile", e.target.files);
    }
  };

  // 🔹 Get current GPS coordinates
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported on your browser");
      return;
    }

    toast.loading("Getting your location...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        toast.dismiss();
        toast.success("Location detected successfully ✅");
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setUseCurrentLocation(true);
      },
      (err) => {
        toast.dismiss();
        toast.error("Failed to access location");
        console.error("Location error:", err);
      }
    );
  };

  // 🔹 Cancel GPS and switch to manual entry
  const cancelLocation = () => {
    setUseCurrentLocation(false);
    setCoords({ lat: null, lng: null });
    toast.message("Switched to manual entry mode ✏️");
  };

  // 🔹 Submit handler
  const onSubmit = async (data) => {
    if (!userInfo) {
      toast.error("You must be logged in to create a listing");
      return;
    }

    if (!data.title || !data.description || !data.type) {
      toast.error("Please fill all required fields");
      return;
    }

    // Upload image
    const photoURL = await uploadToCloudinary(data.photoFile?.[0]);

    // Build location
    const location = useCurrentLocation
      ? {
          address: "Current location",
          city: data.city?.trim() || "Unknown",
          postalCode: data.postalCode?.trim() || "",
          lat: coords.lat,
          lng: coords.lng,
        }
      : {
          address: data.address.trim(),
          city: data.city.trim(),
          postalCode: data.postalCode.trim(),
          lat: null,
          lng: null,
        };

    const payload = {
      title: data.title.trim(),
      description: data.description.trim(),
      type: data.type,
      expiryDate: data.type === "medicine" ? data.expiryDate : null,
      location,
      photoURL: photoURL || null,
    };

    const result = await listingApi.createListing(payload);
    if (result.success) {
      toast.success("Listing created successfully!");
      reset();
      setPreview(null);
      setCoords({ lat: null, lng: null });
      setUseCurrentLocation(false);
      navigate("/dashboard/my-listings");
    } else {
      toast.error(result.error || "Failed to create listing");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)] py-10 px-4">
      <Card className="bg-[var(--color-surface)] border border-[var(--color-border)] shadow-soft rounded-2xl overflow-hidden max-w-5xl mx-auto">
        <CardHeader className="border-b border-[var(--color-border)] pb-4 px-6">
          <CardTitle className="text-2xl text-[var(--color-primary)] font-semibold">
            Create New Listing
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col md:flex-row gap-10 p-6">
          {/* Left Side: Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex-1 flex flex-col gap-5"
          >
            {/* Title */}
            <div>
              <label className="text-[var(--color-text-muted)] text-sm font-medium">
                Title *
              </label>
              <Input
                {...register("title", { required: "Title is required" })}
                placeholder="Enter listing title"
                className="mt-1 bg-[var(--color-background)] border-[var(--color-border)]"
              />
              {errors.title && (
                <p className="text-red-400 text-xs">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="text-[var(--color-text-muted)] text-sm font-medium">
                Description *
              </label>
              <Textarea
                {...register("description", {
                  required: "Description is required",
                })}
                placeholder="Enter detailed description"
                className="mt-1 bg-[var(--color-background)] border-[var(--color-border)]"
              />
              {errors.description && (
                <p className="text-red-400 text-xs">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Type */}
            <div>
              <label className="text-[var(--color-text-muted)] text-sm font-medium">
                Type *
              </label>
              <Select
                value={selectedType}
                onValueChange={(v) => setValue("type", v)}
              >
                <SelectTrigger className="mt-1 bg-[var(--color-background)] border-[var(--color-border)]">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medicine">Medicine</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-red-400 text-xs">{errors.type.message}</p>
              )}
            </div>

            {/* Expiry Date */}
            {selectedType === "medicine" && (
              <div>
                <label className="text-[var(--color-text-muted)] text-sm font-medium">
                  Expiry Date *
                </label>
                <Input
                  type="date"
                  {...register("expiryDate", {
                    required: "Expiry date is required for medicines",
                  })}
                  className="mt-1 bg-[var(--color-background)] border-[var(--color-border)]"
                />
                {errors.expiryDate && (
                  <p className="text-red-400 text-xs">
                    {errors.expiryDate.message}
                  </p>
                )}
              </div>
            )}

            {/* Location Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[var(--color-text-muted)] text-sm font-medium">
                  Location *
                </label>

                {!useCurrentLocation ? (
                  <Button
                    type="button"
                    onClick={getCurrentLocation}
                    className="flex items-center gap-2 bg-[var(--color-primary)] text-white text-sm px-3 py-1"
                  >
                    <Compass className="w-4 h-4" /> Get My Location
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={cancelLocation}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1"
                  >
                    ✏️ Enter Manually
                  </Button>
                )}
              </div>

              {!useCurrentLocation && (
                <>
                  <Input
                    {...register("address", { required: "Address is required" })}
                    placeholder="Enter street or area"
                    className="mt-1 bg-[var(--color-background)] border-[var(--color-border)] mb-3"
                  />
                  <Input
                    {...register("city", { required: "City is required" })}
                    placeholder="Enter city"
                    className="mt-1 bg-[var(--color-background)] border-[var(--color-border)] mb-3"
                  />
                  <Input
                    {...register("postalCode", {
                      required: "Postal code is required",
                    })}
                    placeholder="Enter postal code"
                    className="mt-1 bg-[var(--color-background)] border-[var(--color-border)]"
                  />
                </>
              )}

              {useCurrentLocation && coords.lat && (
                <div className="text-xs text-[var(--color-text-muted)] mt-2">
                  📍 Latitude: {coords.lat.toFixed(4)}, Longitude:{" "}
                  {coords.lng.toFixed(4)}
                </div>
              )}
            </div>

            {/* Upload Image */}
            <div>
              <label className="text-[var(--color-text-muted)] text-sm font-medium">
                Upload Image
              </label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-1 bg-[var(--color-background)] border-[var(--color-border)] cursor-pointer"
              />
            </div>

            <Button
              type="submit"
              disabled={isUploading}
              className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] hover:opacity-90 text-white py-2 rounded-lg transition mt-2"
            >
              {isUploading ? "Uploading..." : "Create Listing"}
            </Button>
          </form>

          {/* Right Side: Image Preview */}
          <div className="flex-1 flex flex-col items-center justify-center">
            {preview ? (
              <>
                <img
                  src={preview}
                  alt="Preview"
                  className="rounded-lg border border-[var(--color-border)] shadow-glow max-h-64 object-cover"
                />
                <p className="text-[var(--color-text-muted)] text-sm mt-2">
                  Preview image
                </p>
              </>
            ) : (
              <div className="h-64 w-full flex items-center justify-center border border-dashed border-[var(--color-border)] rounded-lg text-[var(--color-text-muted)] text-sm bg-[var(--color-background)]/70">
                No image selected
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
