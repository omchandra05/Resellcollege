import React from 'react';
import { Smartphone, Laptop, Sofa, Car, Shirt, Dumbbell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const categoryData = [
  { name: 'Mobiles', icon: <Smartphone size={32} />, color: 'from-blue-500 to-blue-700' },
  { name: 'Laptops', icon: <Laptop size={32} />, color: 'from-indigo-500 to-indigo-700' },
  { name: 'Furniture', icon: <Sofa size={32} />, color: 'from-purple-500 to-purple-700' },
  { name: 'Vehicles', icon: <Car size={32} />, color: 'from-green-500 to-green-700' },
  { name: 'Fashion', icon: <Shirt size={32} />, color: 'from-pink-500 to-pink-700' },
  { name: 'Sports', icon: <Dumbbell size={32} />, color: 'from-orange-500 to-orange-700' },
];

export default function Categories() {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryName) => {
    navigate('/search', { state: { query: categoryName } });
  };

  return (
    <div className="px-4 mt-24">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-extrabold text-white tracking-tight">
          Browse by Category
        </h2>
        <p className="text-slate-400 mt-2">Explore our most popular categories.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {categoryData.map((cat) => (
          <div 
            key={cat.name}
            onClick={() => handleCategoryClick(cat.name)}
            className="group relative p-8 rounded-3xl bg-white/5 border border-white/10 overflow-hidden cursor-pointer transition-all duration-500 hover:border-blue-500/50 hover:-translate-y-2"
          >
            <div className={`absolute -top-4 -right-4 w-24 h-24 rounded-full bg-gradient-to-bl ${cat.color} opacity-20 group-hover:opacity-40 transition-opacity duration-500 blur-xl`}></div>
            <div className="relative z-10 flex flex-col items-center justify-center text-center">
              <div className={`mb-4 p-4 rounded-2xl bg-gradient-to-br ${cat.color} text-white shadow-lg`}>
                {cat.icon}
              </div>
              <h3 className="font-bold text-white">{cat.name}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}