import React, { useState, useEffect } from 'react';
import ProductCard from '../features/products/ProductCard';
import FilterPanel from '../components/common/FilterPanel';
import { API_ENDPOINTS } from '../api/config';
import { Loader, Filter } from 'lucide-react';

export default function ProductListings() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    category: '',
    condition: '',
    sortBy: 'createdAt-desc',
    priceMin: '',
    priceMax: ''
  });

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (activeFilters.category) queryParams.append('category', activeFilters.category);
        if (activeFilters.condition) queryParams.append('condition', activeFilters.condition);
        if (activeFilters.sortBy) queryParams.append('sort', activeFilters.sortBy);
        if (activeFilters.priceMin) queryParams.append('price[gte]', activeFilters.priceMin);
        if (activeFilters.priceMax) queryParams.append('price[lte]', activeFilters.priceMax);

        const response = await fetch(`${API_ENDPOINTS.PRODUCTS.LIST}?${queryParams.toString()}`);
        const data = await response.json();
        if (response.ok) {
          setProducts(data.data.products);
        } else {
          setError(data.message || 'Failed to fetch products');
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [activeFilters]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">Explore Marketplace</h1>
          <p className="text-slate-400">Find the best deals from students across the campus.</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={() => setShowFilters(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white px-5 py-3 rounded-2xl font-bold hover:bg-white/10 transition-all"
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      <FilterPanel 
        show={showFilters} 
        onClose={() => setShowFilters(false)}
        onApply={setActiveFilters}
        initialFilters={activeFilters}
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader className="w-10 h-10 text-blue-500 animate-spin mb-4" />
          <p className="text-slate-400">Loading marketplace...</p>
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-red-400 font-bold">{error}</p>
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map(item => (
            <ProductCard 
              key={item._id} 
              item={{
                ...item,
                id: item._id,
                name: item.title,
                image: item.images?.[0],
                location: typeof item.location === 'object' ? `${item.location.city}, ${item.location.state}` : item.location
              }} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-slate-400">No products available at the moment.</p>
        </div>
      )}
    </div>
  );
}