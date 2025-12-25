import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Hero from '../components/Home/Hero';
import ProductCard from '../features/products/ProductCard';
import Categories from '../components/Home/Categories';
import HowItWorks from '../components/Home/HowItWorks';
import { API_ENDPOINTS } from '../api/config';
import { Loader } from 'lucide-react';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSearch = (query) => {
    navigate('/search', { state: { query } });
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.PRODUCTS.LIST);
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
  }, []);

  return (
    <>
      {/* Hero section with glass search */}
      <Hero onSearch={handleSearch} />

      <div className="max-w-7xl mx-auto px-4">
        {/* Categories Section */}
        <Categories />

        {/* Product Grid */}
        <div className="mt-24">
        <div className="flex items-center justify-between mb-8 px-2">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Featured Listings
          </h2>
          <Link to="/listings" className="text-blue-400 font-semibold text-sm hover:text-blue-300 transition-colors">
            View all
          </Link>
        </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader className="w-10 h-10 text-blue-500 animate-spin mb-4" />
              <p className="text-slate-400">Discovering amazing items...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-400 font-bold">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 text-blue-400 hover:underline"
              >
                Try again
              </button>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {products.map(item => (
                <ProductCard 
                  key={item._id} 
                  item={{
                    ...item,
                    id: item._id, // Normalize ID so ProductCard can use item.id
                    name: item.title, // Map title to name for ProductCard
                    image: item.images?.[0], // Map first image to image for ProductCard
                    // Ensure location is a string for the ProductCard component
                    location: typeof item.location === 'object' ? `${item.location.city}, ${item.location.state}` : item.location
                  }} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-slate-400">No listings found. Be the first to sell something!</p>
            </div>
          )}
        </div>

        {/* How It Works Section */}
        <HowItWorks />
      </div>
    </>
  );
}