import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { listingApi } from "../services/listingApi";
import { setMyListings, setLoading } from "../store/listingSlice";
import { toast } from "sonner";
import {
  Package,
  Pill,
  Stethoscope,
  Edit,
  Trash2,
  MoreVertical,
  X,
  Save,
  Loader2,
  MapPin,
  Calendar,
  Clock,
  AlertCircle,
  Plus,
  ArrowLeft,
  Upload,
  RefreshCw,
  CheckCircle,
  Circle,
} from "lucide-react";

export const MyListingsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { myListing, isLoading } = useSelector((state) => state.listing);

  const [menuOpenId, setMenuOpenId] = useState(null);
  const [editingListing, setEditingListing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isWorking, setIsWorking] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Form state for editing
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    city: "",
    photoURL: "",
  });

  useEffect(() => {
    fetchMyListings();
  }, []);

  const fetchMyListings = async () => {
    dispatch(setLoading(true));
    const res = await listingApi.getMyListing();
    if (res.success) {
      dispatch(setMyListings(res.data));
    } else {
      toast.error(res.error || "Failed to load your listings");
    }
    dispatch(setLoading(false));
  };

  const getCategoryIcon = (type) => {
    switch (type) {
      case "equipment":
        return Stethoscope;
      case "medicine":
        return Pill;
      default:
        return Package;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "reserved":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "donated":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

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

      if (!res.ok) throw new Error(json?.error?.message || "Upload failed");

      toast.success("Image uploaded!");
      return json.secure_url;
    } catch (e) {
      toast.error(e.message || "Image upload failed");
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

    const url = await uploadToCloudinary(file);
    if (url) {
      setEditForm({ ...editForm, photoURL: url });
    }
  };

  const handleStatusUpdate = async (id, status) => {
    setIsWorking(true);
    const res = await listingApi.updateListingStatus(id, status);
    if (res.success) {
      toast.success(`Status updated to "${status}"! ✅`);
      await fetchMyListings();
    } else {
      toast.error(res.error || "Failed to update status");
    }
    setIsWorking(false);
    setMenuOpenId(null);
  };

  const handleEdit = (listing) => {
    setEditingListing(listing);
    setEditForm({
      title: listing.title,
      description: listing.description,
      city: listing.location?.city || "",
      photoURL: listing.photoURL || "",
    });
    setMenuOpenId(null);
  };

  const handleUpdateListing = async () => {
    if (!editForm.title || !editForm.description || !editForm.city) {
      toast.error("Title, description, and city are required");
      return;
    }

    setIsWorking(true);
    const payload = {
      title: editForm.title.trim(),
      description: editForm.description.trim(),
      location: { city: editForm.city.trim() },
      photoURL: editForm.photoURL || null,
    };

    const res = await listingApi.updateListing(editingListing._id, payload);
    setIsWorking(false);

    if (res.success) {
      toast.success("Listing updated successfully! ✅");
      await fetchMyListings();
      setEditingListing(null);
      setEditForm({ title: "", description: "", city: "", photoURL: "" });
    } else {
      toast.error(res.error || "Failed to update listing");
    }
  };

  const requestDelete = (listing) => {
    setDeleteTarget(listing);
    setMenuOpenId(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget?._id) return;
    setIsWorking(true);
    const res = await listingApi.deleteListing(deleteTarget._id);
    setIsWorking(false);

    if (res.success) {
      toast.success("Listing deleted successfully! 🗑️");
      await fetchMyListings();
      setDeleteTarget(null);
    } else {
      toast.error(res.error || "Failed to delete listing");
    }
  };

  const filteredListings = Array.isArray(myListing)
    ? myListing.filter((item) => {
        const matchesType = filterType === "all" || item.type === filterType;
        const matchesStatus =
          filterStatus === "all" || item.status === filterStatus;
        return matchesType && matchesStatus;
      })
    : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted">Loading your listings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface/50 backdrop-blur-sm border border-border rounded-2xl shadow-soft p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-text">My Listings</h2>
            <p className="text-sm text-muted mt-1">
              {filteredListings.length} listing
              {filteredListings.length !== 1 ? "s" : ""} found
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchMyListings}
            className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl font-medium hover:bg-primary/20 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </motion.button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted mb-2 block">
              Filter by Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-text focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
            >
              <option value="all">All Types</option>
              <option value="medicine">Medicine</option>
              <option value="equipment">Equipment</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-muted mb-2 block">
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-text focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="donated">Donated</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Listings Grid */}
      {filteredListings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-surface/50 backdrop-blur-sm border border-border rounded-2xl shadow-soft p-12 text-center"
        >
          <Package className="w-20 h-20 text-muted/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-text mb-2">
            {myListing?.length > 0
              ? "No listings match your filters"
              : "No listings yet"}
          </h3>
          <p className="text-muted mb-6 max-w-md mx-auto">
            {myListing?.length > 0
              ? "Try adjusting your filters to see more listings."
              : "Create your first listing to start helping others."}
          </p>
        </motion.div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filteredListings.map((listing, index) => {
              const Icon = getCategoryIcon(listing.type);
              return (
                <motion.div
                  key={listing._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -8 }}
                  className="bg-surface/80 backdrop-blur-sm border border-border rounded-2xl overflow-hidden shadow-soft hover:shadow-xl transition-all duration-300 relative group"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gradient-to-br from-primary/10 to-accent/10 overflow-hidden">
                    {listing.photoURL ? (
                      <img
                        src={listing.photoURL}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon className="w-20 h-20 text-primary/30" />
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm capitalize ${getStatusColor(
                          listing.status
                        )}`}
                      >
                        {listing.status}
                      </span>
                    </div>

                    {/* Type Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-background/80 backdrop-blur-sm border border-border capitalize flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5" />
                        {listing.type}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 space-y-3">
                    <h3 className="font-semibold text-text text-lg line-clamp-1">
                      {listing.title}
                    </h3>

                    <p className="text-sm text-muted line-clamp-2 min-h-[40px]">
                      {listing.description}
                    </p>

                    {/* Meta Info */}
                    <div className="space-y-2 text-xs text-muted pt-2 border-t border-border">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 flex-shrink-0 text-primary" />
                        <span className="line-clamp-1">
                          {listing.location?.city || "Unknown"}
                        </span>
                      </div>

                      {listing.type === "medicine" && listing.expiryDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 flex-shrink-0 text-primary" />
                          <span>
                            Expires:{" "}
                            {new Date(listing.expiryDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 flex-shrink-0 text-primary" />
                        <span>
                          Created{" "}
                          {new Date(listing.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-3 border-t border-border">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEdit(listing)}
                        className="flex-1 px-3 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-all flex items-center justify-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </motion.button>

                      <div className="relative">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() =>
                            setMenuOpenId(
                              menuOpenId === listing._id ? null : listing._id
                            )
                          }
                          className="px-3 py-2 bg-surface border border-border rounded-lg hover:bg-background transition-all"
                        >
                          <MoreVertical className="w-4 h-4 text-text" />
                        </motion.button>

                        <AnimatePresence>
                          {menuOpenId === listing._id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9, y: -10 }}
                              className="absolute right-0 bottom-full mb-2 w-48 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden z-20"
                            >
                              <p className="px-4 py-2 text-xs text-muted font-medium border-b border-border">
                                Change Status
                              </p>
                              {["available", "reserved", "donated"].map(
                                (status) => (
                                  <button
                                    key={status}
                                    onClick={() =>
                                      handleStatusUpdate(listing._id, status)
                                    }
                                    disabled={isWorking}
                                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-text hover:bg-background transition-colors disabled:opacity-50 capitalize"
                                  >
                                    <div
                                      className={`w-2 h-2 rounded-full ${
                                        status === "available"
                                          ? "bg-green-500"
                                          : status === "reserved"
                                          ? "bg-yellow-500"
                                          : "bg-blue-500"
                                      }`}
                                    />
                                    {status}
                                  </button>
                                )
                              )}

                              <div className="border-t border-border">
                                <button
                                  onClick={() => requestDelete(listing)}
                                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete Listing
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {editingListing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => {
              setEditingListing(null);
              setEditForm({
                title: "",
                description: "",
                city: "",
                photoURL: "",
              });
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="sticky top-0 bg-surface border-b border-border p-6 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-2xl font-bold text-text">Edit Listing</h2>
                  <p className="text-sm text-muted mt-1">
                    Update your listing details
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingListing(null);
                    setEditForm({
                      title: "",
                      description: "",
                      city: "",
                      photoURL: "",
                    });
                  }}
                  className="p-2 hover:bg-background rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-muted" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Image Upload */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text">
                    Product Image
                  </label>
                  {editForm.photoURL ? (
                    <div className="relative group">
                      <img
                        src={editForm.photoURL}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-xl border border-border"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setEditForm({ ...editForm, photoURL: "" })
                        }
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="block">
                      <div className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary transition-all">
                        {isUploading ? (
                          <Loader2 className="w-10 h-10 animate-spin mx-auto text-primary" />
                        ) : (
                          <>
                            <Upload className="w-10 h-10 mx-auto text-muted mb-2" />
                            <p className="text-sm text-muted">
                              Click to upload new image
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
                    </label>
                  )}
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm({ ...editForm, title: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                    placeholder="Enter title"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text">
                    Description *
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                    required
                    rows={4}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all resize-none"
                    placeholder="Enter description"
                  />
                </div>

                {/* City */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text">
                    City *
                  </label>
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={(e) =>
                      setEditForm({ ...editForm, city: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                    placeholder="Enter city"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingListing(null);
                      setEditForm({
                        title: "",
                        description: "",
                        city: "",
                        photoURL: "",
                      });
                    }}
                    disabled={isWorking || isUploading}
                    className="flex-1 px-6 py-3 bg-surface border border-border text-text rounded-xl font-medium hover:bg-background transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateListing}
                    disabled={isWorking || isUploading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isWorking ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setDeleteTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-border">
                <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-text text-center mb-2">
                  Delete Listing?
                </h3>
                <p className="text-sm text-muted text-center">
                  Are you sure you want to delete{" "}
                  <span className="font-medium text-text">
                    "{deleteTarget.title}"
                  </span>
                  ? This action cannot be undone.
                </p>
              </div>

              <div className="p-6 flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={isWorking}
                  className="flex-1 px-6 py-3 bg-surface border border-border text-text rounded-xl font-medium hover:bg-background transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isWorking}
                  className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isWorking ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
