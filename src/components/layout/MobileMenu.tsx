
import React from 'react';
import { Link } from 'react-router-dom';
import { User, Heart, Bell, Settings, HelpCircle, LogOut } from 'lucide-react';

type MobileMenuProps = {
  onClose: () => void;
};

const MobileMenu: React.FC<MobileMenuProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="bg-white h-full w-4/5 max-w-sm p-4 overflow-y-auto">
        <div className="flex flex-col h-full">
          <div className="py-6 border-b">
            <Link to="/login" onClick={onClose} className="flex items-center space-x-3 px-4 py-3 rounded-md hover:bg-gray-100">
              <User size={24} />
              <span className="font-medium">Sign In / Register</span>
            </Link>
          </div>

          <nav className="py-4 flex-1">
            <ul className="space-y-1">
              <li>
                <Link to="/" onClick={onClose} className="block px-4 py-3 rounded-md hover:bg-gray-100">Home</Link>
              </li>
              <li>
                <Link to="/categories" onClick={onClose} className="block px-4 py-3 rounded-md hover:bg-gray-100">Categories</Link>
              </li>
              <li>
                <Link to="/deals" onClick={onClose} className="block px-4 py-3 rounded-md hover:bg-gray-100">Deals</Link>
              </li>
              <li>
                <Link to="/sell" onClick={onClose} className="block px-4 py-3 rounded-md hover:bg-gray-100 font-medium text-mzad-secondary">Sell</Link>
              </li>
              <li>
                <Link to="/wishlist" onClick={onClose} className="flex items-center space-x-3 px-4 py-3 rounded-md hover:bg-gray-100">
                  <Heart size={20} />
                  <span>Wishlist</span>
                </Link>
              </li>
              <li>
                <Link to="/notifications" onClick={onClose} className="flex items-center space-x-3 px-4 py-3 rounded-md hover:bg-gray-100">
                  <Bell size={20} />
                  <span>Notifications</span>
                </Link>
              </li>
            </ul>
          </nav>

          <div className="py-4 border-t">
            <Link to="/settings" onClick={onClose} className="flex items-center space-x-3 px-4 py-3 rounded-md hover:bg-gray-100">
              <Settings size={20} />
              <span>Settings</span>
            </Link>
            <Link to="/help" onClick={onClose} className="flex items-center space-x-3 px-4 py-3 rounded-md hover:bg-gray-100">
              <HelpCircle size={20} />
              <span>Help & Contact</span>
            </Link>
            <button className="flex items-center space-x-3 px-4 py-3 rounded-md hover:bg-gray-100 w-full text-left">
              <LogOut size={20} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
      <div className="h-full w-1/5 min-w-[20%]" onClick={onClose}></div>
    </div>
  );
};

export default MobileMenu;
