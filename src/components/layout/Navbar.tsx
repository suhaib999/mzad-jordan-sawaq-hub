import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, Sun, Moon, User, Settings, MessageSquare, Shield, MapPin, TrendingUp } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import LanguageSwitcher from './LanguageSwitcher';
import CartButton from '@/components/cart/CartButton';
import SearchBox from '@/components/search/SearchBox';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { user, session, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold text-mzad-primary dark:text-white">
            MzadKumSooq
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-5">
            <SearchBox />
            <NavLink to="/browse" className={({ isActive }) => isActive ? 'text-blue-500' : 'hover:text-gray-500 dark:text-gray-300'}>
              {t('browse')}
            </NavLink>
            <NavLink to="/sell" className={({ isActive }) => isActive ? 'text-blue-500' : 'hover:text-gray-500 dark:text-gray-300'}>
              {t('sell')}
            </NavLink>
            <NavLink to="/about" className={({ isActive }) => isActive ? 'text-blue-500' : 'hover:text-gray-500 dark:text-gray-300'}>
              {t('about')}
            </NavLink>
          </div>

          {/* Desktop Menu - Auth */}
          <div className="hidden md:flex items-center gap-2">
            <CartButton />
            <LanguageSwitcher />
            <div className="flex items-center space-x-2 ml-2">
              <Sun className="h-[1.2rem] w-[1.2rem] dark:hidden" />
              <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
              <Moon className="h-[1.2rem] w-[1.2rem] hidden dark:inline-block" />
            </div>
            
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.user_metadata?.full_name || user?.email}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Account</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Personal Info</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/profile/security" className="flex items-center">
                        <Shield className="mr-2 h-4 w-4" />
                        <span>Sign-in and Security</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/profile/addresses" className="flex items-center">
                        <MapPin className="mr-2 h-4 w-4" />
                        <span>Addresses</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/profile/feedback" className="flex items-center">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        <span>Feedback</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Selling</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link to="/seller/dashboard" className="flex items-center">
                        <TrendingUp className="mr-2 h-4 w-4" />
                        <span>Seller Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/seller/account" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Seller Account</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/seller/subscriptions" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Subscriptions</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/my-listings" className="flex items-center">
                        <MapPin className="mr-2 h-4 w-4" />
                        <span>My Listings</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-500 cursor-pointer" onClick={signOut}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/auth/login" className="text-mzad-secondary hover:text-mzad-secondary/80 font-medium px-4 py-2 rounded-md transition-colors">
                  {t('login')}
                </Link>
                <Link to="/auth/register" className="bg-mzad-secondary text-white font-medium px-4 py-2 rounded-md hover:bg-mzad-secondary/90 transition-colors">
                  {t('register')}
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="sm:w-2/3 md:w-1/2 lg:w-1/3">
                <SheetHeader className="space-y-2">
                  <SheetTitle>Menu</SheetTitle>
                  <SheetDescription>
                    Explore MzadKumSooq
                  </SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                  <div className="w-full mb-2">
                    <SearchBox />
                  </div>
                  
                  <Button variant="ghost" asChild className="justify-start">
                    <Link to="/browse">{t('browse')}</Link>
                  </Button>
                  <Button variant="ghost" asChild className="justify-start">
                    <Link to="/sell">{t('sell')}</Link>
                  </Button>
                  <Button variant="ghost" asChild className="justify-start">
                    <Link to="/about">{t('about')}</Link>
                  </Button>

                  <div className="flex items-center space-x-2">
                    <CartButton />
                    <LanguageSwitcher />
                  </div>

                  <div className="grid gap-2">
                    <div className="flex items-center space-x-2">
                      <Sun className="h-4 w-4" />
                      <Switch id="airplane-mode" onClick={toggleTheme} checked={theme === "dark"} />
                      <Moon className="h-4 w-4" />
                    </div>
                  </div>

                  {session ? (
                    <>
                      <Button variant="ghost" asChild className="justify-start">
                        <Link to="/profile">Profile</Link>
                      </Button>
                      <Button variant="ghost" asChild className="justify-start">
                        <Link to="/my-listings">My Listings</Link>
                      </Button>
                      <Button variant="destructive" className="w-full" onClick={signOut}>
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="secondary" className="w-full" asChild>
                        <Link to="/auth/login">{t('login')}</Link>
                      </Button>
                      <Button className="w-full" asChild>
                        <Link to="/auth/register">{t('register')}</Link>
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
