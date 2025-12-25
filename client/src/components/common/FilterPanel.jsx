import React, { useState, useEffect } from 'react';
import { X, RotateCcw } from 'lucide-react';

const categories = ["Mobiles", "Laptops", "Electronics", "Furniture", "Books", "Vehicles", "Fashion", "Sports", "Other"];
const conditions = ["Brand New", "Like New", "Good", "Fair", "Used"];

export default function FilterPanel({ show, onClose, onApply, initialFilters }) {
  const defaultFilters = {
    category: '',
    condition: '',
    sortBy: 'createdAt-desc',
    priceMin: '',
    priceMax: ''
  };

  const [filters, setFilters] = useState(initialFilters || defaultFilters);

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFilters(defaultFilters);
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      ></div>

      {/* Panel */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-[#0f172a] shadow-2xl z-50 transform transition-transform duration-300 ${show ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-white">Filters</h2>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10">
              <X size={20} />
            </button>
          </div>

          {/* Filters */}
          <div className="flex-1 p-6 space-y-8 overflow-y-auto">
            {/* Sort By */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Sort By</h3>
              <select name="sortBy" value={filters.sortBy} onChange={handleInputChange} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500/50 outline-none">
                <option value="createdAt-desc">Most Recent</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>

            {/* Price Range */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Price Range (₹)</h3>
              <div className="flex items-center gap-4">
                <input type="number" name="priceMin" value={filters.priceMin} onChange={handleInputChange} placeholder="Min" className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500/50 outline-none" />
                <span className="text-slate-500">-</span>
                <input type="number" name="priceMax" value={filters.priceMax} onChange={handleInputChange} placeholder="Max" className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500/50 outline-none" />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Category</h3>
              <select name="category" value={filters.category} onChange={handleInputChange} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500/50 outline-none">
                <option value="">All Categories</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            {/* Condition */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Condition</h3>
              <select name="condition" value={filters.condition} onChange={handleInputChange} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500/50 outline-none">
                <option value="">Any Condition</option>
                {conditions.map(con => <option key={con} value={con}>{con}</option>)}
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 flex gap-4">
            <button onClick={handleReset} className="flex-1 flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white px-5 py-3 rounded-2xl font-bold hover:bg-white/10 transition-all">
              <RotateCcw size={16} />
              Reset
            </button>
            <button onClick={handleApply} className="flex-[2] bg-blue-600 text-white px-5 py-3 rounded-2xl font-bold hover:bg-blue-500 transition-all">
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </>
  );
}