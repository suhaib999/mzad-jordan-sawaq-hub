
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface TopNavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

const TopNavLink = ({ href, children, className }: TopNavLinkProps) => (
  <Link 
    to={href} 
    className={cn(
      "text-sm hover:underline px-2", 
      className
    )}
  >
    {children}
  </Link>
);

const TopNav = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 
                    user?.user_metadata?.username || 
                    user?.email?.split('@')[0] || 
                    t('guest');

  return (
    <div className="bg-gray-100 dark:bg-gray-800 py-1 px-4 border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <span className="text-sm mr-1">{t('hi')} {firstName}!</span>
            <ChevronDown size={14} />
          </div>
          
          <div className="hidden md:flex items-center space-x-2">
            <TopNavLink href="/daily-deals">{t('daily_deals')}</TopNavLink>
            <TopNavLink href="/outlet">{t('brand_outlet')}</TopNavLink>
            <TopNavLink href="/gift-cards">{t('gift_cards')}</TopNavLink>
            <TopNavLink href="/help">{t('help_contact')}</TopNavLink>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <TopNavLink href="/sell" className="hidden sm:block">
            {t('sell')}
          </TopNavLink>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="text-sm flex items-center hover:underline">
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
            <DropdownMenuTrigger className="text-sm flex items-center hover:underline">
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
        </div>
      </div>
    </div>
  );
};

export default TopNav;
