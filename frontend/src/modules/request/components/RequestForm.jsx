import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "sonner";
import { requestApi } from "../services/requestApi";
import { Loader2, FileText } from "lucide-react";

// Validation Schema
const schema = yup.object().shape({
  message: yup
    .string()
    .required("Message is required")
    .min(10, "Message should be at least 10 characters"),
  prescriptionDoc: yup.mixed().nullable(),
});

export const RequestForm = ({ listingId, listingType, onSuccess }) => {
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  // Handle form submit
  const onSubmit = async (formData) => {
    try {
      setUploading(true);
      let prescriptionUrl = null;

      // if listing is medicine, handle file upload
      if (listingType === "medicine" && formData.prescriptionDoc?.[0]) {
        const file = formData.prescriptionDoc[0];

        // Upload to Cloudinary
        const uploadData = new FormData();
        uploadData.append("file", file);
        uploadData.append(
          "upload_preset",
          import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
        );

        const cloudinaryRes = await fetch(
          `https://api.cloudinary.com/v1_1/${
            import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
          }/image/upload`,
          {
            method: "POST",
            body: uploadData,
          }
        );

        if (!cloudinaryRes.ok) {
          throw new Error("Failed to upload prescription document");
        }

        const uploadResult = await cloudinaryRes.json();
        prescriptionUrl = uploadResult.secure_url;
      }

      // Send request to backend
      const response = await requestApi.createRequest(listingId, {
        message: formData.message,
        prescriptionDoc: prescriptionUrl,
      });

      if (response.success) {
        toast.success("Request created successfully!");
        reset();
        onSuccess?.(response.data);
      } else {
        toast.error(response.error || "Failed to create request");
      }
    } catch (err) {
      console.error("Request creation error:", err);
      toast.error(err.message || "Failed to create request. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Message field */}
      <div>
        <label className="block text-sm font-medium mb-2 text-[var(--color-text)]">
          Message to Donor <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register("message")}
          placeholder="Explain your need for this item and how it will help..."
          className="w-full px-3 py-2 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] min-h-[120px] resize-y"
          disabled={uploading}
        />
        {errors.message && (
          <p className="text-red-500 text-sm mt-1">
            {errors.message.message}
          </p>
        )}
      </div>

      {/* Prescription upload (only if medicine) */}
      {listingType === "medicine" && (
        <div>
          <label className="block text-sm font-medium mb-2 text-[var(--color-text)]">
            Prescription Document
            <span className="text-sm text-[var(--color-text-muted)] font-normal ml-2">
              (Optional but recommended)
            </span>
          </label>
          <div className="relative">
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              {...register("prescriptionDoc")}
              className="w-full px-3 py-2 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-primary)] file:text-white hover:file:opacity-90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={uploading}
            />
            <FileText className="absolute right-3 top-3 w-5 h-5 text-[var(--color-text-muted)] pointer-events-none" />
          </div>
          {errors.prescriptionDoc && (
            <p className="text-red-500 text-sm mt-1">
              {errors.prescriptionDoc.message}
            </p>
          )}
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Accepted formats: JPG, PNG, PDF (Max 5MB)
          </p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={uploading}
        className="w-full px-4 py-3 bg-gradient-medilink text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {uploading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Submitting Request...
          </>
        ) : (
          "Submit Request"
        )}
      </button>
    </form>
  );
};