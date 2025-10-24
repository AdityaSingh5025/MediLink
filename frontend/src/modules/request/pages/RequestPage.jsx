import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../shared/components/ui/Button";
import { Card, CardContent } from "../../../shared/components/ui/Card";
import { Badge } from "../../../shared/components/ui/Badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../shared/components/ui/Tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../shared/components/ui/Select";
import { Alert, AlertDescription } from "../../../shared/components/ui/Alert";
import { toast } from "sonner";
import {
  FileText,
  User,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  MessageCircle,
  Package,
} from "lucide-react";
import { requestApi } from "../services/requestApi";

export function RequestsPage() {
  const [activeTab, setActiveTab] = useState("received");
  const [statusFilter, setStatusFilter] = useState("all");
  const [myRequests, setMyRequests] = useState([]);
  const [requestsToMe, setRequestsToMe] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch all requests
  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const myRes = await requestApi.getMyRequest("requester");
        setMyRequests(myRes.success ? myRes.data : []);

        const receivedRes = await requestApi.getMyRequest("owner");
        setRequestsToMe(receivedRes.success ? receivedRes.data : []);
      } catch (err) {
        console.error("Fetch error:", err);
        toast.error("Failed to fetch requests");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  //  Approve / Reject
  const handleRequestAction = async (requestId, action) => {
    try {
      const res =
        action === "approve"
          ? await requestApi.approveRequest(requestId)
          : await requestApi.rejectRequest(requestId);

      if (res.success) {
        toast.success(`Request ${action}d successfully!`);
        setRequestsToMe((prev) =>
          prev.map((r) =>
            r._id === requestId
              ? { ...r, status: action === "approve" ? "approved" : "rejected" }
              : r
          )
        );
      } else {
        toast.error(res.error || `Failed to ${action} request`);
      }
    } catch (err) {
      toast.error(err.message || "Action failed");
    }
  };

  //  Cancel
  const handleCancelRequest = async (requestId) => {
    const res = await requestApi.cancelRequest(requestId);
    if (res.success) {
      toast.success("Request cancelled successfully!");
      setMyRequests((prev) => prev.filter((r) => r._id !== requestId));
    } else {
      toast.error(res.error || "Failed to cancel request");
    }
  };

  //  Mark as Donated (Donor)
  const handleMarkAsDonated = async (requestId) => {
    try {
      const res = await requestApi.markAsDonated(requestId);
      if (res.success) {
        toast.success("Donation marked — awaiting recipient confirmation.");
        setRequestsToMe((prev) =>
          prev.map((r) =>
            r._id === requestId
              ? { ...r, status: "awaiting_confirmation" }
              : r
          )
        );
      } else {
        toast.error(res.error || "Failed to mark as donated");
      }
    } catch (err) {
      toast.error(err.message || "Error marking as donated");
    }
  };

  //  Confirm Received (Recipient)
  const handleConfirmDonation = async (requestId) => {
    try {
      const res = await requestApi.completeRequest(requestId);
      if (res.success) {
        toast.success("Donation confirmed 🎉");
        setMyRequests((prev) =>
          prev.map((r) =>
            r._id === requestId ? { ...r, status: "completed" } : r
          )
        );
      } else {
        toast.error(res.error || "Failed to confirm donation");
      }
    } catch (err) {
      toast.error("Something went wrong while confirming donation");
    }
  };

  // Helpers
  const filterRequests = (requests) =>
    statusFilter === "all"
      ? requests
      : requests.filter((r) => r.status === statusFilter);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-blue-100 text-blue-800";
      case "awaiting_confirmation":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return AlertCircle;
      case "approved":
      case "completed":
      case "awaiting_confirmation":
        return CheckCircle;
      case "rejected":
      case "cancelled":
        return XCircle;
      default:
        return AlertCircle;
    }
  };

  //  Request Card Component
  const RequestCard = ({ request, isReceived = false }) => {
    const StatusIcon = getStatusIcon(request.status);
    return (
      <Card className="hover-lift animate-slide-up border-0 shadow-lg mb-4">
        <CardContent className="p-6">
          <div className="flex gap-4">
            {/* Image */}
            <div className="shrink-0">
              {request.listingId?.photoURL ? (
                <img
                  src={request.listingId.photoURL}
                  alt={request.listingId?.title || "Listing"}
                  className="w-16 h-16 object-cover rounded-lg"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg mb-1">
                    {request.listingId?.title || "Unknown Listing"}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span>
                      {isReceived
                        ? request.requesterId?.name
                        : request.ownerId?.name}
                    </span>
                  </div>
                </div>
                <Badge className={getStatusColor(request.status)}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {request.status.replace("_", " ")}
                </Badge>
              </div>

              {/* Buttons */}
              <div className="flex flex-wrap gap-2 mt-3">
                {/* Donor side */}
                {isReceived && request.status === "pending" && (
                  <>
                    <Button
                      size="sm"
                      className="bg-blue-600 text-white"
                      onClick={() => handleRequestAction(request._id, "approve")}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRequestAction(request._id, "reject")}
                    >
                      Reject
                    </Button>
                  </>
                )}

                {isReceived && request.status === "approved" && (
                  <Button
                    size="sm"
                    className="bg-green-600 text-white hover:bg-green-700"
                    onClick={() => handleMarkAsDonated(request._id)}
                  >
                    Mark as Donated
                  </Button>
                )}

                {/* Recipient side */}
                {!isReceived && request.status === "awaiting_confirmation" && (
                  <>
                    <Button
                      size="sm"
                      className="bg-green-600 text-white hover:bg-green-700"
                      onClick={() => handleConfirmDonation(request._id)}
                    >
                      ✅ Yes, I received it
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        toast.info("Please contact the donor if not yet received.")
                      }
                    >
                      ❌ Not yet
                    </Button>
                  </>
                )}

                {!isReceived && request.status === "pending" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCancelRequest(request._id)}
                  >
                    Cancel Request
                  </Button>
                )}

                {(request.status === "approved" ||
                  request.status === "completed" ||
                  request.status === "awaiting_confirmation") && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/chat/${request.listingId?._id}`)}
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Message
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-600 animate-pulse">Loading requests...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Requests Dashboard</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="received">Requests to Me</TabsTrigger>
          <TabsTrigger value="sent">My Requests</TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="awaiting_confirmation">
                Awaiting Confirmation
              </SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Requests To Me */}
        <TabsContent value="received">
          {filterRequests(requestsToMe).length > 0 ? (
            filterRequests(requestsToMe).map((r, i) => (
              <RequestCard key={r._id || i} request={r} isReceived />
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">
              No requests received yet.
            </p>
          )}
        </TabsContent>

        {/* My Requests */}
        <TabsContent value="sent">
          {filterRequests(myRequests).length > 0 ? (
            filterRequests(myRequests).map((r, i) => (
              <RequestCard key={r._id || i} request={r} />
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">
              You haven't made any requests yet.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
