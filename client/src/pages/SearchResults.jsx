import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Sparkles, Filter, ArrowUpDown, Zap, BrainCircuit, Loader } from 'lucide-react';
import ProductCard from '../features/products/ProductCard';
import { API_ENDPOINTS } from '../api/config';

export default function SearchResults() {
  const location = useLocation();
  // Get the query passed from the Navbar navigation state
  const searchQuery = location.state?.query || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_ENDPOINTS.PRODUCTS.LIST}?search=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        
        if (response.ok) {
          setProducts(data.data.products);
        } else {
          setError(data.message || 'Search failed');
        }
      } catch (err) {
        console.error("Search error:", err);
        setError('Failed to load search results');
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 pb-20">
      {/* AI Header Section */}
      <div className="glass-card p-8 mb-10 border-blue-500/20 bg-blue-500/5 relative overflow-hidden">
        <BrainCircuit className="absolute -right-10 -top-10 w-64 h-64 text-blue-500/10 rotate-12" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 text-blue-400 mb-2">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-black uppercase tracking-widest">AI Insights Applied</span>
            </div>
            {/* DYNAMIC TITLE */}
            <h1 className="text-4xl font-black text-white">
              Results for "{searchQuery || 'All Items'}"
            </h1>
            <p className="text-slate-400 mt-2 max-w-2xl">
              I've analyzed the marketplace to find the <span className="text-white font-bold">best price-to-condition ratio</span> for items matching your search.
            </p>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white px-5 py-3 rounded-2xl font-bold hover:bg-white/10 transition-all">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white px-5 py-3 rounded-2xl font-bold hover:bg-white/10 transition-all">
              <ArrowUpDown className="w-4 h-4" />
              Sort
            </button>
          </div>
        </div>
      </div>

      {/* Smart Filters Grid */}
      <div className="flex flex-wrap gap-3 mb-12 items-center">
        <span className="text-slate-500 text-sm font-bold mr-2 uppercase tracking-tight">AI Filters:</span>
        {['Verified Only', 'Best Value', 'Local Pickup', 'Recent'].map((filter) => (
          <button key={filter} className="px-4 py-2 rounded-xl bg-blue-600/10 border border-blue-500/30 text-blue-400 text-xs font-bold hover:bg-blue-600 hover:text-white transition-all">
            {filter}
          </button>
        ))}
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader className="w-10 h-10 text-blue-500 animate-spin mb-4" />
          <p className="text-slate-400">Analyzing marketplace...</p>
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-red-400 font-bold">{error}</p>
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((item) => (
            <div key={item._id} className="relative">
              {/* AI Floating Insight Tag with animate-bounce */}
              <div className="absolute -top-3 -right-3 z-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 animate-bounce">
                <Zap className="w-3 h-3 fill-current" />
                <span className="text-[10px] font-black uppercase tracking-tighter">
                  {item.price < 1000 ? "Great Value" : "Verified"}
                </span>
              </div>
              
              <ProductCard item={{
                ...item,
                id: item._id,
                name: item.title,
                image: item.images?.[0],
                location: typeof item.location === 'object' ? `${item.location.city}, ${item.location.state}` : item.location
              }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-slate-400">No items found matching your search.</p>
        </div>
      )}
    </div>
  );
}