import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { listingApi } from "../services/listingApi";
import { setListing, setLoading, setError } from "../store/listingSlice";
import { toast } from "react-hot-toast";
import {
  MapPin,
  Clock,
  Package,
  Pill,
  Stethoscope,
  Search,
  X,
  Compass,
  Plus,
} from "lucide-react";
import { Button } from "../../../shared/components/ui/Button";
import { Badge } from "../../../shared/components/ui/Badge";
import { Input } from "../../../shared/components/ui/Input";
import { RequestForm } from "../../request/components/RequestForm";

export const PublicListingPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { listing, isLoading } = useSelector((state) => state.listing);
  const { userInfo } = useSelector((state) => state.auth);
  const currentUserId = userInfo?._id || userInfo?.id;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [filtered, setFiltered] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);

  // For Nearest Filter
  const [userLocation, setUserLocation] = useState(null);
  const [sortByNearest, setSortByNearest] = useState(false);

  // Fetch all listings
  useEffect(() => {
    const fetchListings = async () => {
      dispatch(setLoading(true));
      const result = await listingApi.getAllListings();
      if (result.success) {
        const data = result.data?.data || result.data;
        dispatch(setListing(data));
        setFiltered(data);
      } else {
        toast.error(result.error || "Failed to load listings");
        dispatch(setError(result.error));
      }
      dispatch(setLoading(false));
    };
    fetchListings();
  }, [dispatch]);

  //  Distance Calculator
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Apply filters
  useEffect(() => {
    if (!Array.isArray(listing)) return;

    let filteredData = listing.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === "all" || item.type === selectedType;
      const matchesCity =
        selectedCity === "all" || item.location?.city === selectedCity;
      const isMyListing = String(item.ownerId) === String(currentUserId);
      return matchesSearch && matchesType && matchesCity && !isMyListing;
    });

    //  Sort by Nearest if active
    if (sortByNearest && userLocation) {
      filteredData = filteredData
        .map((item) => {
          const dist = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            item.location?.lat,
            item.location?.lng
          );
          return { ...item, distance: dist };
        })
        .sort((a, b) => a.distance - b.distance);
    }

    setFiltered(filteredData);
  }, [
    searchQuery,
    selectedType,
    selectedCity,
    listing,
    currentUserId,
    sortByNearest,
    userLocation,
  ]);

  const getCategoryIcon = (type) => {
    switch (type) {
      case "equipment":
        return <Stethoscope className="w-4 h-4 text-[var(--color-primary)]" />;
      case "medicine":
        return <Pill className="w-4 h-4 text-[var(--color-primary)]" />;
      default:
        return <Package className="w-4 h-4 text-[var(--color-primary)]" />;
    }
  };

  const getAvailabilityColor = (status) => {
    switch (status) {
      case "available":
        return "bg-green-900/40 text-green-300";
      case "reserved":
        return "bg-yellow-900/40 text-yellow-300";
      case "donated":
        return "bg-blue-900/40 text-blue-300";
      default:
        return "bg-gray-800 text-gray-400";
    }
  };

  const handleRequestClick = (item) => {
    setSelectedListing(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedListing(null);
  };

  const handleRequestSuccess = () => {
    handleCloseModal();
    toast.success("Request submitted successfully!");
  };

  //  Get Nearest Items
  const handleNearestClick = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }

    toast.loading("Getting your location...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        toast.dismiss();
        toast.success("Showing nearest items!");
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setSortByNearest(true);
      },
      (err) => {
        toast.dismiss();
        toast.error("Location access denied");
        console.error("Location error:", err);
      }
    );
  };

  const cities = [
    "all",
    ...new Set(listing.map((l) => l.location?.city).filter(Boolean)),
  ];
  const types = ["all", "medicine", "equipment"];

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)] px-6 py-10">
      {/* Header + Create Button */}
      <div className="flex justify-between items-center mb-10 flex-wrap gap-3">
        <div className="text-center sm:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-primary)] mb-2">
            Available Medical Donations
          </h1>
          <p className="text-[var(--color-text-muted)] max-w-2xl">
            Browse or request medicines and equipment near you.
          </p>
        </div>

        <Button
          onClick={() => navigate("/dashboard/create-listing")}
          className="flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-accent)] text-white px-4 py-2 rounded-lg transition"
        >
          <Plus className="w-4 h-4" /> Create Listing
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
        <div className="relative w-full sm:w-1/3">
          <Search className="absolute left-3 top-3 w-4 h-4 text-[var(--color-text-muted)]" />
          <Input
            placeholder="Search listings..."
            className="input pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          className="input bg-[var(--color-surface)] border border-[var(--color-border)]"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          {types.map((t) => (
            <option key={t} value={t}>
              {t === "all" ? "All Types" : t}
            </option>
          ))}
        </select>

        <select
          className="input bg-[var(--color-surface)] border border-[var(--color-border)]"
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
        >
          {cities.map((c) => (
            <option key={c} value={c}>
              {c === "all" ? "All Cities" : c}
            </option>
          ))}
        </select>

        <Button
          onClick={handleNearestClick}
          className={`flex items-center gap-2 text-white ${
            sortByNearest
              ? "bg-green-600 hover:bg-green-700"
              : "bg-[var(--color-primary)] hover:bg-[var(--color-accent)]"
          }`}
        >
          <Compass className="w-4 h-4" /> {sortByNearest ? "Nearest First" : "Show Nearest"}
        </Button>
      </div>

      {/* Listings */}
      {isLoading ? (
        <div className="text-center text-[var(--color-primary)] mt-10">
          Loading listings...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center mt-10 text-[var(--color-text-muted)]">
          <Package className="w-10 h-10 mx-auto mb-3 opacity-60" />
          <p>No listings found. Try adjusting filters.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <div key={item._id} className="card hover-lift overflow-hidden">
              {item.photoURL && (
                <img
                  src={item.photoURL}
                  alt={item.title}
                  className="w-full h-40 object-cover border-b border-[var(--color-border)] rounded-t-xl"
                  onError={(e) => (e.target.style.display = "none")}
                />
              )}

              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-lg font-semibold">{item.title}</h2>
                  <Badge className={getAvailabilityColor(item.status)}>
                    {item.status}
                  </Badge>
                </div>

                <p className="text-sm text-[var(--color-text-muted)] line-clamp-2 mb-4">
                  {item.description}
                </p>

                <div className="flex items-center gap-2 text-sm mb-1">
                  {getCategoryIcon(item.type)}
                  <span className="capitalize">{item.type}</span>
                </div>
                <div className="flex items-center gap-2 text-sm mb-1">
                  <MapPin className="w-4 h-4" />
                  <span>{item.location?.city}</span>
                </div>

                {item.expiryDate && (
                  <div className="flex items-center gap-2 text-sm mb-3">
                    <Clock className="w-4 h-4" />
                    <span>
                      Expires: {new Date(item.expiryDate).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {item.distance && item.distance !== Infinity && (
                  <div className="text-xs text-[var(--color-text-muted)] mb-2">
                    🧭 {item.distance.toFixed(1)} km away
                  </div>
                )}

                <Button
                  className="w-full bg-gradient-medilink hover:opacity-90 mt-2 text-white font-medium"
                  onClick={() => handleRequestClick(item)}
                  disabled={item.status !== "available"}
                >
                  Request Item
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Request Modal */}
      {isModalOpen && selectedListing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-surface)] rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2">
                Request: {selectedListing.title}
              </h2>
              <p className="text-sm text-[var(--color-text-muted)] mb-6">
                Fill out the form below to request this item.
              </p>

              <RequestForm
                listingId={selectedListing._id}
                listingType={selectedListing.type}
                onSuccess={handleRequestSuccess}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
