import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "@/contexts/ThemeContext"
import { MoonIcon, SunIcon } from '@radix-ui/react-icons';

// Import our new CartButton
import CartButton from '@/components/cart/CartButton';

const Navbar = () => {
  const { t } = useTranslation();
  const { user, session, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold text-mzad-primary">
            MzadKumSooq
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-5">
            <NavLink to="/browse" className={({ isActive }) => isActive ? 'text-blue-500' : 'hover:text-gray-500'}>
              {t('browse')}
            </NavLink>
            <NavLink to="/sell" className={({ isActive }) => isActive ? 'text-blue-500' : 'hover:text-gray-500'}>
              {t('sell')}
            </NavLink>
            <NavLink to="/about" className={({ isActive }) => isActive ? 'text-blue-500' : 'hover:text-gray-500'}>
              {t('about')}
            </NavLink>
          </div>

          {/* Desktop Menu - Auth */}
          <div className="hidden md:flex items-center gap-2">
            <CartButton />
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
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link to="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/my-listings">My Listings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>Logout</DropdownMenuItem>
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
                  <Button variant="ghost" asChild className="justify-start">
                    <Link to="/browse">{t('browse')}</Link>
                  </Button>
                  <Button variant="ghost" asChild className="justify-start">
                    <Link to="/sell">{t('sell')}</Link>
                  </Button>
                  <Button variant="ghost" asChild className="justify-start">
                    <Link to="/about">{t('about')}</Link>
                  </Button>

                  <div className="flex items-center">
                    <CartButton />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          {t('language')}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" forceMount>
                        <DropdownMenuItem onClick={() => changeLanguage('en')}>
                          English
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => changeLanguage('ar')}>
                          العربية
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="grid gap-2">
                    <div className="flex items-center space-x-2">
                      <SunIcon />
                      <Switch id="airplane-mode" onClick={toggleTheme} checked={theme === "dark"} />
                      <MoonIcon />
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
