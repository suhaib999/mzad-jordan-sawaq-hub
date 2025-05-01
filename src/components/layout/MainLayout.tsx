
import { useState } from 'react';
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
        
        {/* Main content */}
        <div className="flex flex-col flex-1 w-full overflow-x-hidden">
          {/* Mobile sidebar toggle button */}
          <button 
            className="fixed bottom-4 right-4 z-10 p-2 rounded-full bg-mzad-primary text-white shadow-lg md:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          {/* Desktop sidebar toggle button */}
          <button
            className="hidden md:flex absolute left-4 top-4 z-40 p-2 rounded-md bg-white dark:bg-gray-800 shadow-md hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <Menu size={20} />
          </button>
          
          <main className="flex-grow p-4 pt-16 md:pt-4">
            {children}
          </main>
          
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
