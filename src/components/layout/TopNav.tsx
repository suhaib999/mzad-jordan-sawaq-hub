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
const TopNavLink = ({
  href,
  children,
  className
}: TopNavLinkProps) => <Link to={href} className={cn("text-sm font-medium hover:underline px-3", className)}>
    {children}
  </Link>;
const TopNav = () => {
  const {
    t
  } = useTranslation();
  const {
    user
  } = useAuth();
  const {
    theme,
    setTheme
  } = useTheme();
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || user?.user_metadata?.username || user?.email?.split('@')[0] || t('guest');
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };
  return <div className="bg-slate-100 dark:bg-gray-800 py-2 border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto flex items-center justify-between">
        {/* Left side links */}
        
        
        {/* Right side links */}
        
      </div>
    </div>;
};
export default TopNav;