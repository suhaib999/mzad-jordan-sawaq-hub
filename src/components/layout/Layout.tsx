
import React, { useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import MobileMenu from './MobileMenu';
import { useAuth } from '@/contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar toggleMobileMenu={toggleMobileMenu} />
      {isMobileMenuOpen && (
        <MobileMenu 
          onClose={() => setIsMobileMenuOpen(false)} 
          isLoggedIn={!!user} 
          onSignOut={signOut}
        />
      )}
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
