
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-block">
            <div className="flex items-center justify-center">
              <span className="text-3xl font-bold text-mzad-primary">Mzad</span>
              <span className="text-3xl font-bold text-mzad-secondary">KumSooq</span>
            </div>
          </Link>
        </div>

        <Outlet />

        <div className="mt-8 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} MzadKumSooq. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
