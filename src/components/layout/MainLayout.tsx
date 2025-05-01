
import { useState } from 'react';
import Footer from './Footer';
import SidebarNav from './SidebarNav';
import TopNav from './TopNav';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

export default MainLayout;
