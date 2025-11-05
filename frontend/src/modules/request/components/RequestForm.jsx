import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { requestApi } from "../services/requestApi";
import { 
  Loader2, 
  FileText, 
  Upload, 
  X, 
  Send, 
  CheckCircle,
  Image as ImageIcon,
  AlertCircle
} from "lucide-react";

export const RequestForm = ({ listingId, listingType, onSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [prescriptionPreview, setPrescriptionPreview] = useState(null);
  const [prescriptionFile, setPrescriptionFile] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, and PDF files are allowed");
      return;
    }

    setPrescriptionFile(file);
    
    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPrescriptionPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPrescriptionPreview('pdf');
    }
  };

  const removeFile = () => {
    setPrescriptionFile(null);
    setPrescriptionPreview(null);
  };

  const onSubmit = async (formData) => {
    try {
      setUploading(true);
      let prescriptionUrl = null;

      // Upload prescription if provided
      if (listingType === "medicine" && prescriptionFile) {
        const uploadData = new FormData();
        uploadData.append("file", prescriptionFile);
        uploadData.append(
          "upload_preset",
          import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
        );

        const loadingToast = toast.loading("Uploading prescription...");

        const cloudinaryRes = await fetch(
          `https://api.cloudinary.com/v1_1/${
            import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
          }/image/upload`,
          {
            method: "POST",
            body: uploadData,
          }
        );

        toast.dismiss(loadingToast);

        if (!cloudinaryRes.ok) {
          throw new Error("Failed to upload prescription");
        }

        const uploadResult = await cloudinaryRes.json();
        prescriptionUrl = uploadResult.secure_url;
        toast.success("Prescription uploaded!");
      }

      // Send request
      const response = await requestApi.createRequest(listingId, {
        message: formData.message,
        prescriptionDoc: prescriptionUrl,
      });

      if (response.success) {
        toast.success("Request submitted successfully! 🎉");
        reset();
        setPrescriptionFile(null);
        setPrescriptionPreview(null);
        onSuccess?.(response.data);
      } else {
        toast.error(response.error || "Failed to create request");
      }
    } catch (err) {
      console.error("Request creation error:", err);
      toast.error(err.message || "Failed to submit request");
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      {/* Message Field */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-text flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          Message to Donor *
        </label>
        <textarea
          {...register("message", {
            required: "Message is required",
            minLength: {
              value: 10,
              message: "Message should be at least 10 characters",
            },
            maxLength: {
              value: 500,
              message: "Message cannot exceed 500 characters",
            },
          })}
          placeholder="Explain your need for this item and how it will help you..."
          disabled={uploading}
          className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text placeholder-muted focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all min-h-[120px] resize-y"
        />
        {errors.message && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-xs flex items-center gap-1"
          >
            <AlertCircle className="w-3 h-3" />
            {errors.message.message}
          </motion.p>
        )}
      </div>

      {/* Prescription Upload (Medicine only) */}
      {listingType === "medicine" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="space-y-2"
        >
          <label className="text-sm font-medium text-text flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-primary" />
            Prescription Document
            <span className="text-xs text-muted font-normal">
              (Optional but recommended)
            </span>
          </label>

          <AnimatePresence mode="wait">
            {!prescriptionPreview ? (
              <motion.label
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                whileHover={{ scale: 1.01 }}
                className="block"
              >
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
                  <Upload className="w-12 h-12 mx-auto text-muted mb-3" />
                  <p className="text-sm text-text font-medium mb-1">
                    Click to upload prescription
                  </p>
                  <p className="text-xs text-muted">
                    JPG, PNG, or PDF (Max 5MB)
                  </p>
                </div>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={uploading}
                />
              </motion.label>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative group"
              >
                {prescriptionPreview === 'pdf' ? (
                  <div className="border border-border rounded-xl p-6 bg-background flex items-center gap-4">
                    <FileText className="w-12 h-12 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium text-text">
                        {prescriptionFile.name}
                      </p>
                      <p className="text-xs text-muted">
                        {(prescriptionFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                ) : (
                  <img
                    src={prescriptionPreview}
                    alt="Prescription preview"
                    className="w-full h-48 object-cover rounded-xl border border-border"
                  />
                )}
                
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={removeFile}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={uploading}
        whileHover={{ scale: uploading ? 1 : 1.02 }}
        whileTap={{ scale: uploading ? 1 : 0.98 }}
        className="w-full px-6 py-4 bg-gradient-to-r from-primary to-accent text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {uploading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Submitting Request...
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Submit Request
          </>
        )}
      </motion.button>
    </motion.form>
  );
};