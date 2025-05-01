
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, User, ShoppingCart, Menu, X, Heart, Bell } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MobileMenu from './MobileMenu';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search logic
    console.log('Searching for:', searchQuery);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-mzad-primary">Mzad</span>
              <span className="text-2xl font-bold text-mzad-secondary">KumSooq</span>
            </Link>
          </div>

          {/* Search bar - Hide on mobile */}
          <div className="hidden md:flex flex-1 mx-4">
            <form onSubmit={handleSearch} className="w-full max-w-2xl relative">
              <Input
                type="search"
                placeholder="Search for anything..."
                className="w-full pl-4 pr-10 py-2 border rounded-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button 
                type="submit" 
                className="absolute right-0 top-0 bottom-0 px-3 rounded-r-md"
                variant="ghost"
              >
                <Search size={20} />
              </Button>
            </form>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <LanguageSwitcher />
            <Link to="/wishlist">
              <Button variant="ghost" size="icon">
                <Heart size={20} />
              </Button>
            </Link>
            <Link to="/notifications">
              <Button variant="ghost" size="icon">
                <Bell size={20} />
              </Button>
            </Link>
            <Link to="/cart">
              <Button variant="ghost" size="icon">
                <ShoppingCart size={20} />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" className="flex items-center">
                <User size={18} className="mr-2" />
                Login
              </Button>
            </Link>
            <Link to="/sell">
              <Button className="bg-mzad-secondary hover:bg-mzad-secondary/90">Sell</Button>
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Link to="/cart" className="mr-2">
              <Button variant="ghost" size="icon">
                <ShoppingCart size={20} />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>

        {/* Mobile Search - only visible on mobile */}
        <div className="md:hidden py-2">
          <form onSubmit={handleSearch} className="w-full relative">
            <Input
              type="search"
              placeholder="Search for anything..."
              className="w-full pl-4 pr-10 py-2 border rounded-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button 
              type="submit" 
              className="absolute right-0 top-0 bottom-0 px-3 rounded-r-md"
              variant="ghost"
            >
              <Search size={20} />
            </Button>
          </form>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && <MobileMenu onClose={toggleMenu} />}
    </header>
  );
};

export default Navbar;
