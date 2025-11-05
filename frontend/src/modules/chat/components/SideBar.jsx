import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, MessageCircle, Loader2 } from "lucide-react";

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  chatList,
  filteredGroupedChats,
  searchQuery,
  setSearchQuery,
  listingId,
  navigate,
}) {
  return (
    <>
      {/* Mobile Sidebar - slides in/out */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="md:hidden fixed top-0 left-0 h-full w-80 bg-surface/95 backdrop-blur-xl border-r border-border/50 z-40 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-5 border-b border-border/50 bg-surface/50 backdrop-blur-xl sticky top-0 z-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-text">Messages</h2>
                <div className="flex items-center gap-2">
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-bold"
                  >
                    {chatList.length}
                  </motion.span>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-muted hover:text-text p-2"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
                <input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-text placeholder-muted focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
              <AnimatePresence>
                {filteredGroupedChats.length > 0 ? (
                  filteredGroupedChats.map((userGroup, groupIdx) => (
                    <motion.div
                      key={`${userGroup.participantId}-${groupIdx}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: groupIdx * 0.05 }}
                      className="bg-background/50 border border-border/50 rounded-2xl p-3 space-y-2"
                    >
                      {/* User Header */}
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={
                              userGroup.avatar ||
                              `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                                userGroup.participantName
                              )}`
                            }
                            alt={userGroup.participantName}
                            className="w-12 h-12 rounded-full border-2 border-primary/20 object-cover"
                          />
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                        </div>
                        <h3 className="font-semibold text-text truncate flex-1">
                          {userGroup.participantName}
                        </h3>
                      </div>

                      {/* Listings */}
                      <div className="space-y-1 pl-2">
                        {userGroup.chats.map((chat, index) => (
                          <motion.div
                            key={`${userGroup.participantId}-${chat.listingId}-${index}`}
                            whileHover={{ scale: 1.02, x: 5 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              navigate(`/chat/${chat.listingId}`);
                              setSidebarOpen(false);
                            }}
                            className={`cursor-pointer p-3 rounded-xl transition-all ${
                              listingId === chat.listingId
                                ? "bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30"
                                : "hover:bg-surface/50"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-medium text-text truncate flex-1">
                                {chat.listingTitle}
                              </p>
                              <span className="text-[10px] text-muted whitespace-nowrap ml-2">
                                {new Date(chat.updatedAt).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </span>
                            </div>
                            <p className="text-xs text-muted truncate">
                              {chat.lastMessage || "No messages yet"}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20"
                  >
                    <MessageCircle className="w-16 h-16 text-muted/30 mx-auto mb-4" />
                    <p className="text-muted">No conversations yet</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar - always visible */}
      <aside className="hidden md:flex md:w-[320px] lg:w-[360px] bg-surface/80 backdrop-blur-xl border-r border-border/50 flex-col shadow-lg">
        {/* Header */}
        <div className="p-5 border-b border-border/50 bg-surface/50 backdrop-blur-xl sticky top-0 z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-text">Messages</h2>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-bold"
            >
              {chatList.length}
            </motion.span>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
            <input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-text placeholder-muted focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
          <AnimatePresence>
            {filteredGroupedChats.length > 0 ? (
              filteredGroupedChats.map((userGroup, groupIdx) => (
                <motion.div
                  key={`${userGroup.participantId}-${groupIdx}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: groupIdx * 0.05 }}
                  className="bg-background/50 border border-border/50 rounded-2xl p-3 space-y-2"
                >
                  {/* User Header */}
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={
                          userGroup.avatar ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                            userGroup.participantName
                          )}`
                        }
                        alt={userGroup.participantName}
                        className="w-12 h-12 rounded-full border-2 border-primary/20 object-cover"
                      />
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                    </div>
                    <h3 className="font-semibold text-text truncate flex-1">
                      {userGroup.participantName}
                    </h3>
                  </div>

                  {/* Listings */}
                  <div className="space-y-1 pl-2">
                    {userGroup.chats.map((chat, index) => (
                      <motion.div
                        key={`${userGroup.participantId}-${chat.listingId}-${index}`}
                        whileHover={{ scale: 1.02, x: 5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          navigate(`/chat/${chat.listingId}`);
                        }}
                        className={`cursor-pointer p-3 rounded-xl transition-all ${
                          listingId === chat.listingId
                            ? "bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30"
                            : "hover:bg-surface/50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-text truncate flex-1">
                            {chat.listingTitle}
                          </p>
                          <span className="text-[10px] text-muted whitespace-nowrap ml-2">
                            {new Date(chat.updatedAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-muted truncate">
                          {chat.lastMessage || "No messages yet"}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <MessageCircle className="w-16 h-16 text-muted/30 mx-auto mb-4" />
                <p className="text-muted">No conversations yet</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </aside>
    </>
  );
}
