import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
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
  Users,
  Gift,
  Loader2,
  ChevronUp,
  Sparkles,
  Star,
  Zap,
  Heart,
  TrendingUp,
  Flame,
  Target,
} from "lucide-react";

export const LeaderboardPage = () => {
  const dispatch = useDispatch();
  const { leaderboardData, userStats, leaderboardLoading, error } = useSelector(
    (state) => state.leaderboard
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredRank, setHoveredRank] = useState(null);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      dispatch(setLeaderboardLoading(true));
      try {
        const [leaderboardRes, statsRes] = await Promise.all([
          leaderboardApi.getLeaderboard(),
          leaderboardApi.getUserStats(),
        ]);

        if (leaderboardRes.success) {
          dispatch(setLeaderboardData(leaderboardRes.data || []));
        } else {
          dispatch(setLeaderboardError(leaderboardRes.error));
        }

        if (statsRes.success) {
          dispatch(setUserStats(statsRes.data));
        }
      } catch (err) {
        dispatch(setLeaderboardError(err.message));
      }
    };
    fetchData();
  }, [dispatch]);

  // Calculate stats
  const globalStats = useMemo(() => {
    if (!leaderboardData || leaderboardData.length === 0) return null;

    const totalDonations = leaderboardData.reduce(
      (sum, user) => sum + (user.donatedCount || 0),
      0
    );

    return {
      totalUsers: leaderboardData.length,
      totalDonations,
      topDonor: leaderboardData[0],
    };
  }, [leaderboardData]);

  // Get rank medal
  const getRankMedal = (rank) => {
    switch (rank) {
      case 1:
        return {
          icon: Crown,
          color: "text-yellow-400",
          glow: "shadow-yellow-500/50",
        };
      case 2:
        return {
          icon: Medal,
          color: "text-gray-300",
          glow: "shadow-gray-400/50",
        };
      case 3:
        return {
          icon: Award,
          color: "text-amber-600",
          glow: "shadow-amber-500/50",
        };
      default:
        return null;
    }
  };

  // Get rank colors
  const getRankColors = (rank) => {
    if (rank === 1)
      return {
        gradient: "from-yellow-400 via-amber-500 to-yellow-600",
        border: "border-yellow-400",
        bg: "bg-yellow-500/10",
        text: "text-yellow-400",
      };
    if (rank === 2)
      return {
        gradient: "from-gray-300 via-gray-400 to-gray-500",
        border: "border-gray-400",
        bg: "bg-gray-500/10",
        text: "text-gray-300",
      };
    if (rank === 3)
      return {
        gradient: "from-amber-500 via-orange-500 to-amber-600",
        border: "border-amber-500",
        bg: "bg-amber-500/10",
        text: "text-amber-500",
      };
    if (rank <= 10)
      return {
        gradient: "from-blue-500 to-cyan-500",
        border: "border-blue-500",
        bg: "bg-blue-500/10",
        text: "text-blue-400",
      };
    return {
      gradient: "from-primary/30 to-accent/30",
      border: "border-border",
      bg: "bg-surface/50",
      text: "text-muted",
    };
  };

  // Filter data
  const filteredData = useMemo(() => {
    let data = leaderboardData || [];
    if (searchQuery) {
      data = data.filter((d) =>
        d?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return data;
  }, [leaderboardData, searchQuery]);

  // Particles component
  const Particles = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-primary/30 rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
        />
      ))}
    </div>
  );

  // Loading state
  if (
    leaderboardLoading &&
    (!leaderboardData || leaderboardData.length === 0)
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-surface/10 to-background relative overflow-hidden">
        <Particles />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center relative z-10"
        >
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.2, 1],
            }}
            transition={{
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1.5, repeat: Infinity },
            }}
          >
            <Trophy className="w-20 h-20 text-primary mx-auto mb-6" />
          </motion.div>
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-muted text-xl font-medium"
          >
            Loading Hall of Heroes...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error && (!leaderboardData || leaderboardData.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-surface/10 to-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5 }}
            className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Trophy className="w-12 h-12 text-red-500" />
          </motion.div>
          <h2 className="text-3xl font-bold text-text mb-2">Oops!</h2>
          <p className="text-red-500 text-lg">{error}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface/10 to-background py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 90, 0],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-40 -right-40 w-[800px] h-[800px] bg-gradient-to-br from-primary/30 to-accent/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute -bottom-40 -left-40 w-[700px] h-[700px] bg-gradient-to-tr from-accent/30 to-primary/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            delay: 5,
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl"
        />
      </div>

      <Particles />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="inline-block mb-8 relative"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 360],
              }}
              transition={{
                scale: { duration: 2, repeat: Infinity },
                rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              }}
              className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full blur-2xl opacity-50"
            />
            <div className="relative w-28 h-28 bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 rounded-full flex items-center justify-center shadow-2xl">
              <Trophy className="w-14 h-14 text-white" />
            </div>
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-2 -right-2"
            >
              <Sparkles className="w-8 h-8 text-yellow-400" />
            </motion.div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black mb-4"
          >
            <motion.span
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{ duration: 5, repeat: Infinity }}
              className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:200%_auto]"
            >
              Hall of Heroes
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-muted text-lg sm:text-xl max-w-3xl mx-auto"
          >
            Celebrating our amazing donors making the world a better place 🌟
          </motion.p>
        </motion.div>

        {/* Global Stats */}
        {globalStats && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16"
          >
            {[
              {
                label: "Total Heroes",
                value: globalStats.totalUsers,
                icon: Users,
                gradient: "from-blue-500 via-cyan-500 to-blue-600",
                delay: 0.1,
              },
              {
                label: "Total Donations",
                value: globalStats.totalDonations,
                icon: Gift,
                gradient: "from-purple-500 via-pink-500 to-purple-600",
                delay: 0.2,
              },
              {
                label: "Top Hero",
                value: globalStats.topDonor?.name?.split(" ")[0] || "N/A",
                icon: Crown,
                gradient: "from-amber-500 via-yellow-500 to-amber-600",
                delay: 0.3,
              },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: stat.delay, type: "spring" }}
                whileHover={{ scale: 1.05, y: -10 }}
                className="relative group"
              >
                <motion.div
                  animate={{
                    boxShadow: [
                      "0 0 20px rgba(var(--primary-rgb), 0.2)",
                      "0 0 40px rgba(var(--primary-rgb), 0.4)",
                      "0 0 20px rgba(var(--primary-rgb), 0.2)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="relative bg-surface/80 backdrop-blur-xl border border-border/50 rounded-3xl p-8 overflow-hidden"
                >
                  {/* Gradient overlay */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5 group-hover:opacity-10 transition-opacity`}
                  />

                  <div className="relative z-10">
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.2 }}
                      transition={{ duration: 0.6 }}
                      className={`w-16 h-16 bg-gradient-to-br ${stat.gradient} rounded-2xl flex items-center justify-center mb-4 shadow-xl`}
                    >
                      <stat.icon className="w-8 h-8 text-white" />
                    </motion.div>

                    <p className="text-sm text-muted font-medium mb-2">
                      {stat.label}
                    </p>

                    <motion.p
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: stat.delay + 0.3, type: "spring" }}
                      className="text-4xl font-black bg-gradient-to-r from-text to-text/70 bg-clip-text text-transparent"
                    >
                      {stat.value}
                    </motion.p>
                  </div>

                  {/* Shine effect */}
                  <motion.div
                    animate={{
                      x: ["-100%", "200%"],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatDelay: 2,
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
                  />
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* User Stats Card */}
        <AnimatePresence>
          {userStats && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -30 }}
              transition={{ type: "spring", delay: 0.7 }}
              className="mb-12"
            >
              <div className="relative group">
                <motion.div
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 30,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-primary rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"
                />

                <div className="relative bg-surface/95 backdrop-blur-2xl rounded-3xl p-8 border border-border/50 overflow-hidden">
                  <div className="flex flex-col sm:flex-row items-center gap-8">
                    {/* Avatar */}
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                      transition={{ duration: 0.5 }}
                      className="relative"
                    >
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          rotate: [0, 360],
                        }}
                        transition={{
                          scale: { duration: 2, repeat: Infinity },
                          rotate: {
                            duration: 20,
                            repeat: Infinity,
                            ease: "linear",
                          },
                        }}
                        className="absolute -inset-4 bg-gradient-to-r from-primary to-accent rounded-full blur-2xl opacity-50"
                      />

                      <div className="relative w-28 h-28 rounded-full border-4 border-primary/30 overflow-hidden shadow-2xl">
                        <img
                          src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                            userStats.name || "User"
                          )}`}
                          alt={userStats.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-xl"
                      >
                        <Crown className="w-5 h-5 text-white" />
                      </motion.div>
                    </motion.div>

                    {/* Info */}
                    <div className="flex-1 text-center sm:text-left">
                      <motion.h3
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 }}
                        className="text-3xl font-black text-text mb-2"
                      >
                        {userStats.name || "Anonymous"}
                      </motion.h3>

                      <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.9, type: "spring" }}
                          whileHover={{ scale: 1.1 }}
                          className="flex items-center gap-3 bg-gradient-to-r from-primary/20 to-accent/20 px-6 py-3 rounded-2xl border border-primary/30"
                        >
                          <Target className="w-6 h-6 text-primary" />
                          <div>
                            <p className="text-xs text-muted font-medium">
                              Your Rank
                            </p>
                            <p className="text-2xl font-black text-text">
                              #{userStats.rank || "-"}
                            </p>
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 1, type: "spring" }}
                          whileHover={{ scale: 1.1 }}
                          className="flex items-center gap-3 bg-gradient-to-r from-pink-500/20 to-purple-500/20 px-6 py-3 rounded-2xl border border-pink-500/30"
                        >
                          <Heart className="w-6 h-6 text-pink-500" />
                          <div>
                            <p className="text-xs text-muted font-medium">
                              Donations
                            </p>
                            <p className="text-2xl font-black text-text">
                              {userStats.donatedCount || 0}
                            </p>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-12 relative"
        >
          <div className="relative max-w-2xl mx-auto">
            <motion.div whileFocus={{ scale: 1.02 }} className="relative">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-muted w-6 h-6" />
              <input
                placeholder="Search heroes by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-16 pr-6 py-5 bg-surface/80 backdrop-blur-xl border-2 border-border/50 rounded-3xl text-text text-lg placeholder-muted focus:border-primary focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all shadow-xl"
              />
            </motion.div>
          </div>
        </motion.div>

        {/* Top 3 Podium */}
        {filteredData && filteredData.length >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
          >
            {[1, 0, 2].map((index, position) => {
              const user = filteredData[index];
              const rank = index + 1;
              const colors = getRankColors(rank);
              const medal = getRankMedal(rank);

              return (
                <motion.div
                  key={user.userId}
                  initial={{ opacity: 0, y: 50, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    delay: 1 + position * 0.2,
                    type: "spring",
                    stiffness: 200,
                  }}
                  whileHover={{ scale: 1.05, y: -15 }}
                  className={`${
                    position === 1 ? "" : "md:mt-12"
                  } relative group order-${position + 1}`}
                >
                  <motion.div
                    animate={{
                      boxShadow: [
                        `0 0 30px ${
                          rank === 1
                            ? "rgba(250, 204, 21, 0.3)"
                            : "rgba(var(--primary-rgb), 0.2)"
                        }`,
                        `0 0 50px ${
                          rank === 1
                            ? "rgba(250, 204, 21, 0.5)"
                            : "rgba(var(--primary-rgb), 0.4)"
                        }`,
                        `0 0 30px ${
                          rank === 1
                            ? "rgba(250, 204, 21, 0.3)"
                            : "rgba(var(--primary-rgb), 0.2)"
                        }`,
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`relative bg-gradient-to-br ${colors.gradient} p-[3px] rounded-3xl`}
                  >
                    <div className="relative bg-surface/95 backdrop-blur-2xl rounded-3xl p-8 overflow-hidden">
                      <div className="text-center relative z-10">
                        {/* Rank Badge */}
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{
                            delay: 1.2 + position * 0.2,
                            type: "spring",
                          }}
                          className="relative inline-block mb-6"
                        >
                          <motion.div
                            animate={{ rotate: rank === 1 ? 360 : 0 }}
                            transition={{
                              duration: 20,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className={`w-28 h-28 ${colors.border} border-4 rounded-full overflow-hidden shadow-2xl`}
                          >
                            <img
                              src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                                user.name || "User"
                              )}`}
                              alt={user.name}
                              className="w-full h-full object-cover"
                            />
                          </motion.div>

                          {medal && (
                            <motion.div
                              animate={{
                                scale: [1, 1.2, 1],
                                rotate: rank === 1 ? [0, 10, -10, 0] : 0,
                              }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className={`absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-br ${colors.gradient} rounded-full flex items-center justify-center shadow-2xl ${medal.glow} shadow-lg`}
                            >
                              <medal.icon className="w-7 h-7 text-white" />
                            </motion.div>
                          )}
                        </motion.div>

                        <motion.h3
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1.3 + position * 0.2 }}
                          className="text-2xl font-black text-text mb-2 truncate"
                        >
                          {user.name}
                        </motion.h3>

                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1.4 + position * 0.2 }}
                          className={`text-sm font-bold mb-4 ${colors.text}`}
                        >
                          {rank === 1
                            ? "🏆 Champion"
                            : rank === 2
                            ? "🥈 Runner Up"
                            : "🥉 Third Place"}
                        </motion.p>

                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            delay: 1.5 + position * 0.2,
                            type: "spring",
                          }}
                          className={`inline-flex items-center gap-2 px-6 py-3 ${colors.bg} rounded-2xl border ${colors.border}`}
                        >
                          <Gift className={`w-5 h-5 ${colors.text}`} />
                          <span className="text-3xl font-black text-text">
                            {user.donatedCount}
                          </span>
                        </motion.div>
                      </div>

                      {/* Decorative elements */}
                      {rank === 1 && (
                        <>
                          <motion.div
                            animate={{
                              scale: [1, 1.2, 1],
                              opacity: [0.3, 0.6, 0.3],
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="absolute top-4 right-4"
                          >
                            <Sparkles className="w-6 h-6 text-yellow-400" />
                          </motion.div>
                          <motion.div
                            animate={{
                              scale: [1, 1.2, 1],
                              opacity: [0.3, 0.6, 0.3],
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              delay: 1,
                            }}
                            className="absolute bottom-4 left-4"
                          >
                            <Star className="w-6 h-6 text-yellow-400" />
                          </motion.div>
                        </>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* All Rankings */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-primary rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />

          <div className="relative bg-surface/90 backdrop-blur-2xl border border-border/50 rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-border/50 bg-gradient-to-r from-primary/5 to-accent/5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black text-text flex items-center gap-3">
                    <Trophy className="w-8 h-8 text-primary" />
                    Complete Rankings
                  </h2>
                  <p className="text-muted mt-2">
                    {filteredData?.length || 0} heroes making a difference
                  </p>
                </div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <Zap className="w-12 h-12 text-accent opacity-20" />
                </motion.div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50 bg-background/30">
                    <th className="text-left p-6 text-sm font-bold text-muted uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="text-left p-6 text-sm font-bold text-muted uppercase tracking-wider">
                      Hero
                    </th>
                    <th className="text-center p-6 text-sm font-bold text-muted uppercase tracking-wider">
                      Donations
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {filteredData?.map((user, index) => {
                      const colors = getRankColors(user.rank);
                      const medal = getRankMedal(user.rank);

                      return (
                        <motion.tr
                          key={user.userId || index}
                          layout
                          initial={{ opacity: 0, x: -30 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 30 }}
                          transition={{
                            delay: index * 0.05,
                            type: "spring",
                            stiffness: 300,
                          }}
                          whileHover={{
                            scale: 1.02,
                            backgroundColor: "rgba(var(--primary-rgb), 0.05)",
                          }}
                          onHoverStart={() => setHoveredRank(user.rank)}
                          onHoverEnd={() => setHoveredRank(null)}
                          className="border-b border-border/30 cursor-pointer transition-all relative"
                        >
                          <td className="p-6">
                            <motion.div
                              animate={{
                                scale: hoveredRank === user.rank ? 1.2 : 1,
                              }}
                              className="flex items-center gap-3"
                            >
                              {medal ? (
                                <motion.div
                                  animate={{
                                    rotate:
                                      user.rank === 1 ? [0, 10, -10, 0] : 0,
                                  }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                  className={`w-12 h-12 rounded-full bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-lg`}
                                >
                                  <medal.icon className="w-6 h-6 text-white" />
                                </motion.div>
                              ) : (
                                <div
                                  className={`w-12 h-12 rounded-full ${colors.bg} flex items-center justify-center font-black ${colors.text} text-lg border-2 ${colors.border}`}
                                >
                                  {user.rank}
                                </div>
                              )}
                            </motion.div>
                          </td>
                          <td className="p-6">
                            <div className="flex items-center gap-4">
                              <motion.div
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                className="w-14 h-14 rounded-full overflow-hidden border-2 border-border/50 shrink-0 shadow-lg"
                              >
                                <img
                                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                                    user.name || "User"
                                  )}`}
                                  alt={user.name}
                                  className="w-full h-full object-cover"
                                />
                              </motion.div>
                              <div className="min-w-0">
                                <p className="font-bold text-lg text-text truncate">
                                  {user.name || "Anonymous"}
                                </p>
                                {user.email && (
                                  <p className="text-sm text-muted truncate">
                                    {user.email}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-6">
                            <div className="flex justify-center">
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                className={`px-5 py-2 bg-gradient-to-r ${colors.gradient} rounded-full shadow-lg`}
                              >
                                <p className="text-lg font-black text-white flex items-center gap-2">
                                  <Gift className="w-4 h-4" />
                                  {user.donatedCount}
                                </p>
                              </motion.div>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filteredData?.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Trophy className="w-20 h-20 text-muted/30 mx-auto mb-6" />
                </motion.div>
                <h3 className="text-2xl font-bold text-text mb-2">
                  No heroes found
                </h3>
                <p className="text-muted">Try adjusting your search</p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Scroll to Top */}
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.2, rotate: 360 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.3 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-primary to-accent text-white rounded-full shadow-2xl flex items-center justify-center z-50"
        >
          <ChevronUp className="w-7 h-7" />
        </motion.button>
      </div>
    </div>
  );
};
