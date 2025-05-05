
import React from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  Home,
  Search,
  ShoppingCart,
  User,
  Heart,
  PlusSquare,
  MessageSquare,
  Settings,
  LogIn,
  LogOut
} from 'lucide-react';

interface MobileMenuProps {
  onClose: () => void;
  isLoggedIn: boolean;
  onSignOut: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ onClose, isLoggedIn, onSignOut }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex md:hidden">
      <div className="bg-white w-4/5 max-w-sm h-full flex flex-col overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center">
            <span className="font-bold text-xl text-mzad-primary">Mzad</span>
            <span className="font-bold text-xl text-mzad-secondary">KumSooq</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            <Link
              to="/"
              className="flex items-center px-4 py-3 text-gray-800 hover:bg-gray-100 rounded-md"
              onClick={onClose}
            >
              <Home className="mr-3 h-5 w-5 text-mzad-primary" />
              Home
            </Link>
            
            <Link
              to="/browse"
              className="flex items-center px-4 py-3 text-gray-800 hover:bg-gray-100 rounded-md"
              onClick={onClose}
            >
              <Search className="mr-3 h-5 w-5 text-mzad-primary" />
              Browse
            </Link>
            
            {isLoggedIn ? (
              <>
                <Link
                  to="/cart"
                  className="flex items-center px-4 py-3 text-gray-800 hover:bg-gray-100 rounded-md"
                  onClick={onClose}
                >
                  <ShoppingCart className="mr-3 h-5 w-5 text-mzad-primary" />
                  Cart
                </Link>
                
                <Link
                  to="/wishlist"
                  className="flex items-center px-4 py-3 text-gray-800 hover:bg-gray-100 rounded-md"
                  onClick={onClose}
                >
                  <Heart className="mr-3 h-5 w-5 text-mzad-primary" />
                  Wishlist
                </Link>
                
                <Link
                  to="/profile"
                  className="flex items-center px-4 py-3 text-gray-800 hover:bg-gray-100 rounded-md"
                  onClick={onClose}
                >
                  <User className="mr-3 h-5 w-5 text-mzad-primary" />
                  My Profile
                </Link>
                
                <Link
                  to="/my-listings"
                  className="flex items-center px-4 py-3 text-gray-800 hover:bg-gray-100 rounded-md"
                  onClick={onClose}
                >
                  <PlusSquare className="mr-3 h-5 w-5 text-mzad-primary" />
                  My Listings
                </Link>
                
                <Link
                  to="/messages"
                  className="flex items-center px-4 py-3 text-gray-800 hover:bg-gray-100 rounded-md"
                  onClick={onClose}
                >
                  <MessageSquare className="mr-3 h-5 w-5 text-mzad-primary" />
                  Messages
                </Link>
                
                <Link
                  to="/sell"
                  className="flex items-center px-4 py-3 font-semibold text-gray-800 hover:bg-gray-100 rounded-md"
                  onClick={onClose}
                >
                  <PlusSquare className="mr-3 h-5 w-5 text-mzad-secondary" />
                  Sell Item
                </Link>
                
                <hr className="my-4" />
                
                <Link
                  to="/settings"
                  className="flex items-center px-4 py-3 text-gray-800 hover:bg-gray-100 rounded-md"
                  onClick={onClose}
                >
                  <Settings className="mr-3 h-5 w-5" />
                  Settings
                </Link>
                
                <button
                  onClick={() => {
                    onSignOut();
                    onClose();
                  }}
                  className="w-full flex items-center px-4 py-3 text-gray-800 hover:bg-gray-100 rounded-md"
                >
                  <LogOut className="mr-3 h-5 w-5 text-red-500" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center px-4 py-3 font-semibold text-gray-800 hover:bg-gray-100 rounded-md"
                  onClick={onClose}
                >
                  <LogIn className="mr-3 h-5 w-5 text-mzad-primary" />
                  Log In
                </Link>
                
                <Link
                  to="/register"
                  className="flex items-center px-4 py-3 font-semibold text-gray-800 hover:bg-gray-100 rounded-md"
                  onClick={onClose}
                >
                  <User className="mr-3 h-5 w-5 text-mzad-secondary" />
                  Register
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
      <div className="flex-1" onClick={onClose}></div>
    </div>
  );
};

export default MobileMenu;
