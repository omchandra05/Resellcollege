import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Send, MoreVertical, CheckCheck, User, Loader, ChevronLeft, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../api/config';
import { io } from 'socket.io-client';

export default function ChatPage() {
  const { user } = useAuth();
  const location = useLocation();
  const currentUserId = user?._id || user?.id;
  const [activeTab, setActiveTab] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const socket = useRef();
  const scrollRef = useRef();

  const activeConversation = conversations.find(c => c._id === activeTab);
  const otherParticipantInHeader = activeConversation?.participants.find(p => String(p._id) !== String(currentUserId));

  // Socket Connection
  useEffect(() => {
    // In production, connect to the same host that serves the page.
    // The Nginx reverse proxy will handle forwarding.
    // In development, connect to the explicit backend URL from .env.
    const socketURL = import.meta.env.MODE === 'production' ? undefined : import.meta.env.VITE_API_URL;
    socket.current = io(socketURL, { auth: { token: user.token } });

    socket.current.emit("add-user", currentUserId);

    socket.current.on("message:receive", (msg) => {
      const convId = typeof msg.conversation === 'object' ? msg.conversation._id : msg.conversation;
      const senderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender;
      
      // This component only cares about messages for the currently active chat.
      // The Navbar's socket will handle global notifications for inactive chats.
      if (activeTab === convId && String(senderId) !== String(currentUserId)) {
        setMessages((prev) => [...prev, msg]);
        // Immediately mark as read since the chat is open, and tell navbar to refresh
        fetch(API_ENDPOINTS.CHAT.MARK_AS_READ(convId), {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${user.token}` }
        }).then(() => window.dispatchEvent(new CustomEvent('notifications:refresh')));
      }
    });

    return () => socket.current.disconnect();
  }, [currentUserId, activeTab, user.token]);

  // Fetch Conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.CHAT.CONVERSATIONS, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setConversations(data.data);
          const initialConvId = location.state?.conversationId;
          if (initialConvId && data.data.some(c => c._id === initialConvId)) {
            setActiveTab(initialConvId);
          } else if (data.data.length > 0) {
            setActiveTab(data.data[0]._id);
          }
        } else {
          const errorData = await res.json();
          console.error("Fetch conversations failed:", errorData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, [user.token, location.state?.conversationId]);

  // Fetch Messages for Active Chat & Mark as Read
  useEffect(() => {
    if (!activeTab) return;

    const markAsRead = async (convId) => {
      // Use functional update to avoid stale state and dependency array issues
      setConversations(prevConvs => {
        const convToUpdate = prevConvs.find(c => c._id === convId);
        if (!convToUpdate || convToUpdate.unreadCount === 0) {
          return prevConvs; // No change needed
        }
        return prevConvs.map(c => 
          c._id === convId ? { ...c, unreadCount: 0, unread: false } : c
        );
      });

      try {
        await fetch(API_ENDPOINTS.CHAT.MARK_AS_READ(convId), {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        // Tell the navbar to refresh its count
        window.dispatchEvent(new CustomEvent('notifications:refresh'));
      } catch (err) {
        console.error("Failed to mark as read on server:", err);
      }
    };

    const fetchMessages = async () => {
      const res = await fetch(API_ENDPOINTS.CHAT.MESSAGES(activeTab), {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await res.json();
      if (res.ok) setMessages(data.data);
    };
    fetchMessages();
    markAsRead(activeTab);
  }, [activeTab, user.token]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const currentChat = conversations.find(c => c._id === activeTab);
    const receiver = currentChat?.participants.find(p => String(p._id) !== String(currentUserId));

    const msgData = {
      conversationId: activeTab,
      content: newMessage,
      text: newMessage,
      sender: currentUserId,
      receiverId: receiver?._id,
      createdAt: new Date()
    };

    // Optimistic update for instant UI response
    setMessages([...messages, msgData]);
    setNewMessage('');

    try {
      // We ONLY use the API now. The server will handle the socket emission.
      // This prevents duplicate messages and race conditions.

      // Persist to Database via API
      await fetch(API_ENDPOINTS.CHAT.SEND, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          receiverId: receiver?._id,
          productId: currentChat.productId?._id || currentChat.productId,
          content: newMessage
        })
      });
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-160px)] flex gap-6">
      
      {/* Left Side: Conversation List */}
      <div className={`w-full md:w-80 lg:w-96 flex-col gap-4 ${activeTab ? 'hidden md:flex' : 'flex'}`}>
        <h1 className="text-3xl font-black text-white px-2">Messages</h1>
        
        <div className="glass-card flex-1 flex flex-col overflow-hidden border-white/5 h-full">
          <div className="p-4 border-b border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search chats..." 
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white outline-none focus:ring-1 focus:ring-blue-500/50"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.map((chat) => {
              const otherParticipant = chat.participants.find(p => String(p._id) !== String(currentUserId));
              return (
                <div 
                  key={chat._id}
                  onClick={() => setActiveTab(chat._id)}
                  className={`p-4 flex items-center gap-4 cursor-pointer transition-all border-l-4 ${
                    activeTab === chat._id 
                      ? 'bg-blue-600/10 border-blue-500' 
                      : 'border-transparent hover:bg-white/5'
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-slate-700 to-slate-800 flex items-center justify-center text-white font-bold shrink-0">
                    {otherParticipant?.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <h3 className="text-white font-bold text-sm truncate">{otherParticipant?.name}</h3>
                        {otherParticipant?.isVerified && (
                          <ShieldCheck className="w-3.5 h-3.5 text-green-400 fill-green-500/20 shrink-0" title="Verified" />
                        )}
                      </div>
                      {chat.unreadCount > 0 ? (
                        <span className="bg-blue-600 text-white text-[10px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                          {chat.unreadCount}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 whitespace-nowrap">Active</span>
                      )}
                    </div>
                    <p className="text-blue-400 text-xs font-medium mb-1 truncate">{chat.productId?.title || 'Product'}</p>
                    <p className={`text-xs truncate ${chat.unread ? 'text-white font-bold' : 'text-slate-400'}`}>
                      {chat.lastMsg}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Side: Chat Window */}
      <div className={`flex-1 glass-card flex-col border-white/5 overflow-hidden ${activeTab ? 'flex' : 'hidden'} md:flex`}>
        {/* Chat Header */}
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveTab(null)} className="md:hidden text-slate-400 hover:text-white p-2 -ml-2">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
              {otherParticipantInHeader?.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-white font-bold text-sm">{otherParticipantInHeader?.name}</h2>
                {otherParticipantInHeader?.isVerified && (
                  <ShieldCheck className="w-4 h-4 text-green-400 fill-green-500/20" title="Verified" />
                )}
              </div>
              <p className="text-green-400 text-[10px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                Online
              </p>
            </div>
          </div>
          <button className="text-slate-400 hover:text-white p-2">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          <div className="flex justify-center">
            <span className="text-[10px] text-slate-500 bg-white/5 px-3 py-1 rounded-full uppercase font-bold tracking-widest">Today</span>
          </div>
          
          {messages.map((msg, i) => (
            <div 
              key={i} 
              ref={scrollRef}
              className={`flex flex-col ${String(msg.sender?._id || msg.sender) === String(currentUserId) ? 'items-end' : 'items-start'} gap-1`}
            >
              <div className={`p-4 rounded-2xl text-sm leading-relaxed max-w-[80%] ${
                String(msg.sender?._id || msg.sender) === String(currentUserId)
                  ? 'bg-blue-600 rounded-br-none text-white shadow-lg shadow-blue-500/20' 
                  : 'bg-white/10 border border-white/10 rounded-bl-none text-white'
              }`}>
                {msg.text || msg.content}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-500">
                <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                {String(msg.sender?._id || msg.sender) === String(currentUserId) && <CheckCheck className="w-3 h-3 text-blue-400" />}
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="p-4 bg-white/5 border-t border-white/10">
          <div className="flex items-center gap-3 bg-black/20 border border-white/10 rounded-2xl p-2 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all">
            <input 
              type="text" 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..." 
              className="flex-1 bg-transparent border-none outline-none text-white px-3 py-2 text-sm placeholder:text-slate-600"
            />
            <button type="submit" className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-500 transition-all active:scale-95">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}