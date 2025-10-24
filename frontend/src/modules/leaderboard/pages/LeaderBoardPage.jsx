import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setLeaderboardLoading,
  setLeaderboardData,
  setUserStats,
  setLeaderboardError,
} from "../store/leaderBoardSlice";
import { leaderboardApi } from "../service/leaderboardApi";
import {
  Trophy,
  Medal,
  Award,
  Crown,
  Search,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "../../../shared/components/ui/Card";
import { Input } from "../../../shared/components/ui/Input";
import { Badge } from "../../../shared/components/ui/Badge";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "../../../shared/components/ui/Table";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "../../../shared/components/ui/Avatar";

export const LeaderboardPage = () => {
  const dispatch = useDispatch();
  const { leaderboardData, userStats, leaderboardLoading, error } = useSelector(
    (state) => state.leaderboard
  );

  const [searchQuery, setSearchQuery] = useState("");

  // Fetch leaderboard data and user stats
  useEffect(() => {
    const fetchData = async () => {
      dispatch(setLeaderboardLoading(true));
      try {
        const leaderboardRes = await leaderboardApi.getLeaderboard();
        const statsRes = await leaderboardApi.getUserStats();

        if (leaderboardRes.success)
          dispatch(setLeaderboardData(leaderboardRes.data));
        else dispatch(setLeaderboardError(leaderboardRes.error));

        if (statsRes.success) dispatch(setUserStats(statsRes.data));
      } catch (err) {
        dispatch(setLeaderboardError(err.message));
      }
    };
    fetchData();
  }, [dispatch]);

  // Determine icon for rank
  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return (
          <span className="w-5 h-5 flex items-center justify-center text-sm font-semibold text-gray-400">
            {rank}
          </span>
        );
    }
  };

  const filteredData = leaderboardData?.filter(
    (d) =>
      d?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d?.userId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (leaderboardLoading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 text-lg">
        Loading leaderboard...
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 text-lg">
        {error}
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-6 mb-8 text-center animate-slide-up">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-md">
            <Trophy className="w-6 h-6 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white">MediLink Top Donors</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Celebrating our top contributors helping others with donations.
        </p>
      </div>

      {/* User Stats Card */}
      {userStats && (
        <Card className="mb-8 border-0 shadow-xl bg-gradient-to-r from-blue-600 to-indigo-500 text-white animate-slide-up">
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-3">Your Rank</h2>
            <p className="text-lg">Rank: #{userStats.rank || "-"}</p>
            <p className="text-md">Reputation: {userStats.reputationScore}</p>
            <p className="text-md">Donations: {userStats.donatedCount}</p>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative mb-8 max-w-lg mx-auto animate-fade-in">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search donors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 py-3 rounded-xl shadow-sm border border-gray-700 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Leaderboard Table */}
      <Card className="border-0 shadow-2xl bg-[#0B1120] text-white animate-slide-up">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Complete Rankings</CardTitle>
          <CardDescription className="text-gray-400">
            Top donors and their contributions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table className="text-gray-200">
            <TableHeader>
              <TableRow className="border-b border-gray-700">
                <TableHead className="text-center">Rank</TableHead>
                <TableHead>Donor</TableHead>
                <TableHead className="text-center">Reputation</TableHead>
                <TableHead className="text-center">Items Donated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData?.map((user, index) => (
                <TableRow
                  key={user._id || index}
                  className="hover:bg-gray-800/60 transition-colors duration-200"
                >
                  <TableCell className="text-center">
                    {getRankIcon(index + 1)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-9 h-9">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>
                          {user.name ? user.name[0] : "?"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-semibold text-white">
                        {user.name || "Anonymous"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className="bg-gradient-to-r from-blue-600 to-indigo-500 text-white">
                      {user.reputationScore}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-semibold text-gray-100">
                    {user.donatedCount}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Empty State */}
      {filteredData?.length === 0 && (
        <div className="text-center mt-12 text-gray-400 animate-fade-in">
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-70" />
          <p>No donors found yet.</p>
        </div>
      )}
    </div>
  );
};
