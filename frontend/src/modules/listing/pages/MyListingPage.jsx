import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { listingApi } from "../services/listingApi";
import { setMyListings, deleteListing as removeListing, setLoading } from "../store/listingSlice";
import { toast } from "sonner";
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent
} from "../../../shared/components/ui/Card";
import { Button } from "../../../shared/components/ui/Button";
import { Badge } from "../../../shared/components/ui/Badge";
import {
  MoreVertical,
  Edit,
  Trash2,
  Pill,
  Stethoscope,
  Package,
  X
} from "lucide-react";

export const MyListingsPage = () => {
  const dispatch = useDispatch();
  const { myListing, isLoading } = useSelector((state) => state.listing);

  const [menuOpenId, setMenuOpenId] = useState(null);
  const [editingListing, setEditingListing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isWorking, setIsWorking] = useState(false);

  useEffect(() => {
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
    fetchMyListings();
  }, [dispatch]);

  const getCategoryIcon = (type) => {
    switch (type) {
      case "equipment": return Stethoscope;
      case "medicine": return Pill;
      default: return Package;
    }
  };

  const uploadToCloudinary = async (file) => {
    if (!file) return null;
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
    try {
      setIsUploading(true);
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: data }
      );
      const json = await res.json();
      setIsUploading(false);
      if (!res.ok) throw new Error(json?.error?.message || "Upload failed");
      return json.secure_url;
    } catch (e) {
      setIsUploading(false);
      toast.error(e.message || "Image upload failed");
      return null;
    }
  };

  const handleStatusUpdate = async (id, status) => {
    setIsWorking(true);
    const res = await listingApi.updateListingStatus(id, { status });
    setIsWorking(false);
    if (res.success) {
      toast.success(`Status updated to "${status}"`);
      const refreshed = await listingApi.getMyListing();
      if (refreshed.success) dispatch(setMyListings(refreshed.data));
    } else {
      toast.error(res.error || "Failed to update status");
    }
    setMenuOpenId(null);
  };

  const handleEdit = (listing) => {
    setEditingListing(listing);
    setMenuOpenId(null);
  };

  const handleUpdateListing = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const title = formData.get("title")?.toString().trim();
    const description = formData.get("description")?.toString().trim();
    const city = formData.get("city")?.toString().trim();
    const file = formData.get("photoFile");

    if (!title || !description || !city) {
      toast.error("Title, description, and city are required");
      return;
    }

    let photoURL = editingListing.photoURL || null;
    if (file && file.size > 0) {
      const uploaded = await uploadToCloudinary(file);
      if (uploaded) photoURL = uploaded;
    }

    setIsWorking(true);
    const payload = { title, description, location: { city }, photoURL };
    const res = await listingApi.updateListing(editingListing._id, payload);
    setIsWorking(false);

    if (res.success) {
      toast.success("Listing updated successfully");
      const refreshed = await listingApi.getMyListing();
      if (refreshed.success) dispatch(setMyListings(refreshed.data));
      setEditingListing(null);
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
      toast.success("Listing deleted successfully");
      dispatch(removeListing(deleteTarget._id));
      setDeleteTarget(null);
    } else {
      toast.error(res.error || "Failed to delete listing");
    }
  };

  const cancelDelete = () => setDeleteTarget(null);

  if (isLoading) {
    return (
      <p className="text-center mt-10 text-muted">Loading your listings...</p>
    );
  }

  if (!myListing?.length) {
    return (
      <div className="text-center mt-10 text-muted">
        <Package className="w-12 h-12 mx-auto text-muted mb-3" />
        <h2 className="text-lg font-semibold text-text">No listings yet</h2>
        <p>Create your first listing from the dashboard.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6 text-primary">My Listings</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {myListing.map((listing) => {
          const Icon = getCategoryIcon(listing.type);
          return (
            <Card
              key={listing._id}
              className="bg-surface border border-border shadow-soft relative hover:scale-[1.02] transition-transform overflow-hidden"
            >
              {listing.photoURL && (
                <img
                  src={listing.photoURL}
                  alt={listing.title}
                  className="w-full h-40 object-cover border-b border-border"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              )}

              {/* 3-dot menu */}
              <div className="absolute top-3 right-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setMenuOpenId(menuOpenId === listing._id ? null : listing._id)
                  }
                  className="text-muted hover:text-text"
                >
                  <MoreVertical size={18} />
                </Button>

                {menuOpenId === listing._id && (
                  <div className="absolute right-0 mt-2 w-44 bg-surface border border-border rounded-md shadow-xl z-20">
                    <button
                      onClick={() => handleEdit(listing)}
                      className="flex items-center w-full px-3 py-2 text-sm text-text-muted hover:bg-background/60"
                    >
                      <Edit size={14} className="mr-2" /> Edit
                    </button>

                    <details className="group">
                      <summary className="flex items-center px-3 py-2 text-sm text-text-muted cursor-pointer hover:bg-background/60">
                        <MoreVertical size={14} className="mr-2" /> Update Status
                      </summary>
                      <div className="flex flex-col bg-surface border-t border-border">
                        {["available", "reserved"].map((status) => (
                          <button
                            key={status}
                            onClick={() => handleStatusUpdate(listing._id, status)}
                            className="text-left px-5 py-2 text-sm hover:bg-background/60 text-muted capitalize"
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </details>

                    <button
                      onClick={() => requestDelete(listing)}
                      className="flex items-center w-full px-3 py-2 text-sm text-red-400 hover:bg-background/60"
                    >
                      <Trash2 size={14} className="mr-2" /> Delete
                    </button>
                  </div>
                )}
              </div>

              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/15 p-2 rounded-lg">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-text">{listing.title}</CardTitle>
                    <CardDescription className="text-text-muted">
                      {listing.location?.city}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-text-muted text-sm mb-3 line-clamp-2">
                  {listing.description}
                </p>

                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge className="bg-primary/20 text-primary capitalize">
                    {listing.type}
                  </Badge>
                  <Badge
                    className={
                      listing.status === "available"
                        ? "bg-green-900/40 text-green-300"
                        : listing.status === "reserved"
                        ? "bg-yellow-900/40 text-yellow-300"
                        : "bg-blue-900/40 text-blue-300"
                    }
                  >
                    {listing.status}
                  </Badge>
                </div>

                {listing.expiryDate && (
                  <p className="text-xs text-text-muted mt-3">
                    Expiry: {new Date(listing.expiryDate).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit Modal */}
      {editingListing && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-lg shadow-xl relative">
            <button
              className="absolute top-3 right-3 text-muted hover:text-text"
              onClick={() => setEditingListing(null)}
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-semibold text-primary mb-4">Edit Listing</h2>

            <form onSubmit={handleUpdateListing} className="flex flex-col gap-4">
              <input
                type="text"
                name="title"
                defaultValue={editingListing.title}
                className="bg-background text-text border border-border rounded-lg px-3 py-2"
                placeholder="Title"
                required
              />
              <textarea
                name="description"
                defaultValue={editingListing.description}
                className="bg-background text-text border border-border rounded-lg px-3 py-2"
                placeholder="Description"
                required
              />
              <input
                type="text"
                name="city"
                defaultValue={editingListing.location?.city}
                className="bg-background text-text border border-border rounded-lg px-3 py-2"
                placeholder="City"
                required
              />
              <div>
                <label className="text-text-muted text-sm">Change Image</label>
                <input
                  type="file"
                  name="photoFile"
                  accept="image/*"
                  className="w-full mt-1 text-text"
                />
              </div>

              <Button
                type="submit"
                disabled={isUploading || isWorking}
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white"
              >
                {isUploading || isWorking ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-semibold text-red-400 mb-2">
              Delete this listing?
            </h3>
            <p className="text-text-muted text-sm">
              <span className="font-medium text-text">{deleteTarget.title}</span> — this action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                onClick={cancelDelete}
                variant="ghost"
                className="border border-border text-text-muted hover:text-text"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDelete}
                disabled={isWorking}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isWorking ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
