import { MapPin, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Changed from Link to useNavigate
import { useAuth } from '../../context/AuthContext'; // Import your Auth Hook

export default function ProductCard({ item }) {
  const { user } = useAuth(); // Access the dynamic user state
  const navigate = useNavigate();

  // Normalize data to handle both raw DB objects and formatted props
  const id = item._id || item.id;
  const title = item.title || item.name;
  const image = item.image || item.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop';
  const location = item.location && typeof item.location === 'object' ? `${item.location.city}, ${item.location.state}` : item.location;

  const handleAction = () => {
    if (!user) {
      // DYNAMIC CHECK: If no user session, force signup
      navigate('/signup');
    } else {
      // If logged in, proceed to product details/contact
      navigate(`/product/${id}`);
    }
  };

  return (
    <div className="glass-card group relative p-3 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(59,130,246,0.2)] hover:-translate-y-2">
      
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#1e293b]">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
        />
        
        <div className="absolute top-3 left-3 bg-blue-600/90 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white">
          {item.category}
        </div>
      </div>

      {/* Details Area */}
      <div className="mt-4 px-1 pb-2">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-white text-lg truncate flex-1 leading-tight">
            {title}
          </h3>
          <span className="text-blue-400 font-black text-lg ml-2">
            ₹ {item.price}
          </span>
        </div>
        
        <div className="flex items-center gap-1 text-slate-200 text-xs mt-2 mb-4 font-medium">
          <MapPin className="w-3.5 h-3.5 text-white" />
          <span>{location}</span>
        </div>
        
        {/* DYNAMIC CONTACT BUTTON */}
        <button 
          onClick={handleAction}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-500 shadow-[0_4px_15px_rgba(37,99,235,0.3)] transition-all active:scale-95"
        >
          <MessageCircle className="w-4 h-4" />
          Contact Seller
        </button>
      </div>
    </div>
  );
}