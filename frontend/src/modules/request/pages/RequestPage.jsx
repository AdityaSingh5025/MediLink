import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  FileText,
  User,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageCircle,
  Package,
  Loader2,
  Filter,
  Inbox,
  SendHorizontal,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Gift,
  Check,
  X as XIcon,
  Calendar,
  ChevronDown,
  RefreshCw,
  Heart,
  Star,
} from "lucide-react";
import { requestApi } from "../services/requestApi";
import { setRequests, setLoading as setReduxLoading, setError } from "../store/requestSlice";

export function RequestsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { requests: reduxRequests, loading: reduxLoading } = useSelector((state) => state.request);
  
  const [activeTab, setActiveTab] = useState("received");
  const [statusFilter, setStatusFilter] = useState("all");
  const [myRequests, setMyRequests] = useState([]);
  const [requestsToMe, setRequestsToMe] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch requests with better error handling and state management
  const fetchRequests = useCallback(async (showLoader = true, isRefresh = false) => {
    if (showLoader) {
      setLoading(true);
      dispatch(setReduxLoading(true));
    }
    
    if (isRefresh) {
      setRefreshing(true);
    }

    try {
      const [myRes, receivedRes] = await Promise.all([
        requestApi.getMyRequest("requester"),
        requestApi.getMyRequest("owner"),
      ]);

      // Ensure we always set arrays
      const myData = Array.isArray(myRes?.data) ? myRes.data : [];
      const receivedData = Array.isArray(receivedRes?.data) ? receivedRes.data : [];

      setMyRequests(myData);
      setRequestsToMe(receivedData);
      
      // Update Redux store
      dispatch(setRequests([...myData, ...receivedData]));
      
      if (isRefresh) {
        toast.success("Requests refreshed successfully! ✨");
      }
      
      return { success: true };
    } catch (err) {
      console.error("Fetch error:", err);
      dispatch(setError(err.message));
      
      if (!isRefresh) {
        toast.error("Failed to fetch requests");
      }
      
      setMyRequests([]);
      setRequestsToMe([]);
      return { success: false };
    } finally {
      setLoading(false);
      dispatch(setReduxLoading(false));
      setRefreshing(false);
    }
  }, [dispatch]);

  // Initial fetch
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchRequests(false, false);
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchRequests]);

  // Handle request actions with optimistic updates
  const handleRequestAction = async (requestId, action) => {
    setActionLoading(requestId);
    
    // Optimistic update
    const statusMap = {
      approve: "approved",
      reject: "rejected",
      cancel: "cancelled",
      donated: "awaiting_confirmation",
      complete: "completed"
    };

    const newStatus = statusMap[action];
    
    // Store original state for rollback
    const originalMyRequests = [...myRequests];
    const originalRequestsToMe = [...requestsToMe];
    
    // Apply optimistic update
    setMyRequests(prev => 
      prev.map(req => 
        req._id === requestId ? { ...req, status: newStatus } : req
      )
    );
    
    setRequestsToMe(prev => 
      prev.map(req => 
        req._id === requestId ? { ...req, status: newStatus } : req
      )
    );

    try {
      let res;
      switch (action) {
        case "approve":
          res = await requestApi.approveRequest(requestId);
          break;
        case "reject":
          res = await requestApi.rejectRequest(requestId);
          break;
        case "cancel":
          res = await requestApi.cancelRequest(requestId);
          break;
        case "donated":
          res = await requestApi.markAsDonated(requestId);
          break;
        case "complete":
          res = await requestApi.completeRequest(requestId);
          break;
        default:
          return;
      }

      if (res.success) {
        // Success animation
        toast.success(
          <div className="flex items-center gap-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring" }}
            >
              <CheckCircle className="w-5 h-5 text-green-500" />
            </motion.div>
            <span>Request {action}ed successfully!</span>
          </div>
        );
        
        // Fetch fresh data after a delay
        setTimeout(() => {
          fetchRequests(false, false);
        }, 800);
        
      } else {
        // Rollback on failure
        setMyRequests(originalMyRequests);
        setRequestsToMe(originalRequestsToMe);
        toast.error(res.error || `Failed to ${action} request`);
      }
    } catch (err) {
      // Rollback on error
      setMyRequests(originalMyRequests);
      setRequestsToMe(originalRequestsToMe);
      toast.error(err.message || "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  // Navigate to chat with proper initialization
  const handleNavigateToChat = async (request) => {
    try {
      const loadingToast = toast.loading("Opening chat...");
      
      // Small delay to ensure chat socket is ready
      setTimeout(() => {
        toast.dismiss(loadingToast);
        navigate(`/chat/${request.listingId?._id}`, {
          state: {
            participantName: request.requesterId?.name || request.ownerId?.name,
            listingTitle: request.listingId?.title,
          }
        });
      }, 300);
    } catch (error) {
      toast.error("Failed to open chat");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      approved: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      awaiting_confirmation: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      completed: "bg-green-500/10 text-green-500 border-green-500/20",
      rejected: "bg-red-500/10 text-red-500 border-red-500/20",
      cancelled: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: AlertCircle,
      approved: CheckCircle,
      awaiting_confirmation: Clock,
      completed: Gift,
      rejected: XCircle,
      cancelled: XIcon,
    };
    return icons[status] || AlertCircle;
  };

  const filterRequests = (requests) => {
    const requestsArray = Array.isArray(requests) ? requests : [];
    return statusFilter === "all"
      ? requestsArray
      : requestsArray.filter((r) => r.status === statusFilter);
  };

  const getStats = () => {
    const myRequestsArray = Array.isArray(myRequests) ? myRequests : [];
    const requestsToMeArray = Array.isArray(requestsToMe) ? requestsToMe : [];
    const allRequests = [...myRequestsArray, ...requestsToMeArray];

    return [
      {
        label: "Total Received",
        value: requestsToMeArray.length,
        icon: Inbox,
        color: "from-blue-500 to-cyan-500",
      },
      {
        label: "Total Sent",
        value: myRequestsArray.length,
        icon: SendHorizontal,
        color: "from-purple-500 to-pink-500",
      },
      {
        label: "Completed",
        value: allRequests.filter((r) => r?.status === "completed").length,
        icon: Gift,
        color: "from-green-500 to-emerald-500",
      },
    ];
  };

  const RequestCard = ({ request, isReceived = false }) => {
    if (!request) return null;

    const StatusIcon = getStatusIcon(request.status);
    const isProcessing = actionLoading === request._id;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        whileHover={{ y: -4 }}
        className="bg-surface/80 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden shadow-soft hover:shadow-xl transition-all duration-300 group"
      >
        <div className="p-6">
          <div className="flex gap-4">
            {/* Image */}
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="shrink-0"
            >
              {request.listingId?.photoURL ? (
                <img
                  src={request.listingId.photoURL}
                  alt={request.listingId?.title || "Listing"}
                  className="w-20 h-20 object-cover rounded-xl border-2 border-border"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center border-2 border-border">
                  <Package className="w-10 h-10 text-primary/50" />
                </div>
              )}
            </motion.div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-text mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                    {request.listingId?.title || "Unknown Listing"}
                  </h3>
                  
                  <div className="flex flex-wrap gap-3 text-sm text-muted mb-3">
                    <motion.div 
                      className="flex items-center gap-1.5"
                      whileHover={{ scale: 1.05 }}
                    >
                      <User className="w-4 h-4 text-primary" />
                      <span>
                        {isReceived
                          ? request.requesterId?.name || "Unknown"
                          : request.ownerId?.name || "Unknown"}
                      </span>
                    </motion.div>
                    
                    {request.listingId?.location?.city && (
                      <motion.div 
                        className="flex items-center gap-1.5"
                        whileHover={{ scale: 1.05 }}
                      >
                        <MapPin className="w-4 h-4 text-primary" />
                        <span>{request.listingId.location.city}</span>
                      </motion.div>
                    )}
                    
                    <motion.div 
                      className="flex items-center gap-1.5"
                      whileHover={{ scale: 1.05 }}
                    >
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                    </motion.div>
                  </div>

                  {request.message && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-muted bg-background/50 rounded-lg p-3 mb-3 line-clamp-2"
                    >
                      "{request.message}"
                    </motion.p>
                  )}

                  {request.prescriptionDoc && (
                    <motion.a
                      href={request.prescriptionDoc}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05, x: 5 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-flex items-center gap-2 text-xs text-primary hover:text-accent transition-colors bg-primary/10 px-3 py-1.5 rounded-lg"
                    >
                      <FileText className="w-3 h-3" />
                      View Prescription
                    </motion.a>
                  )}
                </div>

                <motion.span
                  whileHover={{ scale: 1.1 }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border capitalize whitespace-nowrap flex items-center gap-1.5 ${getStatusColor(
                    request.status
                  )}`}
                >
                  <StatusIcon className="w-3.5 h-3.5" />
                  {request.status.replace("_", " ")}
                </motion.span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-3 border-t border-border/50">
                {/* Donor Actions */}
                {isReceived && request.status === "pending" && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleRequestAction(request._id, "approve")}
                      disabled={isProcessing}
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {isProcessing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ThumbsUp className="w-4 h-4" />
                      )}
                      Approve
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleRequestAction(request._id, "reject")}
                      disabled={isProcessing}
                      className="px-4 py-2 bg-surface border border-red-500/20 text-red-500 rounded-lg font-medium hover:bg-red-500/10 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      <ThumbsDown className="w-4 h-4" />
                      Reject
                    </motion.button>
                  </>
                )}

                {isReceived && request.status === "approved" && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleRequestAction(request._id, "donated")}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Gift className="w-4 h-4" />
                    )}
                    Mark as Donated
                  </motion.button>
                )}

                {/* Recipient Actions */}
                {!isReceived && request.status === "awaiting_confirmation" && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleRequestAction(request._id, "complete")}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Confirm Received
                  </motion.button>
                )}

                {!isReceived && request.status === "pending" && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleRequestAction(request._id, "cancel")}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-surface border border-border text-text rounded-lg font-medium hover:bg-background transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    <XIcon className="w-4 h-4" />
                    Cancel
                  </motion.button>
                )}

                {/* Chat Button */}
                {(request.status === "approved" ||
                  request.status === "completed" ||
                  request.status === "awaiting_confirmation") && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleNavigateToChat(request)}
                    className="px-4 py-2 bg-primary/10 text-primary rounded-lg font-medium hover:bg-primary/20 transition-all flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Message
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Shine Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"
          style={{ transform: "skewX(-20deg)" }}
        />
      </motion.div>
    );
  };

  const stats = getStats();

  if (loading && myRequests.length === 0 && requestsToMe.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-surface/10 to-background flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="w-16 h-16 text-primary mx-auto" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-muted mt-4 text-lg"
          >
            Loading requests...
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface/10 to-background py-8 px-4 sm:px-6 lg:px-8">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
          }}
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.05, 0.15, 0.05],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            delay: 5,
          }}
          className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-accent/20 to-primary/20 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header with Refresh Button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex justify-between items-start"
        >
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-3">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Requests Dashboard
              </span>
            </h1>
            <p className="text-muted text-lg">
              Manage your donation requests and connections
            </p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => fetchRequests(false, true)}
            disabled={refreshing}
            className="p-3 bg-surface hover:bg-background rounded-xl transition-all shadow-soft hover:shadow-xl"
            title="Refresh requests"
          >
            <RefreshCw className={`w-5 h-5 text-primary ${refreshing ? 'animate-spin' : ''}`} />
          </motion.button>
        </motion.div>

        {/* Stats Cards with Animation */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-surface/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-soft hover:shadow-xl transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted mb-1 font-medium">
                    {stat.label}
                  </p>
                  <motion.p 
                    className="text-3xl font-bold text-text"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: index * 0.1 + 0.2 }}
                  >
                    {stat.value}
                  </motion.p>
                </div>
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
                >
                  <stat.icon className="w-7 h-7 text-white" />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-surface/80 backdrop-blur-sm border border-border/50 rounded-2xl shadow-soft p-6 mb-6"
        >
          {/* Tabs */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab("received")}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === "received"
                  ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg"
                  : "bg-background text-muted hover:text-text"
              }`}
            >
              <Inbox className="w-5 h-5 inline mr-2" />
              Requests to Me ({Array.isArray(requestsToMe) ? requestsToMe.length : 0})
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab("sent")}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === "sent"
                  ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg"
                  : "bg-background text-muted hover:text-text"
              }`}
            >
              <SendHorizontal className="w-5 h-5 inline mr-2" />
              My Requests ({Array.isArray(myRequests) ? myRequests.length : 0})
            </motion.button>
          </div>

          {/* Filter */}
          <div className="space-y-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex sm:hidden items-center justify-between w-full px-4 py-2 bg-background rounded-xl text-text font-medium"
            >
              <span className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter by Status
              </span>
              <motion.div
                animate={{ rotate: showFilters ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="w-5 h-5" />
              </motion.div>
            </button>

            <motion.div
              initial={false}
              animate={{
                height: showFilters || window.innerWidth >= 640 ? "auto" : 0,
                opacity: showFilters || window.innerWidth >= 640 ? 1 : 0,
              }}
              className="overflow-hidden"
            >
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-64 px-4 py-2 bg-background border border-border rounded-xl text-text focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="awaiting_confirmation">Awaiting Confirmation</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </motion.div>
          </div>
        </motion.div>

        {/* Requests List */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {activeTab === "received" ? (
              filterRequests(requestsToMe).length > 0 ? (
                filterRequests(requestsToMe).map((request, index) => (
                  <RequestCard 
                    key={request._id || index} 
                    request={request} 
                    isReceived 
                  />
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="text-center py-16"
                >
                  <motion.div
                    animate={{ 
                      y: [0, -10, 0],
                      rotate: [0, 5, -5, 0] 
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity 
                    }}
                  >
                    <Inbox className="w-20 h-20 text-muted/30 mx-auto mb-4" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-text mb-2">
                    No requests received yet
                  </h3>
                  <p className="text-muted">
                    Requests from others will appear here
                  </p>
                </motion.div>
              )
            ) : filterRequests(myRequests).length > 0 ? (
              filterRequests(myRequests).map((request, index) => (
                <RequestCard 
                  key={request._id || index} 
                  request={request} 
                />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-16"
              >
                <motion.div
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, -5, 5, 0] 
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity 
                  }}
                >
                  <SendHorizontal className="w-20 h-20 text-muted/30 mx-auto mb-4" />
                </motion.div>
                <h3 className="text-xl font-semibold text-text mb-2">
                  No requests sent yet
                </h3>
                <p className="text-muted">
                  Start requesting items to see them here
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}