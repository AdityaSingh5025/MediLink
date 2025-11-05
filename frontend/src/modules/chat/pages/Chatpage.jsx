import React, { useEffect, useState, useRef, useCallback, memo } from "react";
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


const MessageBubble = memo(({ message, isMine }) => {
  const isLocation = message.text?.includes("https://www.google.com/maps?q=");
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isMine ? "justify-end" : "justify-start"} mb-3`}
    >
      <div
        className={`max-w-[75%] px-4 py-3 ${
          isMine
            ? "bg-gradient-to-r from-primary to-accent text-white rounded-2xl rounded-tr-sm"
            : "bg-surface/80 backdrop-blur-sm border border-border/50 text-text rounded-2xl rounded-tl-sm"
        } ${message.temp ? "opacity-60" : ""} shadow-md transition-opacity duration-200`}
      >
        {!isMine && (
          <p className="text-xs font-medium mb-1 opacity-70">
            {message.senderName}
          </p>
        )}
        
        {isLocation ? (
          <a
            href={message.text.match(/https:\/\/www\.google\.com\/maps\?q=[^ ]+/)?.[0]}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm underline hover:opacity-80 transition-opacity"
          >
            <MapPin className="w-4 h-4" />
            View Shared Location
          </a>
        ) : (
          <p className="text-sm break-words whitespace-pre-wrap">{message.text}</p>
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
            <CheckCheck className="w-3 h-3 opacity-70" />
          )}
        </div>
      </div>
    </motion.div>
  );
});

MessageBubble.displayName = 'MessageBubble';

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
  const messagesContainerRef = useRef(null);

  
  const { sendMessage, isConnected, sendTyping } = useChatSocket(listingId, {
    onMessage: (message) => {
      setLocalMessages((prev) => {
        const existsById = prev.some((m) => m._id === message._id);
        if (existsById) {
          return prev.map(m => {
            if (m.temp && m.text === message.text && m.senderId === message.senderId) {
              return message;
            }
            return m;
          });
        }
        
        const isDuplicateTemp = prev.some((m) => 
          m.temp && 
          m.text === message.text && 
          m.senderId === message.senderId &&
          Math.abs(new Date(m.timestamp) - new Date(message.timestamp)) < 2000
        );
        
        if (isDuplicateTemp) {
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


  useEffect(() => {
    if (messagesEndRef.current) {
     
      const shouldInstantScroll = localMessages.some(m => m.temp);
      messagesEndRef.current.scrollIntoView({ 
        behavior: shouldInstantScroll ? "auto" : "smooth",
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

    setMessageInput("");
    
    // Add temp message with instant scroll
    setLocalMessages((prev) => [...prev, tempMessage]);
    setIsSending(true);

    try {
      await sendMessage(textToSend);
      
      
      setTimeout(() => {
        setLocalMessages((prev) => prev.filter((m) => m._id !== tempId));
      }, 300);
      
    } catch (err) {
      console.error("Send failed:", err);
      toast.error("Failed to send message");
      
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

    const loadingToast = toast.loading("Getting your location...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        toast.dismiss(loadingToast);
        const { latitude, longitude } = pos.coords;
        const locationUrl = `📍 Location shared: https://www.google.com/maps?q=${latitude},${longitude}`;
        sendMessage(locationUrl);
        toast.success("Location shared!");
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
      
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-accent/10 to-primary/10 rounded-full blur-3xl opacity-50" />
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
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col bg-surface/50 backdrop-blur-sm border-l border-border/50">
        {listingId && selectedChat ? (
          <>
            {/* Header */}
            <div className="border-b border-border/50 bg-surface/80 backdrop-blur-xl px-4 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
              <div className="flex items-center gap-3">
                <button
                  className="md:hidden text-muted hover:text-text transition-colors"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="w-5 h-5" />
                </button>

                <button
                  onClick={() => navigate(-1)}
                  className="text-muted hover:text-text transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="relative">
                  <img
                    src={selectedChat.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(selectedChat.participantName)}`}
                    alt={selectedChat.participantName}
                    className="w-12 h-12 rounded-full border-2 border-primary/20 object-cover"
                  />
                  {isConnected && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-surface rounded-full" />
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-text">{selectedChat.participantName}</h3>
                  <p className="text-xs text-muted">
                    {isTyping && typingUser ? (
                      <span className="text-primary">{typingUser} is typing...</span>
                    ) : (
                      selectedChat.listingTitle
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRefreshMessages}
                  disabled={isLoadingMessages}
                  className="p-2 hover:bg-background rounded-xl transition-colors disabled:opacity-50"
                  title="Refresh messages"
                >
                  <RefreshCw className={`w-5 h-5 text-muted ${isLoadingMessages ? 'animate-spin' : ''}`} />
                </button>
                <button className="p-2 hover:bg-background rounded-xl transition-colors">
                  <Phone className="w-5 h-5 text-muted" />
                </button>
                <button className="p-2 hover:bg-background rounded-xl transition-colors">
                  <Video className="w-5 h-5 text-muted" />
                </button>
                <button className="p-2 hover:bg-background rounded-xl transition-colors">
                  <MoreVertical className="w-5 h-5 text-muted" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div 
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent"
            >
              {isLoadingMessages ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : localMessages.length > 0 ? (
                <AnimatePresence mode="popLayout" initial={false}>
                  {localMessages.map((message) => (
                    <MessageBubble 
                      key={message._id} 
                      message={message}
                      isMine={message.senderId === (userInfo?._id || userInfo?.id)}
                    />
                  ))}
                </AnimatePresence>
              ) : (
                <div className="flex flex-col items-center justify-center py-20">
                  <MessageCircle className="w-16 h-16 text-muted/30 mb-4" />
                  <p className="text-muted">No messages yet. Start the conversation! 💬</p>
                </div>
              )}
              
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
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-border/50 p-4 bg-surface/80 backdrop-blur-xl">
              <form onSubmit={handleSend} className="flex items-center gap-3">
                <button
                  type="button"
                  className="p-2 hover:bg-background rounded-xl transition-colors"
                  onClick={() => toast.info("File sharing coming soon!")}
                >
                  <Paperclip className="w-5 h-5 text-muted" />
                </button>

                <button
                  type="button"
                  onClick={handleShareLocation}
                  disabled={!isConnected}
                  className="p-2 hover:bg-background rounded-xl transition-colors disabled:opacity-50"
                  title="Share location"
                >
                  <MapPin className="w-5 h-5 text-muted" />
                </button>

                <div className="flex-1">
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

                <button
                  type="submit"
                  disabled={isSending || !messageInput.trim() || !isConnected}
                  className="p-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </form>
              
              {!isConnected && (
                <div className="mt-2 text-center text-xs text-yellow-500 flex items-center justify-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Reconnecting...
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center relative">
            <button
              onClick={() => setSidebarOpen(true)}
              className="absolute top-4 left-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-medium md:hidden shadow-lg"
            >
              <Menu className="w-5 h-5" /> 
              Chats
            </button>

            <div className="text-center px-6">
              <MessageCircle className="w-20 h-20 text-muted/30 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-text mb-2">
                Select a conversation
              </h3>
              <p className="text-muted max-w-md">
                Choose a chat from the sidebar to start messaging or request an item to begin a new conversation.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}