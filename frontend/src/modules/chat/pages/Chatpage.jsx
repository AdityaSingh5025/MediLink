import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { chatApi } from "../services/chatService";
import { useChatSocket } from "../hooks/useChatHook";
import Sidebar from "../components/SideBar";

import {
  MessageCircle,
  Send,
  MoreVertical,
  Phone,
  Video,
  Paperclip,
  Smile,
  CheckCheck,
  MapPin,
  Menu,
} from "lucide-react";

import { Button } from "../../../shared/components/ui/Button";
import { CardHeader } from "../../../shared/components/ui/Card";
import { Input } from "../../../shared/components/ui/Input";
import { Badge } from "../../../shared/components/ui/Badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../shared/components/ui/Avatar";

export function ChatPage() {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  const [chatList, setChatList] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const { sendMessage } = useChatSocket(listingId, (message) => {
    setMessages((prev) => {
      const exists = prev.some(
        (m) => m.text === message.text && m.senderId === message.senderId
      );
      return exists ? prev : [...prev, message];
    });
  });

  // Fetch all user chats
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await chatApi.getUserChats();
        if (res.success) setChatList(res.data);
        else toast.error(res.error || "Failed to load chats");
      } catch {
        toast.error("Unable to fetch chats");
      }
    };
    fetchChats();
  }, []);

  // Fetch messages for current listing
  useEffect(() => {
    const fetchMessages = async () => {
      if (!listingId) return;
      const res = await chatApi.getChatHistory(listingId);
      if (res.success) setMessages(res.data);
      else toast.error(res.error || "Failed to load messages");
    };
    fetchMessages();
  }, [listingId]);

  // Auto-scroll when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send a message
  const handleSend = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    const newMessage = {
      senderId: userInfo?._id,
      text: messageInput,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    sendMessage(messageInput);
    setMessageInput("");
  };

  // Share location
  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported on this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const locationUrl = `📍 My current location: https://www.google.com/maps?q=${latitude},${longitude}`;
        sendMessage(locationUrl);
        toast.success("Location sent successfully!");
      },
      () => {
        toast.error("Unable to fetch location. Please allow access.");
      }
    );
  };

  // Group chats by participant
  const groupedChats = chatList.reduce((acc, chat) => {
    // Skip if participantId is missing or equals current user (safety check)
    if (!chat.participantId || chat.participantId === userInfo?._id) {
      return acc;
    }

    const key = chat.participantId;
    if (!acc[key]) {
      acc[key] = {
        participantId: chat.participantId,
        participantName: chat.participantName,
        avatar: chat.avatar,
        chats: [],
      };
    }
    acc[key].chats.push({
      listingId: chat.listingId,
      listingTitle: chat.listingTitle,
      updatedAt: chat.updatedAt,
      lastMessage: chat.lastMessage,
    });
    return acc;
  }, {});

  // Filtered groups for search
  const filteredGroupedChats = Object.values(groupedChats).filter(
    (group) =>
      group.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.chats.some((chat) =>
        chat.listingTitle.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const selectedChat = chatList.find((c) => c.listingId === listingId);

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] flex bg-[var(--color-background)] rounded-xl overflow-hidden border border-[var(--color-border)] shadow-soft">
      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        chatList={chatList}
        filteredGroupedChats={filteredGroupedChats}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        listingId={listingId}
        navigate={navigate}
      />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Chat Window */}
      <main className="flex-1 flex flex-col bg-[var(--color-background)]">
        {listingId && selectedChat ? (
          <>
            {/* Header */}
            <CardHeader className="border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <button
                  className="md:hidden text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu size={18} />
                </button>
                <Avatar className="w-10 h-10">
                  <AvatarImage src={selectedChat.avatar} />
                  <AvatarFallback>
                    {selectedChat.participantName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{selectedChat.participantName}</h3>
                  <Badge variant="outline" className="text-xs">
                    {selectedChat.listingTitle}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length > 0 ? (
                messages.map((m, i) => {
                  const isMine = m.senderId === userInfo?._id;
                  const isLocation = m.text?.includes("https://www.google.com/maps?q=");
                  return (
                    <div
                      key={i}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-md ${
                          isMine
                            ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-tr-none"
                            : "bg-[var(--color-surface)] text-[var(--color-text)] rounded-tl-none"
                        }`}
                      >
                        {isLocation ? (
                          <a
                            href={m.text.match(/https:\/\/www\.google\.com\/maps\?q=[^ ]+/)[0]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm underline break-words text-blue-300"
                          >
                            View Shared Location
                          </a>
                        ) : (
                          <p className="text-sm break-words">{m.text}</p>
                        )}
                        <div
                          className={`flex items-center gap-1 mt-1 ${
                            isMine ? "justify-end" : "justify-start"
                          }`}
                        >
                          <span className="text-[10px] opacity-70">
                            {new Date(m.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {isMine && <CheckCheck className="w-3 h-3 text-blue-300" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-[var(--color-text-muted)] mt-10">
                  No messages yet.
                </p>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-[var(--color-border)] p-4 bg-[var(--color-surface)]">
              <form onSubmit={handleSend} className="flex items-center gap-2">
                <Button type="button" variant="ghost" size="icon">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  title="Share current location"
                  onClick={handleShareLocation}
                >
                  <MapPin className="w-4 h-4" />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    placeholder="Type your message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="pr-12 bg-[var(--color-background)] border-[var(--color-border)]"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                  >
                    <Smile className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  type="submit"
                  size="icon"
                  className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] hover:opacity-90"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          // Empty State
          <div className="flex-1 flex items-center justify-center relative">
            <button
              onClick={() => setSidebarOpen(true)}
              className="absolute top-4 left-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white font-medium md:hidden shadow-md hover:bg-[var(--color-accent)] transition"
            >
              <Menu size={18} /> Chats
            </button>
            <div className="text-center px-6">
              <MessageCircle className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[var(--color-text)]">
                Select a conversation
              </h3>
              <p className="text-[var(--color-text-muted)] text-sm mt-1">
                Choose a chat from the sidebar to start messaging.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}