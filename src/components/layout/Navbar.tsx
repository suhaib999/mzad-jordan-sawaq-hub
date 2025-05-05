
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ShoppingCart, Heart, Menu, LogIn, LogOut, User, 
  PlusSquare, Settings, Bell, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import CartButton from '@/components/cart/CartButton';
import SearchBox from '@/components/search/SearchBox';
import { Badge } from '@/components/ui/badge';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';

const Navbar = ({ toggleMobileMenu }: { toggleMobileMenu: () => void }) => {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(prev => !prev);
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-white">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <span className="font-bold text-xl text-mzad-primary">Mzad</span>
          <span className="font-bold text-xl text-mzad-secondary">KumSooq</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          <Link to="/" className={`px-3 py-2 text-sm font-medium rounded-md ${isActive('/') ? 'bg-mzad-primary/10 text-mzad-primary' : 'text-gray-700 hover:bg-gray-100'}`}>
            {t('home')}
          </Link>
          <Link to="/browse" className={`px-3 py-2 text-sm font-medium rounded-md ${isActive('/browse') ? 'bg-mzad-primary/10 text-mzad-primary' : 'text-gray-700 hover:bg-gray-100'}`}>
            {t('browse')}
          </Link>
          <Link to="/sell" className={`px-3 py-2 text-sm font-medium rounded-md ${isActive('/sell') ? 'bg-mzad-primary/10 text-mzad-primary' : 'text-gray-700 hover:bg-gray-100'}`}>
            {t('sell')}
          </Link>
        </nav>

        {/* Search Box (Hidden on Small Screens) */}
        <div className="hidden md:block flex-grow max-w-md mx-4">
          <SearchBox />
        </div>

        {/* Right Side Navigation */}
        <div className="flex items-center space-x-2">
          {user ? (
            <>
              <Link to="/wishlist" className="relative p-2 text-gray-700 hover:text-mzad-primary">
                <Heart className="h-5 w-5" />
              </Link>
              <CartButton />
              <div className="hidden sm:block">
                <Button variant="outline" size="sm">
                  <Link to="/my-listings" className="flex items-center">
                    <PlusSquare className="mr-1 h-4 w-4" />
                    <span>{t('myListings')}</span>
                  </Link>
                </Button>
              </div>
              
              {/* Profile dropdown menu */}
              <div className="relative" ref={profileMenuRef}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center gap-1" 
                  onClick={toggleProfileMenu}
                >
                  <div className="w-8 h-8 rounded-full bg-mzad-primary text-white flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                  <ChevronDown className="h-3 w-3" />
                </Button>
                
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsProfileMenuOpen(false)}>
                      My Profile
                    </Link>
                    <Link to="/my-listings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsProfileMenuOpen(false)}>
                      My Listings
                    </Link>
                    <Link to="/my-bids" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsProfileMenuOpen(false)}>
                      My Bids
                    </Link>
                    <Link to="/wishlist" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsProfileMenuOpen(false)}>
                      Wishlist
                    </Link>
                    <Link to="/notifications" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsProfileMenuOpen(false)}>
                      Notifications
                    </Link>
                    <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsProfileMenuOpen(false)}>
                      Settings
                    </Link>
                    <button 
                      onClick={() => {
                        signOut();
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <CartButton />
              <div className="hidden sm:block">
                <Button className="bg-mzad-primary">
                  <Link to="/auth/login" className="flex items-center">
                    <LogIn className="mr-1 h-4 w-4" />
                    <span>{t('signIn')}</span>
                  </Link>
                </Button>
              </div>
            </>
          )}
          
          {/* Language Switcher */}
          <LanguageSwitcher />
          
          {/* Mobile Menu Button */}
          <Button
            variant="outline"
            size="icon"
            className="md:hidden"
            onClick={toggleMobileMenu}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>
      
      {/* Mobile Search (Visible only on small screens) */}
      <div className="md:hidden px-4 pb-3">
        <SearchBox />
      </div>
    </header>
  );
};

export default Navbar;
