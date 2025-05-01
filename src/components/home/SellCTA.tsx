
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const SellCTA = () => {
  const { session } = useAuth();
  
  return (
    <div className="bg-mzad-accent/20 p-6 rounded-lg my-12">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="mb-6 md:mb-0 md:mr-6">
          <h2 className="text-2xl font-bold mb-2">Ready to sell on MzadKumSooq?</h2>
          <p className="text-gray-700">{session ? "Manage your listings or create a new one." : "Join thousands of sellers in Jordan's leading marketplace."}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          {session && (
            <Link 
              to="/my-listings" 
              className="px-6 py-3 bg-white border border-mzad-secondary text-mzad-secondary font-medium rounded-md hover:bg-gray-50 transition-colors"
            >
              My Listings
            </Link>
          )}
          <Link 
            to={session ? "/add-product" : "/auth/login"} 
            className="px-6 py-3 bg-mzad-secondary text-white font-medium rounded-md hover:bg-mzad-secondary/90 transition-colors"
          >
            {session ? "Create Listing" : "Login to Sell"}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SellCTA;
