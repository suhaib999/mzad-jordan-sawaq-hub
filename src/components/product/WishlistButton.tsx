
import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { addToWishlist, removeFromWishlist, isInWishlist } from '@/services/wishlistService';

interface WishlistButtonProps {
  productId: string;
  variant?: 'default' | 'card' | 'detail';
}

export const WishlistButton = ({ productId, variant = 'default' }: WishlistButtonProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [inWishlist, setInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkWishlist = async () => {
      if (user) {
        const result = await isInWishlist(productId);
        setInWishlist(result);
      }
    };

    checkWishlist();
  }, [productId, user]);

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to product detail
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save items to your wishlist",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (inWishlist) {
        const success = await removeFromWishlist(productId);
        if (success) {
          setInWishlist(false);
          toast({
            title: "Item removed",
            description: "Item removed from your wishlist",
          });
        }
      } else {
        const success = await addToWishlist(productId);
        if (success) {
          setInWishlist(true);
          toast({
            title: "Item saved",
            description: "Item added to your wishlist",
          });
        }
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
      toast({
        title: "Error",
        description: "There was a problem updating your wishlist",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Style variants
  if (variant === 'card') {
    return (
      <Button 
        variant="ghost" 
        size="icon"
        disabled={isLoading}
        className={`absolute top-2 right-2 bg-white/70 hover:bg-white rounded-full h-8 w-8 ${inWishlist ? 'text-red-500 hover:text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
        onClick={handleWishlistClick}
      >
        <Heart size={18} fill={inWishlist ? "currentColor" : "none"} />
      </Button>
    );
  }

  if (variant === 'detail') {
    return (
      <Button 
        variant="outline" 
        disabled={isLoading}
        className={`flex items-center gap-2 ${inWishlist ? 'text-red-500 hover:text-red-600' : 'text-gray-700'}`}
        onClick={handleWishlistClick}
      >
        <Heart size={18} fill={inWishlist ? "currentColor" : "none"} />
        {inWishlist ? 'Saved to Wishlist' : 'Add to Wishlist'}
      </Button>
    );
  }

  return (
    <Button 
      variant={inWishlist ? "default" : "outline"}
      disabled={isLoading}
      className={inWishlist ? 'bg-red-500 hover:bg-red-600' : ''}
      onClick={handleWishlistClick}
    >
      <Heart className="mr-2 h-4 w-4" fill={inWishlist ? "currentColor" : "none"} />
      {inWishlist ? 'Saved' : 'Add to Wishlist'}
    </Button>
  );
};

export default WishlistButton;
