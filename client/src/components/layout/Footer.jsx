import React from 'react';
import { Twitter, Instagram, Facebook, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative z-10 mt-20 border-t border-white/10 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Logo & Socials */}
          <div className="col-span-2 lg:col-span-1">
            <h3 className="text-2xl font-black text-white mb-4">Resell</h3>
            <p className="text-sm mb-6">The AI-powered marketplace for a new generation.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white"><Twitter size={20} /></a>
              <a href="#" className="hover:text-white"><Instagram size={20} /></a>
              <a href="#" className="hover:text-white"><Facebook size={20} /></a>
              <a href="#" className="hover:text-white"><Linkedin size={20} /></a>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase text-sm tracking-wider">Product</h4>
            <a href="#" className="block hover:text-white text-sm">Features</a>
            <a href="#" className="block hover:text-white text-sm">Pricing</a>
            <a href="#" className="block hover:text-white text-sm">Updates</a>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase text-sm tracking-wider">Company</h4>
            <a href="#" className="block hover:text-white text-sm">About</a>
            <a href="#" className="block hover:text-white text-sm">Careers</a>
            <a href="#" className="block hover:text-white text-sm">Contact</a>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase text-sm tracking-wider">Resources</h4>
            <a href="#" className="block hover:text-white text-sm">Help Center</a>
            <a href="#" className="block hover:text-white text-sm">Safety Tips</a>
            <a href="#" className="block hover:text-white text-sm">Blog</a>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase text-sm tracking-wider">Legal</h4>
            <a href="#" className="block hover:text-white text-sm">Terms of Service</a>
            <a href="#" className="block hover:text-white text-sm">Privacy Policy</a>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center text-xs">
          <p>&copy; {new Date().getFullYear()} Resellcollege. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}