import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, UserCircle, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';import { API_ENDPOINTS } from '../api/config';
export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'buyer' // Default role
  });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.SIGNUP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (response.ok) {
        login(data); // Save user to context & localStorage
        navigate(data.role === 'seller' ? '/profile' : '/');
      } else {
        alert(data.message || "Signup failed");
      }
    } catch (err) {
      console.error("Connection error:", err);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10">
      <div className="glass-card p-10 border-white/10 shadow-2xl">
        <h1 className="text-4xl font-black text-white mb-2">Join Resell</h1>
        <p className="text-slate-400 mb-8">Create your account to start trading.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <button
              type="button"
              onClick={() => setFormData({...formData, role: 'buyer'})}
              className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                formData.role === 'buyer' 
                ? 'border-blue-500 bg-blue-500/10 text-white' 
                : 'border-white/5 bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              <UserCircle className="w-6 h-6" />
              <span className="font-bold">I am a Buyer</span>
            </button>
            <button
              type="button"
              onClick={() => setFormData({...formData, role: 'seller'})}
              className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                formData.role === 'seller' 
                ? 'border-blue-500 bg-blue-500/10 text-white' 
                : 'border-white/5 bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              <Store className="w-6 h-6" />
              <span className="font-bold">I am a Seller</span>
            </button>
          </div>

          {/* Inputs */}
          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-4 w-5 h-5 text-slate-500" />
              <input 
                type="text" 
                placeholder="Full Name" 
                className="w-full bg-black/20 border border-white/10 p-4 pl-12 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div className="relative">
              <User className="absolute left-4 top-4 w-5 h-5 text-slate-500" />
              <input 
                type="text" 
                placeholder="Username" 
                className="w-full bg-black/20 border border-white/10 p-4 pl-12 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                required
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-4 top-4 w-5 h-5 text-slate-500" />
              <input 
                type="email" 
                placeholder="Email Address" 
                className="w-full bg-black/20 border border-white/10 p-4 pl-12 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-4 w-5 h-5 text-slate-500" />
              <input 
                type="password" 
                placeholder="Create Password" 
                className="w-full bg-black/20 border border-white/10 p-4 pl-12 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>
          </div>

          <button className="w-full bg-blue-600 py-4 rounded-2xl font-black text-lg shadow-lg shadow-blue-500/30 hover:bg-blue-500 transition-all active:scale-[0.98]">
            Create Account
          </button>
        </form>

        <p className="text-center text-slate-500 mt-8">
          Already have an account? <Link to="/login" className="text-blue-400 font-bold hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
}