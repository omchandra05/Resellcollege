import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // Import your Auth Hook
import {
  Search,
  User,
  Plus,
  ShoppingBag,
  Bell,
  MessageSquare,
  LogOut,
} from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";
import { io } from "socket.io-client";
import { API_ENDPOINTS } from "../../api/config";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // Get user state from context
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const socket = useRef();

  const handleSearch = (e) => {
    if (e.key === "Enter" && searchQuery.trim() !== "") {
      navigate("/search", { state: { query: searchQuery } });
    }
  };

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      setNotifications([]);
      if (socket.current) {
        socket.current.disconnect();
      }
      return;
    }

    const fetchNotifications = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.CHAT.CONVERSATIONS, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const convos = data.data || [];
          const unreadConvos = convos.filter(c => c.unreadCount > 0);
          const totalUnread = unreadConvos.reduce((sum, c) => sum + c.unreadCount, 0);
          setNotifications(unreadConvos);
          setUnreadCount(totalUnread);
        }
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };

    fetchNotifications();

    // In production, connect to the same host that serves the page.
    // The Nginx reverse proxy will handle forwarding.
    // In development, connect to the explicit backend URL from .env.
    const socketURL = import.meta.env.MODE === 'production' ? undefined : import.meta.env.VITE_API_URL;
    socket.current = io(socketURL, { auth: { token: user.token } });
    socket.current.emit("add-user", user._id || user.id);
    socket.current.on("message:receive", fetchNotifications);
    
    window.addEventListener('notifications:refresh', fetchNotifications);

    return () => {
      if (socket.current) socket.current.disconnect();
      window.removeEventListener('notifications:refresh', fetchNotifications);
    };
  }, [user]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] px-4 py-3">
      <div className="max-w-7xl mx-auto relative">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-[2rem] px-6 h-16 flex items-center justify-between gap-6 transition-all duration-300">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-white tracking-tight">RESELL</span>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Find something amazing..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-2.5 pl-11 pr-4 text-sm text-white focus:ring-2 focus:ring-blue-500/50 focus:bg-white/10 transition-all outline-none placeholder:text-slate-500"
            />
          </div>

          {/* Dynamic Action Icons */}
          <div className="flex items-center gap-1 sm:gap-3">
            {user ? (
              <>
                <Link to="/chat" className="p-2 text-slate-300 hover:bg-white/10 rounded-full transition-colors">
                  <MessageSquare className="w-5 h-5" />
                </Link>

                <div className="relative">
                  <button onClick={() => setIsNotifOpen(!isNotifOpen)} className="p-2 text-slate-300 hover:bg-white/10 rounded-full transition-colors">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-5 h-5 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-slate-900">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  <NotificationDropdown isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} notifications={notifications} />
                </div>

                <Link to="/profile" className="p-2 text-slate-300 hover:bg-white/10 rounded-full transition-colors">
                  <User className="w-5 h-5" />
                </Link>

                {/* ROLE SPECIFIC: Only show Sell button to Sellers */}
                {user.role === 'seller' && (
                  <button 
                    onClick={() => navigate('/add-listing')}
                    className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-2xl font-bold text-sm hover:bg-blue-500 shadow-lg transition-all active:scale-95 ml-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Sell Item</span>
                  </button>
                )}

                <button onClick={logout} className="p-2 text-red-400 hover:bg-red-400/10 rounded-full transition-colors">
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-sm font-bold text-slate-300 hover:text-white px-4">Login</Link>
                <Link to="/signup" className="bg-blue-600 text-white px-5 py-2.5 rounded-2xl font-bold text-sm hover:bg-blue-500 transition-all">
                  Join
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}