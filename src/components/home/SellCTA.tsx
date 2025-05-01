
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
          <p className="text-gray-700">Join thousands of sellers in Jordan's leading marketplace.</p>
        </div>
        <Link 
          to={session ? "/add-product" : "/auth/login"} 
          className="px-6 py-3 bg-mzad-secondary text-white font-medium rounded-md hover:bg-mzad-secondary/90 transition-colors"
        >
          {session ? "Start Selling" : "Login to Sell"}
        </Link>
      </div>
    </div>
  );
};

export default SellCTA;
