
import { useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import SidebarNav from './SidebarNav';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="md:hidden">
        <Navbar />
      </div>
      
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
          "fixed z-30 h-full md:static md:h-auto transition-transform duration-300 ease-in-out md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <SidebarNav />
        </div>
        
        {/* Main content */}
        <div className="flex flex-col flex-1 w-full overflow-x-hidden">
          <div className="hidden md:block">
            <Navbar />
          </div>
          
          {/* Mobile sidebar toggle button */}
          <button 
            className="fixed bottom-4 right-4 z-10 p-2 rounded-full bg-mzad-primary text-white shadow-lg md:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          <main className="flex-grow">
            {children}
          </main>
          
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
