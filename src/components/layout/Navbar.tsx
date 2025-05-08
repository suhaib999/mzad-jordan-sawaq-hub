import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ShoppingCart, Heart, Menu, LogIn, LogOut, User, 
  PlusSquare, Settings, Bell, ChevronDown, Tag, Bookmark
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import CartButton from '@/components/cart/CartButton';
import SearchBox from '@/components/search/SearchBox';
import { Badge } from '@/components/ui/badge';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import UserDropdownMenu from './UserDropdownMenu';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

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
              
              {/* User dropdown menu */}
              <UserDropdownMenu />
            </>
          ) : (
            <>
              <CartButton />
              <div className="hidden sm:block">
                <Button className="bg-mzad-primary">
                  <Link to="/login" className="flex items-center">
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
