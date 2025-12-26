import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 1. Import the AuthProvider
import { AuthProvider } from './context/AuthContext'; 
import ProtectedRoute from './components/common/ProtectedRoute';

// Import components
import Navbar from './components/layout/Navbar';

import Footer from './components/layout/Footer';
import Home from './pages/Home';
import AIChatbot from './features/ai-bot/AIChatbot';
import Scene3D from './components/layout/Scene3D';
import ProductDetails from './pages/ProductDetails';
import Profile from './pages/Profile';
import AddListing from './pages/AddListing';
import ChatPage from './pages/ChatPage';
import SearchResults from './pages/SearchResults';
import Login from './pages/Login';   
import Signup from './pages/Signup'; 
import EditListing from './pages/EditListing';
import ProductListings from './pages/ProductListings';

function App() {
  return (
    // 2. Wrap EVERYTHING in AuthProvider
    <AuthProvider>
      <Router>
        <div className="relative min-h-screen overflow-x-hidden text-white">
          
          {/* 1. 3D Background Layer */}
          <Suspense fallback={<div className="fixed inset-0 bg-[#020617]" />}>
            <Scene3D />
          </Suspense>

          {/* 2. Glassmorphic Fixed Navbar */}
          <Navbar />

          {/* 3. Main Content Layer */}
          <main className="relative z-10 pt-32 pb-20">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/listings" element={<ProductListings />} />
              <Route path="/search" element={<SearchResults />} />
              
              {/* Protected Routes - Require Authentication */}
              <Route path="/chat" element={<ProtectedRoute element={<ChatPage />} />} />
              <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
              
              {/* Protected Routes - Seller Only */}
              <Route 
                path="/add-listing" 
                element={<ProtectedRoute element={<AddListing />} requiredRoles={['seller']} />} 
              />
              <Route path="/edit-listing/:id" element={<EditListing />} />
            </Routes>
          </main>

          {/* 4. AI Chatbot */}
          <AIChatbot />

          {/* 5. Footer */}
          <Footer />
          
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;