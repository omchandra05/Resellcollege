import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, MessageCircle, ChevronLeft, ChevronRight, ShieldCheck, Share2, Heart, Loader, Edit3, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../api/config';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "").split('&')[0]
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!id || id === 'undefined') {
          setError('Invalid Product ID');
          setLoading(false);
          return;
        }

        const response = await fetch(API_ENDPOINTS.PRODUCTS.DETAIL(id));
        const data = await response.json();
        if (response.ok) {
          setProduct(data.data.product);
        } else {
          setError(data.message || 'Product not found');
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    if (id && id !== 'undefined') fetchProduct();
  }, [id]);

  // Debugging logs for Map
  useEffect(() => {
    if (product) {
      
    }
  }, [product, isLoaded, loadError]);

  useEffect(() => {
    if (user && user.wishlist) {
      // Check if current product ID is in user's wishlist
      // Handling both populated objects and ID strings
      const isListed = user.wishlist.some(item => 
        (typeof item === 'string' ? item : item._id) === id
      );
      setIsInWishlist(isListed);
    }
  }, [user, id]);

  const handleToggleWishlist = async () => {
    if (!user || !id) {
      navigate('/login');
      return;
    }

    if (!API_ENDPOINTS.USERS?.WISHLIST) {
      console.error("Wishlist API endpoint is undefined. Please check your src/api/config.js file.");
      return;
    }

    setWishlistLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.USERS.WISHLIST, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ productId: id })
      });

      if (response.ok) {
        const data = await response.json();
        setIsInWishlist(!isInWishlist);
        updateUser({ wishlist: data.data.wishlist });
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to update wishlist' }));
        console.error("Wishlist toggle failed:", errorData.message);
      }
    } catch (err) {
      console.error("Failed to toggle wishlist", err);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(API_ENDPOINTS.PRODUCTS.DETAIL(id), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (response.ok) {
        navigate('/profile');
      } else {
        alert('Failed to delete product');
      }
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const handleSendMessage = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!chatMessage.trim()) return;

    setIsSending(true);
    try {
      const response = await fetch(API_ENDPOINTS.CHAT.SEND, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          receiverId: product.owner._id || product.owner,
          productId: id,
          content: chatMessage
        })
      });

      if (response.ok) {
        navigate('/chat');
      }
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <p className="text-slate-400 font-medium">Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold text-white mb-2">Oops!</h2>
        <p className="text-slate-400 mb-6">{error || 'Product not found'}</p>
        <button onClick={() => navigate('/')} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold">
          Back to Home
        </button>
      </div>
    );
  }

  // Robust ownership check comparing string IDs
  const isOwner = user && product && (
    (user._id?.toString() === (product.owner?._id?.toString() || product.owner?.toString())) ||
    (user.id?.toString() === (product.owner?._id?.toString() || product.owner?.toString()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
      >
        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        Back to listings
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Left: Image Section */}
        <div className="space-y-6">
          <div className="glass-card overflow-hidden rounded-[2.5rem] border-white/5 shadow-2xl relative group">
            <img 
              src={product.images?.[currentImageIndex] || 'https://via.placeholder.com/600'} 
              alt={product.title} 
              className="w-full aspect-square object-cover opacity-90 transition-all duration-500"
            />
            
            {product.images?.length > 1 && (
              <>
                <button 
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                  {product.images.map((_, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`h-1.5 rounded-full transition-all ${idx === currentImageIndex ? 'bg-white w-6' : 'bg-white/40 w-2'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
          
          <div className="flex gap-4">
             {/* Action Badges */}
             {product.owner?.isVerified && (
               <div className="glass-card flex-1 p-4 flex items-center gap-3 border-green-500/20 bg-green-500/5">
                  <ShieldCheck className="w-6 h-6 text-green-400" />
                  <div>
                    <p className="text-white text-sm font-bold">Verified Seller</p>
                    <p className="text-slate-400 text-xs">This seller has been verified.</p>
                  </div>
               </div>
             )}
             <button className="glass-card p-4 hover:bg-white/5 transition-colors">
                <Share2 className="w-6 h-6 text-slate-300" />
             </button>
             <button 
               onClick={handleToggleWishlist}
               disabled={wishlistLoading}
               className={`glass-card p-4 transition-colors ${isInWishlist ? 'bg-red-500/20 border-red-500/50' : 'hover:bg-white/5'}`}
             >
                {wishlistLoading ? (
                  <Loader className="w-6 h-6 text-slate-300 animate-spin" />
                ) : (
                  <Heart className={`w-6 h-6 ${isInWishlist ? 'text-red-500 fill-red-500' : 'text-slate-300'}`} />
                )}
             </button>
          </div>
        </div>

        {/* Right: Details & Chat Section */}
        <div className="flex flex-col gap-6">
          <div className="glass-card p-8 border-white/5">
            {/* Owner Controls */}
            {isOwner && (
              <div className="flex gap-3 mb-6 pb-6 border-b border-white/5">
                <Link 
                  to={`/edit-listing/${id}`}
                  className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white py-3 rounded-2xl font-bold border border-white/10 transition-all"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Listing
                </Link>
                <button 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 py-3 rounded-2xl font-bold border border-red-500/20 transition-all disabled:opacity-50"
                >
                  {isDeleting ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Delete
                </button>
              </div>
            )}

            <div className="flex justify-between items-start mb-4">
              <span className="bg-blue-600/20 text-blue-400 text-xs font-black px-3 py-1 rounded-full border border-blue-500/30 uppercase">
                {product.category}
              </span>
              <h2 className="text-4xl font-black text-white">₹ {product.price}</h2>
            </div>
            
            <h1 className="text-4xl font-black text-white mb-2 leading-tight">
              {product.title}
            </h1>
            
            <div className="flex items-center gap-2 text-slate-400 mb-6 font-medium">
              <MapPin className="w-4 h-4 text-white" />
              <span>{product.location?.city}, {product.location?.state}</span>
            </div>

            {/* Google Map Section */}
            <div className="mb-8 rounded-2xl overflow-hidden border border-white/10 h-48 w-full relative">
              {product.location?.coordinates?.lat != null && product.location?.coordinates?.lng != null ? (
                <>
                {loadError ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/5 text-red-400 text-sm p-4 text-center">
                    Map failed to load. Check API Key.
                  </div>
                ) : isLoaded ? (
                  <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    center={{ lat: product.location.coordinates.lat, lng: product.location.coordinates.lng }}
                    zoom={14}
                    options={{
                      disableDefaultUI: true,
                      styles: [{ elementType: "geometry", stylers: [{ color: "#242f3e" }] }] // Dark mode map style
                    }}
                  >
                    <Marker position={{ lat: product.location.coordinates.lat, lng: product.location.coordinates.lng }} />
                  </GoogleMap>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/5 text-slate-400 text-sm">
                    Loading map...
                  </div>
                )}
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-white/5 text-slate-400 text-sm flex-col gap-2">
                  <MapPin className="w-6 h-6 opacity-50" />
                  <p>Exact location not provided by seller</p>
                  <p className="text-xs opacity-50">{product.location?.city}, {product.location?.state}</p>
                </div>
              )}
            </div>

            <p className="text-slate-300 leading-relaxed mb-8 border-t border-white/5 pt-6">
              {product.description}
            </p>

            {/* Seller Quick Chat Box */}
            <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                  {(product.owner?.name || 'S')[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-bold">{product.owner?.name || 'Seller'}</p>
                    {product.owner?.isVerified && (
                      <ShieldCheck className="w-4 h-4 text-green-400 fill-green-500/20" title="Verified" />
                    )}
                  </div>
                  <p className="text-green-400 text-xs flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    Online now
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <textarea 
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder={`Hi ${(product.owner?.name || 'Seller').split(' ')[0]}, is this still available?`}
                  className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500/50 placeholder:text-slate-500 resize-none h-24"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={isSending}
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                >
                  {isSending ? <Loader className="w-5 h-5 animate-spin" /> : <MessageCircle className="w-5 h-5" />}
                  {isSending ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}