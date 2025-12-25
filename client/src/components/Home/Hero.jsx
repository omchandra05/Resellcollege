import React, { useState } from 'react';
import { Search, Sparkles, ArrowRight } from 'lucide-react';

export default function Hero({ onSearch }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch && query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <div className="relative pt-10 pb-16 flex flex-col items-center text-center px-4">
      {/* Small Badge - Added dark:bg-blue-900/20 and dark:text-blue-400 */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100/50 dark:border-blue-800/30 text-blue-600 dark:text-blue-400 text-sm font-medium mb-6 animate-fade-in transition-colors">
        <Sparkles className="w-4 h-4" />
        <span>AI-Powered Marketplace for 2026</span>
      </div>

      {/* Main Title - Added dark:text-white */}
      <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 dark:text-white mb-6 max-w-4xl transition-colors">
        Give your items a <br />
        <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
          Second Life.
        </span>
      </h1>

      {/* Subtitle - Added dark:text-slate-300 */}
      <p className="text-lg text-slate-600 dark:text-slate-300 mb-10 max-w-2xl leading-relaxed transition-colors">
        Join the smart community where AI helps you find the best deals and chat 
        seamlessly with sellers. Buy, sell, and resell with total confidence.
      </p>

      {/* Glassmorphic Search Bar - Added dark support for input and shadow */}
      <form 
        onSubmit={handleSubmit}
        className="w-full max-w-3xl glass-card p-2 flex items-center gap-2 shadow-2xl shadow-blue-500/10 dark:shadow-blue-900/20 transition-all"
      >
        <div className="flex-1 relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for electronics, furniture, or clothes..." 
            className="w-full bg-transparent border-none py-4 pl-12 pr-4 outline-none text-slate-800 dark:text-white placeholder:text-slate-400 font-medium transition-colors"
          />
        </div>
        <button 
          type="submit"
          className="hidden sm:flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-500/30"
        >
          Search Now
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Quick Category Tags - Added dark mode borders and text */}
      <div className="flex flex-wrap justify-center gap-3 mt-8">
        {['iPhone', 'Sneakers', 'Laptops', 'Gaming'].map((tag) => (
          <span 
            key={tag} 
            onClick={() => onSearch && onSearch(tag)}
            className="px-4 py-1.5 rounded-xl bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10 text-slate-500 dark:text-slate-400 text-sm hover:bg-white dark:hover:bg-blue-600/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all cursor-pointer"
          >
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
}