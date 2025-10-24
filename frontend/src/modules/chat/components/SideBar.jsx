import React from "react";
import { X, Search } from "lucide-react";
import { Badge } from "../../../shared/components/ui/Badge";
import { Input } from "../../../shared/components/ui/Input";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../shared/components/ui/Avatar";

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
    <aside
      className={`fixed md:relative top-0 left-0 h-full md:h-auto w-72 md:w-[25%] bg-[var(--color-surface)] border-r border-[var(--color-border)] z-40 transform transition-transform duration-300 ease-in-out
      ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-card)] sticky top-0 z-10 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Messages</h2>
        <Badge variant="secondary">{chatList.length}</Badge>
        <button
          className="md:hidden text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          onClick={() => setSidebarOpen(false)}
        >
          <X size={18} />
        </button>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-[var(--color-border)]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] w-4 h-4" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[var(--color-background)] border-[var(--color-border)]"
          />
        </div>
      </div>

      {/* Grouped Chat List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin hover:scrollbar-thumb-accent p-3 space-y-4">
        {filteredGroupedChats.length > 0 ? (
          filteredGroupedChats.map((userGroup, groupIdx) => (
            <div
              key={`${userGroup.participantId}-${groupIdx}`}
              className="border-b border-[var(--color-border)] pb-3"
            >
              {/* User Header */}
              <div className="flex items-center gap-3 mb-2">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={userGroup.avatar} />
                  <AvatarFallback>
                    {userGroup.participantName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-semibold text-sm truncate">
                  {userGroup.participantName}
                </h3>
              </div>

              {/* Listings under same user */}
              <div className="space-y-1 ml-12">
                {userGroup.chats.map((chat, index) => (
                  <div
                    key={`${userGroup.participantId}-${chat.listingId}-${index}`}
                    onClick={() => {
                      navigate(`/chat/${chat.listingId}`);
                      setSidebarOpen(false);
                    }}
                    className={`cursor-pointer p-2 rounded-lg transition-colors ${
                      listingId === chat.listingId
                        ? "bg-[var(--color-accent)]/40"
                        : "hover:bg-[var(--color-surface)]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium truncate">
                        {chat.listingTitle}
                      </p>
                      <span className="text-[10px] text-[var(--color-text-muted)]">
                        {new Date(chat.updatedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-[10px] text-[var(--color-text-muted)] truncate">
                      {chat.lastMessage || "No messages yet"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-[var(--color-text-muted)] mt-10">
            No chats found
          </p>
        )}
      </div>
    </aside>
  );
}
