
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronDown, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useTheme } from '@/contexts/ThemeContext';
import LanguageSwitcher from './LanguageSwitcher';

interface TopNavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

const TopNavLink = ({ href, children, className }: TopNavLinkProps) => (
  <Link 
    to={href} 
    className={cn(
      "text-sm font-medium hover:underline px-3",
      className
    )}
  >
    {children}
  </Link>
);

const TopNav = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 
                    user?.user_metadata?.username || 
                    user?.email?.split('@')[0] || 
                    t('guest');

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div className="bg-slate-100 dark:bg-gray-800 py-2 border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto flex items-center justify-between">
        {/* Left side links */}
        <div className="flex items-center">
          <Link to="/" className="text-2xl font-bold text-mzad-primary dark:text-white mr-6">
            MzadKumSooq
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger className="text-sm flex items-center hover:text-gray-600 mr-2 font-medium">
              <span className="mr-1">{t('hi')} {firstName}!</span>
              <ChevronDown size={14} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem asChild>
                <Link to="/profile">
                  {t('profile')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/my-listings">
                  {t('my_listings')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/following-listings">
                  {t('following')}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/browse" className="hover:text-gray-500 dark:text-gray-300">
              {t('browse')}
            </Link>
            <Link to="/sell" className="hover:text-gray-500 dark:text-gray-300">
              {t('sell')}
            </Link>
            <Link to="/about" className="hover:text-gray-500 dark:text-gray-300">
              {t('about')}
            </Link>
            <TopNavLink href="/daily-deals">{t('daily_deals')}</TopNavLink>
            <TopNavLink href="/outlet">{t('brand_outlet')}</TopNavLink>
            <TopNavLink href="/help">{t('help_contact')}</TopNavLink>
          </div>
        </div>
        
        {/* Right side links */}
        <div className="flex items-center space-x-4">
          <TopNavLink href="/sell" className="hidden sm:block">
            {t('sell')}
          </TopNavLink>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="text-sm flex items-center hover:text-gray-600 font-medium">
              {t('watchlist')}
              <ChevronDown size={14} className="ml-1" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to="/favorite-listings">
                  {t('favorites')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/recently-viewed">
                  {t('recently_viewed')}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="text-sm flex items-center hover:text-gray-600 font-medium">
              {t('my_account')}
              <ChevronDown size={14} className="ml-1" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to="/profile">
                  {t('profile')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/my-listings">
                  {t('my_listings')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/following-listings">
                  {t('following')}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link to="/cart" className="p-2">
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </Link>
          
          <LanguageSwitcher />
          
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {theme === 'dark' ? (
              <Sun className="h-6 w-6" />
            ) : (
              <Moon className="h-6 w-6" />
            )}
          </button>
          
          <Link to="/profile" className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-lg font-semibold">
            A
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TopNav;
