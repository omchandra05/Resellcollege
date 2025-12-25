import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Save, Heart, Package, Clock, Loader } from 'lucide-react';
import { API_ENDPOINTS } from '../../api/config';
import ProductCard from '../../features/products/ProductCard';

export default function BuyerProfile({ user }) {
  const { updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // profile, purchases, wishlist
  const [formData, setFormData] = useState({
    name: user.name,
    bio: user.bio || '',
    gender: user.gender || 'male'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [wishlist, setWishlist] = useState([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  useEffect(() => {
    if (activeTab === 'wishlist') {
      fetchWishlist();
    }
  }, [activeTab]);

  const fetchWishlist = async () => {
    if (!API_ENDPOINTS.USERS?.WISHLIST) {
      console.error("Wishlist API endpoint is undefined.");
      return;
    }

    setLoadingWishlist(true);
    try {
      const response = await fetch(API_ENDPOINTS.USERS.WISHLIST, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await response.json();
      if (response.ok) setWishlist(data.data.wishlist || []);
    } catch (err) {
      console.error("Failed to fetch wishlist:", err);
    } finally {
      setLoadingWishlist(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch(API_ENDPOINTS.USERS.UPDATE_PROFILE, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}` 
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        updateUser(data.data.user); // Update global auth context
        setIsEditing(false);
        setMessage('Profile updated successfully!');
      } else {
        setMessage(data.message || 'Failed to update profile');
      }
    } catch (err) {
      setMessage('Error updating profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Header with Avatar */}
      <div className="glass-card overflow-hidden mb-8">
        <div className="h-32 bg-gradient-to-r from-indigo-600 to-blue-500 relative">
          <div className="absolute -bottom-12 left-8 w-24 h-24 rounded-2xl bg-slate-800 border-4 border-[#020617] overflow-hidden shadow-lg">
            <img 
              src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} 
              alt={user.name}
              className="w-full h-full object-cover" 
            />
          </div>
        </div>

        <div className="pt-16 px-8 pb-8">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h2 className="text-3xl font-black text-white">{user.name}</h2>
              <p className="text-sm text-slate-400">Buyer Account</p>
            </div>
            <button 
              onClick={() => setIsEditing(!isEditing)} 
              className="text-sm font-bold text-blue-400 hover:text-blue-300 px-4 py-2 rounded-lg hover:bg-blue-500/10 transition-all"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {message && (
            <div className={`mt-4 p-3 rounded-lg text-sm font-bold ${
              message.includes('successfully') 
                ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              {message}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-white/10">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${
            activeTab === 'profile'
              ? 'text-blue-400 border-blue-500'
              : 'text-slate-400 border-transparent hover:text-slate-300'
          }`}
        >
          <User className="w-4 h-4 inline mr-2" />
          Account Settings
        </button>
        <button
          onClick={() => setActiveTab('purchases')}
          className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${
            activeTab === 'purchases'
              ? 'text-blue-400 border-blue-500'
              : 'text-slate-400 border-transparent hover:text-slate-300'
          }`}
        >
          <Package className="w-4 h-4 inline mr-2" />
          My Purchases
        </button>
        <button
          onClick={() => setActiveTab('wishlist')}
          className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${
            activeTab === 'wishlist'
              ? 'text-blue-400 border-blue-500'
              : 'text-slate-400 border-transparent hover:text-slate-300'
          }`}
        >
          <Heart className="w-4 h-4 inline mr-2" />
          Wishlist
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {/* Profile Settings Tab */}
        {activeTab === 'profile' && (
          <div className="glass-card p-8">
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Display Name</label>
                  <input 
                    disabled={!isEditing}
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white focus:border-blue-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email (Verified)</label>
                  <input 
                    disabled 
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-slate-500 outline-none disabled:cursor-not-allowed" 
                    value={user.email} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Bio</label>
                <textarea 
                  disabled={!isEditing}
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white focus:border-blue-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                  rows={4}
                  placeholder="Tell us about yourself..."
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                />
              </div>

              {isEditing && (
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-500 transition-all disabled:opacity-50"
                >
                  <Save className="w-5 h-5" /> {loading ? 'Saving...' : 'Save Profile'}
                </button>
              )}
            </form>
          </div>
        )}

        {/* Purchases Tab */}
        {activeTab === 'purchases' && (
          <div className="glass-card p-8">
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No purchases yet</h3>
              <p className="text-slate-400 mb-6">Start exploring and find amazing items to buy!</p>
              <a 
                href="/" 
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-500 transition-all"
              >
                Browse Products
              </a>
            </div>
          </div>
        )}

        {/* Wishlist Tab */}
        {activeTab === 'wishlist' && (
          <div className="glass-card p-8">
            {loadingWishlist ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                <p className="text-slate-400">Loading your wishlist...</p>
              </div>
            ) : wishlist.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlist.map((item) => (
                  <ProductCard key={item._id || item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Wishlist is empty</h3>
                <p className="text-slate-400 mb-6">Save your favorite items to your wishlist</p>
                <a href="/" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-500 transition-all">
                  Discover Items
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}