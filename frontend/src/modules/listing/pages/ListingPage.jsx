import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { listingApi } from "../services/listingApi";
import { setListing, setLoading } from "../store/listingSlice";
import { toast } from "sonner";
import {
  MapPin,
  Clock,
  Package,
  Pill,
  Stethoscope,
  Search,
  X,
  Navigation,
  Plus,
  Filter,
  Loader2,
  Eye,
  Calendar,
  AlertCircle,
  List,
  Heart,
  TrendingUp,
  Sparkles,
  ChevronDown,
  MapPinned,
} from "lucide-react";
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
  const [selectedStatus, setSelectedStatus] = useState("available");
  const [filtered, setFiltered] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  // Location-based filtering
  const [userLocation, setUserLocation] = useState(null);
  const [sortByNearest, setSortByNearest] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  // Selected listing for request modal
  const [selectedListing, setSelectedListing] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Fetch all listings
  useEffect(() => {
    const fetchListings = async () => {
      dispatch(setLoading(true));
      const result = await listingApi.getAllListings();
      if (result.success) {
        const data = Array.isArray(result.data) ? result.data : [];
        dispatch(setListing(data));
        setFiltered(data);
      } else {
        toast.error(result.error || "Failed to load listings");
      }
      dispatch(setLoading(false));
    };
    fetchListings();
  }, [dispatch]);

  // Distance calculator
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
    const R = 6371;
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
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === "all" || item.type === selectedType;
      const matchesCity =
        selectedCity === "all" || item.location?.city === selectedCity;
      const matchesStatus =
        selectedStatus === "all" || item.status === selectedStatus;
      const isNotMyListing =
        String(item.ownerId?._id || item.ownerId) !== String(currentUserId);

      return (
        matchesSearch &&
        matchesType &&
        matchesCity &&
        matchesStatus &&
        isNotMyListing
      );
    });

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
    selectedStatus,
    listing,
    currentUserId,
    sortByNearest,
    userLocation,
  ]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }

    setGettingLocation(true);
    const loadingToast = toast.loading("Getting your location...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        toast.dismiss(loadingToast);
        toast.success("Showing nearest items! 📍");
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setSortByNearest(true);
        setGettingLocation(false);
      },
      (err) => {
        toast.dismiss(loadingToast);
        toast.error("Location access denied");
        console.error("Location error:", err);
        setGettingLocation(false);
      }
    );
  };

  const handleClearLocation = () => {
    setUserLocation(null);
    setSortByNearest(false);
    toast.message("Location filter cleared");
  };

  const handleRequestClick = (item) => {
    setSelectedListing(item);
    setShowRequestModal(true);
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

  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const daysUntilExpiry = Math.ceil(
      (new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const cities = [
    "all",
    ...new Set(listing.map((l) => l.location?.city).filter(Boolean)),
  ];
  const types = ["all", "medicine", "equipment"];
  const statuses = ["all", "available", "reserved", "donated"];

  // Quick stats
  const stats = [
    {
      label: "Total Available",
      value: filtered.filter((l) => l.status === "available").length,
      icon: Package,
      color: "from-green-500 to-emerald-500",
    },
    {
      label: "Medicine",
      value: filtered.filter((l) => l.type === "medicine").length,
      icon: Pill,
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "Equipment",
      value: filtered.filter((l) => l.type === "equipment").length,
      icon: Stethoscope,
      color: "from-purple-500 to-pink-500",
    },
  ];

  // Container variants for stagger effect
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface/10 to-background py-6 sm:py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
            rotate: [0, 180, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.15, 0.1],
            rotate: [0, -180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-accent/20 to-primary/20 rounded-full blur-3xl"
        />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient bg-300%">
                Medical Donations
              </span>
            </motion.h1>
            <motion.p
              className="text-muted text-lg max-w-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Browse available medicines and equipment near you 💊
            </motion.p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            className="flex gap-3"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <motion.button
              whileHover={{ scale: 1.05, rotate: 2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/dashboard/my-listings")}
              className="group flex items-center gap-2 px-5 py-3 bg-surface/80 backdrop-blur-sm border-2 border-primary/20 text-primary rounded-2xl font-semibold hover:bg-primary/10 hover:border-primary/40 transition-all shadow-lg hover:shadow-xl"
            >
              <List className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span className="hidden sm:inline">My Listings</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, rotate: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/dashboard/create-listing")}
              className="group flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              <span className="hidden sm:inline">Create Listing</span>
            </motion.button>
          </motion.div>
        </div>

        {/* Quick Stats */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-3 gap-4 mb-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -5 }}
              className="relative overflow-hidden bg-surface/50 backdrop-blur-sm border border-border/50 rounded-2xl p-4 sm:p-6 shadow-soft hover:shadow-xl transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted mb-1 font-medium">
                    {stat.label}
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-text">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all`}
                >
                  <stat.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
              </div>
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity -z-10"
                initial={false}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-surface/80 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl p-6 sm:p-8"
        >
          {/* Search Bar */}
          <motion.div
            className="relative mb-6"
            animate={{
              scale: searchFocused ? 1.02 : 1,
            }}
            transition={{ duration: 0.2 }}
          >
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input
              type="text"
              placeholder="Search by title, description, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-full pl-14 pr-12 py-4 bg-background/50 border-2 border-border rounded-2xl text-text placeholder-muted focus:border-primary focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all text-lg"
            />
            <AnimatePresence>
              {searchQuery && (
                <motion.button
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-background rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-muted" />
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Filter Toggle (Mobile) */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowFilters(!showFilters)}
            className="flex sm:hidden items-center justify-between w-full px-5 py-3 bg-background/50 border border-border rounded-2xl text-text mb-4 font-medium"
          >
            <span className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </span>
            <motion.div
              animate={{ rotate: showFilters ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="w-5 h-5" />
            </motion.div>
          </motion.button>

          {/* Filters */}
          <motion.div
            initial={false}
            animate={{
              height: showFilters || window.innerWidth >= 640 ? "auto" : 0,
              opacity: showFilters || window.innerWidth >= 640 ? 1 : 0,
            }}
            transition={{ duration: 0.3 }}
            className={`${
              showFilters ? "flex" : "hidden"
            } sm:flex flex-col sm:flex-row gap-4 overflow-hidden`}
          >
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="flex-1 px-4 py-3 bg-background/50 border border-border rounded-xl text-text focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all cursor-pointer"
            >
              {types.map((type) => (
                <option key={type} value={type}>
                  {type === "all"
                    ? "All Types"
                    : type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="flex-1 px-4 py-3 bg-background/50 border border-border rounded-xl text-text focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all cursor-pointer"
            >
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city === "all" ? "All Cities" : city}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="flex-1 px-4 py-3 bg-background/50 border border-border rounded-xl text-text focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all cursor-pointer"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status === "all"
                    ? "All Status"
                    : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>

            {!sortByNearest ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGetLocation}
                disabled={gettingLocation}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 whitespace-nowrap"
              >
                {gettingLocation ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Navigation className="w-5 h-5" />
                )}
                <span className="hidden sm:inline">Show Nearest</span>
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClearLocation}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all whitespace-nowrap"
              >
                <MapPinned className="w-5 h-5" />
                <span className="hidden sm:inline">Clear Location</span>
              </motion.button>
            )}
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Listings Grid */}
      <div className="max-w-7xl mx-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <motion.div
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <Loader2 className="w-16 h-16 text-primary" />
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-muted mt-4 text-lg"
            >
              Loading amazing donations...
            </motion.p>
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Package className="w-24 h-24 text-muted/30 mb-6" />
            </motion.div>
            <h3 className="text-2xl font-bold text-text mb-2">
              No listings found
            </h3>
            <p className="text-muted text-center max-w-md">
              Try adjusting your filters or search query to find what you're
              looking for.
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence>
              {filtered.map((item, index) => {
                const Icon = getCategoryIcon(item.type);
                return (
                  <motion.div
                    key={item._id}
                    variants={itemVariants}
                    layout
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ y: -12, scale: 1.02 }}
                    className="group bg-surface/80 backdrop-blur-sm border border-border/50 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 relative"
                  >
                    {/* Image */}
                    <div className="relative h-52 bg-gradient-to-br from-primary/20 to-accent/20 overflow-hidden">
                      {item.photoURL ? (
                        <motion.img
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.6 }}
                          src={item.photoURL}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <motion.div
                            animate={{
                              rotate: [0, 360],
                            }}
                            transition={{
                              duration: 20,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          >
                            <Icon className="w-24 h-24 text-primary/20" />
                          </motion.div>
                        </div>
                      )}

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      {/* Status Badge */}
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="absolute top-3 right-3"
                      >
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-bold border backdrop-blur-md capitalize shadow-lg ${getStatusColor(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </motion.div>

                      {/* Type Badge */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="absolute top-3 left-3"
                      >
                        <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-background/90 backdrop-blur-md border border-border capitalize flex items-center gap-2 shadow-lg">
                          <Icon className="w-4 h-4" />
                          {item.type}
                        </span>
                      </motion.div>

                      {/* Expiry Warning */}
                      {item.type === "medicine" &&
                        isExpiringSoon(item.expiryDate) && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="absolute bottom-3 left-3 right-3"
                          >
                            <motion.div
                              animate={{
                                scale: [1, 1.05, 1],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                              }}
                              className="bg-orange-500/95 backdrop-blur-md text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg"
                            >
                              <AlertCircle className="w-4 h-4" />
                              Expiring Soon
                            </motion.div>
                          </motion.div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                      <motion.h3
                        className="font-bold text-text text-xl line-clamp-1 group-hover:text-primary transition-colors"
                        whileHover={{ x: 5 }}
                      >
                        {item.title}
                      </motion.h3>

                      <p className="text-sm text-muted line-clamp-2 min-h-[40px]">
                        {item.description}
                      </p>

                      {/* Meta Info */}
                      <div className="space-y-2 text-xs text-muted pt-2 border-t border-border/50">
                        <motion.div
                          className="flex items-center gap-2"
                          whileHover={{ x: 5 }}
                        >
                          <MapPin className="w-4 h-4 text-primary" />
                          <span>{item.location?.city || "Unknown"}</span>
                        </motion.div>

                        {item.type === "medicine" && item.expiryDate && (
                          <motion.div
                            className="flex items-center gap-2"
                            whileHover={{ x: 5 }}
                          >
                            <Calendar className="w-4 h-4 text-primary" />
                            <span>
                              Expires:{" "}
                              {new Date(item.expiryDate).toLocaleDateString()}
                            </span>
                          </motion.div>
                        )}

                        {item.distance && item.distance !== Infinity && (
                          <motion.div
                            className="flex items-center gap-2"
                            whileHover={{ x: 5 }}
                            animate={{
                              scale: [1, 1.1, 1],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                            }}
                          >
                            <Navigation className="w-4 h-4 text-green-500" />
                            <span className="text-green-500 font-bold">
                              {item.distance.toFixed(1)} km away
                            </span>
                          </motion.div>
                        )}

                        <motion.div
                          className="flex items-center gap-2"
                          whileHover={{ x: 5 }}
                        >
                          <Clock className="w-4 h-4 text-primary" />
                          <span>
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </motion.div>
                      </div>

                      {/* Action Button */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleRequestClick(item)}
                        disabled={item.status !== "available"}
                        className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                      >
                        <Eye className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        {item.status === "available"
                          ? "Request Item"
                          : "Not Available"}
                      </motion.button>
                    </div>

                    {/* Shine Effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"
                      style={{
                        transform: "skewX(-20deg)",
                      }}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {showRequestModal && selectedListing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={() => setShowRequestModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface/95 backdrop-blur-xl border border-border rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-surface/95 backdrop-blur-xl border-b border-border p-6 flex items-center justify-between z-10">
                <div className="flex-1 pr-4">
                  <h2 className="text-2xl font-bold text-text mb-1">
                    Request: {selectedListing.title}
                  </h2>
                  <p className="text-sm text-muted">
                    Fill out the form to request this item
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowRequestModal(false)}
                  className="p-2 hover:bg-background rounded-xl transition-colors flex-shrink-0"
                >
                  <X className="w-6 h-6 text-muted" />
                </motion.button>
              </div>

              {/* Listing Preview */}
              <div className="px-6 pt-4 pb-2">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-background/50 border border-border/50 rounded-2xl p-4 flex gap-4"
                >
                  {/* Image */}
                  <div className="shrink-0">
                    {selectedListing.photoURL ? (
                      <img
                        src={selectedListing.photoURL}
                        alt={selectedListing.title}
                        className="w-20 h-20 object-cover rounded-xl border border-border"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center">
                        <Package className="w-10 h-10 text-primary/50" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-text mb-2">
                      {selectedListing.title}
                    </h3>
                    <div className="flex flex-wrap gap-3 text-sm text-muted">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span>
                          {selectedListing.location?.city || "Unknown"}
                        </span>
                      </div>
                      {selectedListing.type === "medicine" &&
                        selectedListing.expiryDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span>
                              Expires:{" "}
                              {new Date(
                                selectedListing.expiryDate
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                    </div>
                    <p className="text-xs text-muted mt-2 line-clamp-2">
                      {selectedListing.description}
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Request Form */}
              <div className="p-6">
                <RequestForm
                  listingId={selectedListing._id}
                  listingType={selectedListing.type}
                  onSuccess={(data) => {
                    console.log("Request created:", data);
                    setShowRequestModal(false);
                    toast.success("Request submitted successfully! 🎉");
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
