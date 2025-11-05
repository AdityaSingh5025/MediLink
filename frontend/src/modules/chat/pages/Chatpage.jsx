import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { chatApi } from "../services/chatService";
import { useChatSocket } from "../hooks/useChatHook";
import { 
  setMessages as setReduxMessages, 
  addMessage as addReduxMessage, 
  setLoading as setReduxLoading,
  setChatList as setReduxChatList,
} from "../store/chatSlice";
import Sidebar from "../components/SideBar";

import {
  MessageCircle,
  Send,
  MoreVertical,
  Phone,
  Video,
  Paperclip,
  CheckCheck,
  MapPin,
  Menu,
  Loader2,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";

export function ChatPage() {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { userInfo } = useSelector((state) => state.auth);

  const [localChatList, setLocalChatList] = useState([]);
  const [localMessages, setLocalMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Socket hook with improved message handling
  const { sendMessage, isConnected, sendTyping } = useChatSocket(listingId, {
    onMessage: (message) => {
      setLocalMessages((prev) => {
        // Check if message already exists by _id
        const existsById = prev.some((m) => m._id === message._id);
        if (existsById) {
          // Replace temp message with real one if exists
          return prev.map(m => {
            if (m.temp && m.text === message.text && m.senderId === message.senderId) {
              return message; // Replace temp with real
            }
            return m;
          });
        }
        
        // Check for duplicate temp messages
        const isDuplicateTemp = prev.some((m) => 
          m.temp && 
          m.text === message.text && 
          m.senderId === message.senderId &&
          Math.abs(new Date(m.timestamp) - new Date(message.timestamp)) < 2000
        );
        
        if (isDuplicateTemp) {
          // Remove temp and add real message
          return prev.filter(m => !(m.temp && m.text === message.text && m.senderId === message.senderId)).concat(message);
        }
        
        dispatch(addReduxMessage(message));
        return [...prev, message];
      });
    },
    onTyping: (data) => {
      if (data.userId !== (userInfo?._id || userInfo?.id)) {
        setTypingUser(data.userName);
        setIsTyping(true);
        
        setTimeout(() => {
          setIsTyping(false);
          setTypingUser(null);
        }, 3000);
      }
    }
  });

  // Fetch all user chats
  useEffect(() => {
    const fetchChats = async () => {
      if (!userInfo) return;
      
      try {
        const res = await chatApi.getUserChats();
        if (res.success) {
          const chatsData = Array.isArray(res.data) ? res.data : [];
          setLocalChatList(chatsData);
          dispatch(setReduxChatList(chatsData));
        } else {
          toast.error(res.error || "Failed to load chats");
        }
      } catch (err) {
        console.error("Chat fetch error:", err);
        if (!err.message?.includes('Actions must be plain objects')) {
          toast.error("Unable to fetch chats");
        }
      }
    };
    
    fetchChats();
  }, [userInfo, dispatch]);

  // Fetch messages for current listing
  useEffect(() => {
    const fetchMessages = async () => {
      if (!listingId || !userInfo) return;
      
      setIsLoadingMessages(true);
      dispatch(setReduxLoading(true));
      
      try {
        const res = await chatApi.getChatHistory(listingId);
        if (res.success) {
          const messagesData = Array.isArray(res.data) ? res.data : [];
          setLocalMessages(messagesData);
          dispatch(setReduxMessages(messagesData));
        } else {
          toast.error(res.error || "Failed to load messages");
        }
      } catch (err) {
        console.error("Message fetch error:", err);
        if (!err.message?.includes('Actions must be plain objects')) {
          toast.error("Failed to load messages");
        }
      } finally {
        setIsLoadingMessages(false);
        dispatch(setReduxLoading(false));
      }
    };
    
    fetchMessages();
  }, [listingId, userInfo, dispatch]);

  // Auto-scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: "smooth",
        block: "end" 
      });
    }
  }, [localMessages]);

  // Handle typing
  const handleTyping = useCallback(() => {
    if (!sendTyping || !userInfo) return;
    
    sendTyping(userInfo?.name || "User");
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      // Typing stopped
    }, 1000);
  }, [sendTyping, userInfo]);

  // Send message with improved handling
  const handleSend = async (e) => {
    e?.preventDefault();
    if (!messageInput.trim() || isSending || !isConnected) {
      if (!isConnected) {
        toast.error("Not connected. Please wait...");
      }
      return;
    }

    const textToSend = messageInput.trim();
    const tempId = `temp-${Date.now()}-${Math.random()}`;
    
    const tempMessage = {
      _id: tempId,
      senderId: userInfo?._id || userInfo?.id,
      senderName: userInfo?.name,
      text: textToSend,
      timestamp: new Date().toISOString(),
      temp: true,
    };

    // Add temp message and clear input immediately
    setLocalMessages((prev) => [...prev, tempMessage]);
    setMessageInput("");
    setIsSending(true);

    try {
      await sendMessage(textToSend);
      
      // Remove temp message after delay (real message will arrive via socket)
      setTimeout(() => {
        setLocalMessages((prev) => prev.filter((m) => m._id !== tempId));
      }, 500);
      
    } catch (err) {
      console.error("Send failed:", err);
      toast.error("Failed to send message");
      
      // Remove temp message and restore input on error
      setLocalMessages((prev) => prev.filter((m) => m._id !== tempId));
      setMessageInput(textToSend);
    } finally {
      setIsSending(false);
    }
  };

  // Share location
  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }

    const loadingToast = toast.loading(
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 animate-pulse" />
        <span>Getting your location...</span>
      </div>
    );

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        toast.dismiss(loadingToast);
        const { latitude, longitude } = pos.coords;
        const locationUrl = `📍 Location shared: https://www.google.com/maps?q=${latitude},${longitude}`;
        sendMessage(locationUrl);
        
        toast.success(
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-2"
          >
            <MapPin className="w-4 h-4 text-green-500" />
            <span>Location shared!</span>
          </motion.div>
        );
      },
      () => {
        toast.dismiss(loadingToast);
        toast.error("Unable to access location");
      },
      { enableHighAccuracy: true }
    );
  };

  // Refresh messages
  const handleRefreshMessages = async () => {
    if (!listingId) return;
    
    setIsLoadingMessages(true);
    try {
      const res = await chatApi.getChatHistory(listingId);
      if (res.success) {
        const messagesData = Array.isArray(res.data) ? res.data : [];
        setLocalMessages(messagesData);
        dispatch(setReduxMessages(messagesData));
        toast.success("Messages refreshed");
      }
    } catch (err) {
      toast.error("Failed to refresh messages");
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Group chats
  const groupedChats = localChatList.reduce((acc, chat) => {
    if (!chat.participantId || chat.participantId === (userInfo?._id || userInfo?.id)) {
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

  const filteredGroupedChats = Object.values(groupedChats).filter(
    (group) =>
      group.participantName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.chats.some((chat) =>
        chat.listingTitle?.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const selectedChat = localChatList.find((c) => c.listingId === listingId);

  // Message bubble component
  const MessageBubble = ({ message, index }) => {
    const isMine = message.senderId === (userInfo?._id || userInfo?.id);
    const isLocation = message.text?.includes("https://www.google.com/maps?q=");
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ 
          type: "spring", 
          stiffness: 500, 
          damping: 30,
          delay: index * 0.02 
        }}
        className={`flex ${isMine ? "justify-end" : "justify-start"} mb-4`}
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`max-w-[75%] px-4 py-3 ${
            isMine
              ? "bg-gradient-to-r from-primary to-accent text-white rounded-2xl rounded-tr-sm"
              : "bg-surface/80 backdrop-blur-sm border border-border/50 text-text rounded-2xl rounded-tl-sm"
          } ${message.temp ? "opacity-70" : ""} shadow-lg`}
        >
          {!isMine && (
            <p className="text-xs font-medium mb-1 opacity-70">
              {message.senderName}
            </p>
          )}
          
          {isLocation ? (
            <motion.a
              href={message.text.match(/https:\/\/www\.google\.com\/maps\?q=[^ ]+/)?.[0]}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 text-sm underline"
            >
              <MapPin className="w-4 h-4" />
              View Shared Location
            </motion.a>
          ) : (
            <p className="text-sm break-words">{message.text}</p>
          )}
          
          <div
            className={`flex items-center gap-1 mt-1 ${
              isMine ? "justify-end" : "justify-start"
            }`}
          >
            <span className="text-[10px] opacity-70">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {isMine && !message.temp && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <CheckCheck className="w-3 h-3 opacity-70" />
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // Show loading if no userInfo
  if (!userInfo) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] flex bg-gradient-to-br from-background via-surface/20 to-background overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
          }}
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
            opacity: [0.08, 0.15, 0.08],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
          }}
          className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-accent/20 to-primary/20 rounded-full blur-3xl"
        />
      </div>

      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        chatList={localChatList}
        filteredGroupedChats={filteredGroupedChats}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        listingId={listingId}
        navigate={navigate}
      />

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col bg-surface/50 backdrop-blur-sm border-l border-border/50">
        {listingId && selectedChat ? (
          <>
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-b border-border/50 bg-surface/80 backdrop-blur-xl px-4 py-4 flex items-center justify-between sticky top-0 z-10 shadow-soft"
            >
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="md:hidden text-muted hover:text-text"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="w-5 h-5" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => navigate(-1)}
                  className="text-muted hover:text-text"
                >
                  <ArrowLeft className="w-5 h-5" />
                </motion.button>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative"
                >
                  <img
                    src={selectedChat.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(selectedChat.participantName)}`}
                    alt={selectedChat.participantName}
                    className="w-12 h-12 rounded-full border-2 border-primary/20 object-cover"
                  />
                  {isConnected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-surface rounded-full"
                    />
                  )}
                </motion.div>

                <div>
                  <h3 className="font-bold text-text">{selectedChat.participantName}</h3>
                  <p className="text-xs text-muted">
                    {isTyping && typingUser ? (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-primary"
                      >
                        {typingUser} is typing...
                      </motion.span>
                    ) : (
                      selectedChat.listingTitle
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 180 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleRefreshMessages}
                  disabled={isLoadingMessages}
                  className="p-2 hover:bg-background rounded-xl transition-colors"
                  title="Refresh messages"
                >
                  <RefreshCw className={`w-5 h-5 text-muted ${isLoadingMessages ? 'animate-spin' : ''}`} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 hover:bg-background rounded-xl transition-colors"
                >
                  <Phone className="w-5 h-5 text-muted" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 hover:bg-background rounded-xl transition-colors"
                >
                  <Video className="w-5 h-5 text-muted" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 hover:bg-background rounded-xl transition-colors"
                >
                  <MoreVertical className="w-5 h-5 text-muted" />
                </motion.button>
              </div>
            </motion.div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
              {isLoadingMessages ? (
                <div className="flex items-center justify-center py-20">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 className="w-8 h-8 text-primary" />
                  </motion.div>
                </div>
              ) : localMessages.length > 0 ? (
                <AnimatePresence initial={false}>
                  {localMessages.map((message, index) => (
                    <MessageBubble 
                      key={message._id || index} 
                      message={message} 
                      index={index}
                    />
                  ))}
                </AnimatePresence>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-20"
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                    }}
                  >
                    <MessageCircle className="w-16 h-16 text-muted/30 mb-4" />
                  </motion.div>
                  <p className="text-muted">No messages yet. Start the conversation! 💬</p>
                </motion.div>
              )}
              
              <AnimatePresence>
                {isTyping && typingUser && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex items-center gap-2 px-4 py-2"
                  >
                    <div className="flex gap-1">
                      {[0, 0.2, 0.4].map((delay, i) => (
                        <motion.div
                          key={i}
                          animate={{ y: [0, -8, 0] }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay,
                          }}
                          className="w-2 h-2 bg-primary rounded-full"
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted">{typingUser} is typing...</span>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-t border-border/50 p-4 bg-surface/80 backdrop-blur-xl"
            >
              <form onSubmit={handleSend} className="flex items-center gap-3">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 hover:bg-background rounded-xl transition-colors"
                  onClick={() => toast.info("File sharing coming soon!")}
                >
                  <Paperclip className="w-5 h-5 text-muted" />
                </motion.button>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleShareLocation}
                  disabled={!isConnected}
                  className="p-2 hover:bg-background rounded-xl transition-colors disabled:opacity-50"
                  title="Share location"
                >
                  <MapPin className="w-5 h-5 text-muted" />
                </motion.button>

                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => {
                      setMessageInput(e.target.value);
                      handleTyping();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend(e);
                      }
                    }}
                    className="w-full px-4 py-3 bg-background border border-border rounded-2xl text-text placeholder-muted focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                    disabled={!isConnected}
                  />
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  disabled={isSending || !messageInput.trim() || !isConnected}
                  className="p-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </motion.button>
              </form>
              
              {!isConnected && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-center text-xs text-yellow-500 flex items-center justify-center gap-1"
                >
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Reconnecting...
                </motion.div>
              )}
            </motion.div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSidebarOpen(true)}
              className="absolute top-4 left-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-medium md:hidden shadow-lg"
            >
              <Menu className="w-5 h-5" /> 
              Chats
            </motion.button>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center px-6"
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
              >
                <MessageCircle className="w-20 h-20 text-muted/30 mx-auto mb-6" />
              </motion.div>
              <h3 className="text-2xl font-bold text-text mb-2">
                Select a conversation
              </h3>
              <p className="text-muted max-w-md">
                Choose a chat from the sidebar to start messaging or request an item to begin a new conversation.
              </p>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}