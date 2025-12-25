import React from 'react';
import { useAuth } from '../context/AuthContext';
import SellerDashboard from '../components/profile/SellerDashboard';
import BuyerProfile from '../components/profile/BuyerProfile';

export default function Profile() {
  const { user, loading } = useAuth();

  if (loading) return <div className="pt-40 text-center">Loading Profile...</div>;
  if (!user) return <div className="pt-40 text-center text-slate-400">Please login to view your profile.</div>;

  // Context Switch based on Role
  return (
    <>
      {user.role === 'seller' ? (
        <SellerDashboard user={user} />
      ) : (
        <BuyerProfile user={user} />
      )}
    </>
  );
}