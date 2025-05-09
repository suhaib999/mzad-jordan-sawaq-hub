
import React from 'react';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { 
  User, LogOut, Settings, Heart, ShoppingCart, 
  PackageOpen, Gavel, Bookmark, MessageSquare, Clock, Home, History, PlusSquare, Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/contexts/AuthContext';

interface UserDropdownMenuProps {
  className?: string;
  children?: React.ReactNode;
}

const UserDropdownMenu: React.FC<UserDropdownMenuProps> = ({ className, children }) => {
  const { user, signOut } = useAuth();
  
  if (!user) return null;
  
  const unreadNotifications = 3; // Mock value - would be fetched from API
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className={`flex items-center gap-1 ${className}`}>
          <div className="w-8 h-8 rounded-full bg-mzad-primary text-white flex items-center justify-center">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          </div>
          <span className="sr-only md:not-sr-only md:ml-2 text-sm">
            My MzadKumSooq
          </span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-72 border-gray-200 shadow-lg">
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center gap-2">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-mzad-primary">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">
                {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
              </div>
              <div className="text-xs text-gray-500">{user?.email}</div>
            </div>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <Link to="/" className="flex items-center cursor-pointer">
            <Home className="mr-2 h-4 w-4" />
            <span>Summary</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link to="/recently-viewed" className="flex items-center cursor-pointer">
            <Clock className="mr-2 h-4 w-4" />
            <span>Recently Viewed</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link to="/my-bids" className="flex items-center cursor-pointer">
            <Gavel className="mr-2 h-4 w-4" />
            <span>Bids/Offers</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link to="/wishlist" className="flex items-center cursor-pointer">
            <Heart className="mr-2 h-4 w-4" />
            <span>Watchlist</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link to="/purchase-history" className="flex items-center cursor-pointer">
            <History className="mr-2 h-4 w-4" />
            <span>Purchase History</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link to="/cart" className="flex items-center cursor-pointer">
            <ShoppingCart className="mr-2 h-4 w-4" />
            <span>Buy Again</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="text-sm text-gray-500">Selling</DropdownMenuLabel>
        
        <DropdownMenuItem asChild>
          <Link to="/profile/listings" className="flex items-center cursor-pointer">
            <PackageOpen className="mr-2 h-4 w-4" />
            <span>My Listings</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link to="/seller/saved" className="flex items-center cursor-pointer">
            <Bookmark className="mr-2 h-4 w-4" />
            <span>Saved Sellers</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link to="/saved-searches" className="flex items-center cursor-pointer">
            <Bookmark className="mr-2 h-4 w-4" />
            <span>Saved Searches</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {children}
        
        <DropdownMenuItem asChild>
          <Link to="/messages" className="flex items-center cursor-pointer">
            <MessageSquare className="mr-2 h-4 w-4" />
            <span className="flex-1">Messages</span>
            {unreadNotifications > 0 && (
              <Badge className="bg-red-500 text-white h-5 min-w-5 flex items-center justify-center">
                {unreadNotifications}
              </Badge>
            )}
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link to="/profile" className="flex items-center cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => signOut()}
          className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdownMenu;
