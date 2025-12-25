import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Plus, 
  Package, 
  Eye, 
  TrendingUp, 
  IndianRupee,
  Edit3, 
  Trash2, 
  ExternalLink,
  Loader,
  BadgeCheck,
  LayoutGrid,
  List,
  Settings,
  Save,
  ShieldCheck
} from 'lucide-react';
import { API_ENDPOINTS } from '../../api/config';

export default function SellerDashboard({ user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.SELLER.DASHBOARD, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      const result = await response.json();
      if (response.ok) {
        setData(result.data);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user.token]); // eslint-disable-line react-hooks/exhaustive-deps

  // State and handlers for Settings tab
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    name: user.name || '',
    bio: user.bio || '',
  });

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSettingsLoading(true);
    setMessage('');
    try {
      const response = await fetch(API_ENDPOINTS.USERS.UPDATE_PROFILE, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        updateUser(data.data.user);
        setMessage('Profile updated successfully!');
      } else {
        setMessage(data.message || 'Failed to update profile');
      }
    } catch (err) {
      setMessage('Error updating profile');
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleVerification = async () => {
    if (!window.confirm('This will mark your profile as verified. This is for demonstration purposes. Proceed?')) return;
    setSettingsLoading(true);
    setMessage('');
    try {
      const response = await fetch(API_ENDPOINTS.USERS.UPDATE_PROFILE, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body: JSON.stringify({ isVerified: true }),
      });
      const data = await response.json();
      if (response.ok) {
        updateUser(data.data.user);
        setMessage('Congratulations! You are now a verified seller.');
      } else {
        setMessage(data.message || 'Verification failed.');
      }
    } catch (err) {
      setMessage('Error during verification.');
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleMarkAsSold = async (id) => {
    if (!window.confirm('Are you sure you want to mark this item as sold? This action cannot be undone.')) return;
    
    setLoading(true);
    try {
      // Assuming an endpoint to mark an item as sold.
      // This endpoint should handle updating the product status and recalculating seller stats.
      const response = await fetch(`${API_ENDPOINTS.PRODUCTS.DETAIL(id)}/sell`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (response.ok) {
        // Re-fetch everything to ensure stats and list are in sync
        await fetchDashboardData();
      } else {
        alert('Failed to mark as sold.');
        setLoading(false);
      }
    } catch (err) {
      console.error("Mark as sold error:", err);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.PRODUCTS.DETAIL(id), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (response.ok) {
        // Re-fetch everything to ensure stats and list are in sync
        await fetchDashboardData();
      } else {
        alert('Failed to delete listing');
        setLoading(false);
      }
    } catch (err) {
      console.error("Delete error:", err);
      setLoading(false);
    }
  };

  if (loading) return <div className="pt-20 text-center"><Loader className="animate-spin mx-auto text-blue-500" /></div>;

  const stats = data?.stats || { activeListings: 0, totalViews: 0, totalSales: 0, totalRevenue: 0 };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <h1 className="text-5xl font-black text-white mb-2">Seller Hub</h1>
          <p className="text-slate-400">Manage your listings and track performance.</p>
        </div>
        <Link 
          to="/add-listing" 
          className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-5 h-5" />
          List New Item
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-white/10">
        <TabButton icon={<LayoutGrid />} label="Dashboard" activeTab={activeTab} onClick={() => setActiveTab('dashboard')} />
        <TabButton icon={<List />} label="Listings" activeTab={activeTab} onClick={() => setActiveTab('listings')} />
        <TabButton icon={<Settings />} label="Settings" activeTab={activeTab} onClick={() => setActiveTab('settings')} />
      </div>

      {/* Tab Content */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={<Package />} label="Active" value={stats.activeListings} color="blue" />
          <StatCard icon={<Eye />} label="Total Views" value={stats.totalViews} color="purple" />
          <StatCard icon={<TrendingUp />} label="Sales" value={stats.totalSales} color="green" />
          <StatCard icon={<IndianRupee />} label="Revenue" value={`₹${stats.totalRevenue}`} color="yellow" />
        </div>
      )}

      {activeTab === 'listings' && (
        <div className="glass-card border-white/5 overflow-hidden">
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Your Listings</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-500 text-xs uppercase tracking-widest border-b border-white/5">
                  <th className="px-6 py-4 font-black">Product</th>
                  <th className="px-6 py-4 font-black">Price</th>
                  <th className="px-6 py-4 font-black">Status</th>
                  <th className="px-6 py-4 font-black text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data?.recentListings?.map((listing) => (
                  <tr key={listing.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img src={listing.image || 'https://via.placeholder.com/100'} alt="" className="w-12 h-12 rounded-xl object-cover border border-white/10" />
                        <span className="text-white font-bold">{listing.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white font-medium">₹{listing.price}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${listing.status === 'available' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>{listing.status}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        {listing.status === 'available' && (
                          <button onClick={() => handleMarkAsSold(listing.id)} className="p-2 text-green-400 hover:text-green-300 hover:bg-green-400/10 rounded-lg transition-all" title="Mark as Sold"><BadgeCheck className="w-4 h-4" /></button>
                        )}
                        <button onClick={() => navigate(`/product/${listing.id}`)} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all" title="View Listing"><ExternalLink className="w-4 h-4" /></button>
                        <button onClick={() => navigate(`/edit-listing/${listing.id}`)} className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-lg transition-all" title="Edit Listing"><Edit3 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(listing.id)} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-all" title="Delete Listing"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="glass-card p-8">
              <h3 className="text-xl font-bold text-white mb-6">Store Information</h3>
              {message && (
                <div className={`mb-6 p-3 rounded-lg text-sm font-bold ${message.includes('successfully') || message.includes('Congratulations') ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>{message}</div>
              )}
              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Store Name</label>
                  <input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white focus:border-blue-500 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Bio</label>
                  <textarea value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white focus:border-blue-500 outline-none transition-all resize-none" rows={4} placeholder="Tell buyers about your store..." />
                </div>
                <button type="submit" disabled={settingsLoading} className="w-full bg-blue-600 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-500 transition-all disabled:opacity-50">
                  <Save className="w-5 h-5" /> {settingsLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          </div>
          <div>
            <div className="glass-card p-8">
              <h3 className="text-xl font-bold text-white mb-4">Verification</h3>
              {user.isVerified ? (
                <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl text-center">
                  <ShieldCheck className="w-10 h-10 text-green-400 mx-auto mb-2" />
                  <p className="text-green-400 font-bold text-sm">You are a Verified Seller</p>
                </div>
              ) : (
                <>
                  <p className="text-slate-400 text-sm mb-4">Get a verified badge to increase buyer trust and visibility.</p>
                  <button onClick={handleVerification} disabled={settingsLoading} className="w-full bg-green-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-500 transition-all disabled:opacity-50">
                    <ShieldCheck className="w-5 h-5" /> Get Verified
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  const colors = { blue: 'text-blue-400 bg-blue-400/10 border-blue-400/20', purple: 'text-purple-400 bg-purple-400/10 border-purple-400/20', green: 'text-green-400 bg-green-400/10 border-green-400/20', yellow: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' };
  return (
    <div className="glass-card p-6 border-white/5">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border ${colors[color]}`}>{React.cloneElement(icon, { className: 'w-6 h-6' })}</div>
      <p className="text-slate-400 text-sm font-medium mb-1">{label}</p>
      <p className="text-3xl font-black text-white">{value}</p>
    </div>
  );
}

function TabButton({ icon, label, activeTab, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${activeTab === label.toLowerCase() ? 'text-blue-400 border-blue-500' : 'text-slate-400 border-transparent hover:text-slate-300'}`}
    >
      {React.cloneElement(icon, { className: 'w-4 h-4' })} {label}
    </button>
  );
}