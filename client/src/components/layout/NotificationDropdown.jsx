import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function NotificationDropdown({ isOpen, onClose, notifications = [] }) {
  if (!isOpen) return null;

  const navigate = useNavigate();
  const { user } = useAuth();

  const handleNotificationClick = (conversationId) => {
    onClose();
    // Navigate to chat and pass conversationId to open it directly
    navigate('/chat', { state: { conversationId } });
  };

  return (
    <>
      {/* Backdrop to close when clicking outside */}
      <div className="fixed inset-0 z-[90]" onClick={onClose} />
      
      <div className="absolute top-16 right-0 w-80 glass-card border-white/10 shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h3 className="text-white font-bold">Notifications</h3>
          {notifications.length > 0 && (
            <button className="text-[10px] text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider">
            Mark all as read
          </button>
          )}
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">No new notifications</p>
            </div>
          ) : (
            notifications.map((n) => {
            const otherParticipant = n.participants.find(p => String(p._id) !== String(user?._id));
            return (
            <div 
              key={n._id} 
              onClick={() => handleNotificationClick(n._id)}
              className="p-4 flex gap-4 cursor-pointer transition-colors border-b border-white/5 last:border-0 hover:bg-white/5 bg-blue-500/5"
            >
              <div className="mt-1 bg-slate-800 p-2 rounded-lg h-fit">
                <MessageSquare className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <p className="text-white text-sm font-bold leading-none mb-1">New Message</p>
                  <span className="text-[10px] text-slate-500">{new Date(n.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-slate-400 text-xs line-clamp-2 leading-snug">
                  <span className="font-bold text-slate-300">{otherParticipant?.name}:</span> {n.lastMessage}
                </p>
              </div>
              <div className="mt-2 w-2 h-2 bg-blue-500 rounded-full"></div>
            </div>
          )})
          )}
        </div>

        <button className="w-full p-3 bg-white/5 text-slate-400 text-xs font-bold hover:text-white transition-colors">
          View all notifications
        </button>
      </div>
    </>
  );
}