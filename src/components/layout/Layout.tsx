
import React from 'react';
import { useState } from 'react';
import Footer from './Footer';
import TopNav from './TopNav';
import SidebarNav from './SidebarNav';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <TopNav />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div className={cn(
          "fixed z-30 h-full md:relative transition-all duration-300 ease-in-out shadow-lg",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          "md:w-64", // Set width for desktop
          "md:transition-[width] md:duration-300",
          !sidebarOpen && "md:w-16" // Collapsed width for desktop
        )}>
          <SidebarNav collapsed={!sidebarOpen} />
        </div>
        
        {/* Sidebar toggle button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="fixed bottom-4 left-4 z-40 md:hidden bg-white dark:bg-gray-800 shadow-md"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        {/* Desktop toggle button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="hidden md:flex fixed top-24 left-4 z-40 bg-white dark:bg-gray-800 shadow-md"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        {/* Main content */}
        <div className="flex flex-col flex-1 w-full overflow-x-hidden">
          <main className="flex-grow p-4">
            {children}
          </main>
          
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Layout;
