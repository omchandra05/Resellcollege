import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ChevronLeft, IndianRupee, Tag, MapPin, Sparkles, Loader2, Crosshair } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../api/config';

export default function AddListing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    category: 'Electronics',
    location: '',
    description: '',
    condition: 'Good',
    images: [],
    coordinates: null // Store lat/lng here
  });

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingImages(true);
    const uploadedUrls = [...formData.images];

    try {
      for (const file of files) {
        const data = new FormData();
        data.append('file', file);
        data.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
        data.append('cloud_name', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: 'POST',
            body: data,
          }
        );

        const fileData = await res.json();
        if (fileData.secure_url) {
          uploadedUrls.push(fileData.secure_url);
        }
      }
      setFormData(prev => ({ ...prev, images: uploadedUrls }));
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to upload images. Check your Cloudinary config.");
    } finally {
      setUploadingImages(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({ ...prev, coordinates: { lat: latitude, lng: longitude } }));
        
        // Reverse Geocode to fill text field
        try {
          const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "").split('&')[0];
          if (apiKey) {
            const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`);
            const data = await res.json();
            if (data.results?.[0]) {
              const comps = data.results[0].address_components;
              const city = comps.find(c => c.types.includes('locality'))?.long_name || 
                           comps.find(c => c.types.includes('sublocality'))?.long_name;
              const state = comps.find(c => c.types.includes('administrative_area_level_1'))?.short_name;
              
              if (city && state) {
                setFormData(prev => ({ ...prev, location: `${city}, ${state}` }));
              } else if (city) {
                setFormData(prev => ({ ...prev, location: city }));
              }
            }
          }
        } catch (e) {
          console.error("Reverse geocoding failed", e);
        }
        setIsLoading(false);
      },
      (err) => {
        setError("Unable to retrieve your location. Please allow location access.");
        setIsLoading(false);
      }
    );
  };

  const handleAiImprove = async () => {
    if (!formData.title || !formData.description) {
      setError('Please provide a title and description before using AI Improve.');
      return;
    }
    setIsImproving(true);
    setError('');
    try {
      const response = await fetch('/api/ai/improve-listing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ title: formData.title, description: formData.description })
      });
      const data = await response.json();
      if (response.ok) {
        setFormData(prev => ({ 
          ...prev, 
          title: data.improvedTitle || prev.title, 
          description: data.improvedDescription || prev.description 
        }));
      } else {
        setError(data.message || 'AI improvement failed.');
      }
    } catch (err) {
      setError('Failed to connect to AI service.');
    } finally {
      setIsImproving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.images.length === 0) {
      setError('Please upload at least one image');
      setIsLoading(false);
      return;
    }

    try {
      // Split location into city and state as expected by backend
      const [city, state] = formData.location.split(',').map(s => s.trim());

      const response = await fetch(API_ENDPOINTS.PRODUCTS.LIST, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          ...formData,
          city: city || formData.location,
          state: state || 'Unknown',
          price: Number(formData.price)
        }),
      });

      if (response.ok) {
        navigate('/profile');
      } else {
        setError(data.message || 'Failed to create listing');
      }
    } catch (err) {
      console.error('Submission error:', err);
      setError('Network error. Please check if your server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pb-20">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
      >
        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      <div className="mb-10">
        <h1 className="text-4xl font-black text-white mb-2">List New Item</h1>
        <p className="text-slate-400">Fill in the details below to reach thousands of buyers.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl mb-6 font-bold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Photo Upload Zone */}
        <div className="space-y-4">
          <label className="text-sm font-bold text-slate-200 ml-1">Product Photos</label>
          <div 
            className={`glass-card p-12 border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all ${
              dragActive ? 'border-blue-500 bg-blue-500/5' : 'border-white/10 hover:border-white/20'
            } ${uploadingImages ? 'opacity-50 pointer-events-none' : ''}`}
            onDragOver={() => setDragActive(true)}
            onDragLeave={() => setDragActive(false)}
          >
            {uploadingImages ? (
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            ) : (
              <>
                <div className="bg-blue-600/20 p-4 rounded-full text-blue-400">
                  <Camera className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <p className="text-white font-bold">Click or drag photos here</p>
                  <p className="text-slate-500 text-sm mt-1">Upload up to 5 high-quality images</p>
                </div>
              </>
            )}
            <input 
              type="file" 
              multiple 
              className="hidden" 
              id="file-upload" 
              onChange={handleImageUpload}
              accept="image/*"
            />
            <label 
              htmlFor="file-upload" 
              className="mt-2 px-6 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-bold rounded-xl border border-white/10 cursor-pointer transition-colors"
            >
              Select Files
            </label>
          </div>

          {/* Image Previews */}
          <div className="flex gap-4 overflow-x-auto pb-2">
            {formData.images.map((url, index) => (
              <div key={index} className="relative w-24 h-24 shrink-0">
                <img src={url} alt="preview" className="w-full h-full object-cover rounded-xl border border-white/10" />
                <button 
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"
                >
                  <Tag className="w-3 h-3 rotate-45" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Basic Info Card */}
        <div className="glass-card p-8 space-y-6 border-white/5">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-300 ml-1">Listing Title</label>
            <input 
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. iPhone 15 Pro Max - Blue Titanium" 
              required
              className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-600"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300 ml-1">Price</label>
              <div className="relative">
                <IndianRupee className="absolute left-4 top-4 w-5 h-5 text-slate-500" />
                <input 
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00" 
                  required
                  className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300 ml-1">Category</label>
              <div className="relative">
                <Tag className="absolute left-4 top-4 w-5 h-5 text-slate-500" />
                <select 
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option>Electronics</option>
                  <option>Furniture</option>
                  <option>Fashion</option>
                  <option>Collectibles</option>
                  <option>Vehicles</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Location & Description */}
        <div className="glass-card p-8 space-y-6 border-white/5">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-300 ml-1">Location</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-4 w-5 h-5 text-slate-500" />
              <input 
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="City, State" 
                required
                className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pl-12 pr-32 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
              />
              <div className="absolute right-2 top-2 bottom-2 flex gap-2">
                {formData.coordinates && (
                  <button type="button" onClick={() => setFormData(prev => ({ ...prev, coordinates: null }))} className="px-3 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-xl text-xs font-bold transition-all">
                    Clear
                  </button>
                )}
                <button type="button" onClick={handleGetLocation} className="px-3 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-xl text-xs font-bold flex items-center gap-1 transition-all">
                  <Crosshair className="w-3 h-3" />
                  {formData.coordinates ? 'Update' : 'My Loc'}
                </button>
              </div>
            </div>
            {formData.coordinates && (
              <p className="text-xs text-green-400 ml-1">✓ Exact location coordinates captured</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-sm font-bold text-slate-300">Description</label>
              <button 
                type="button" 
                onClick={handleAiImprove}
                disabled={isImproving}
                className="text-blue-400 text-xs font-bold flex items-center gap-1 hover:text-blue-300 disabled:opacity-50"
              >
                <Sparkles className={`w-3 h-3 ${isImproving ? 'animate-pulse' : ''}`} />
                {isImproving ? 'Improving...' : 'AI Improve'}
              </button>
            </div>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what you're selling. Mention condition, features, and why you're selling it." 
              required
              className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 text-white h-40 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-600 resize-none"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button 
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 px-8 py-4 glass-card border-white/10 text-white font-bold hover:bg-white/5 transition-all"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={isLoading}
            className="flex-[2] px-8 py-4 bg-blue-600 text-white font-bold rounded-3xl hover:bg-blue-500 shadow-xl shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Publishing...
              </>
            ) : 'Publish Listing'}
          </button>
        </div>
      </form>
    </div>
  );
}