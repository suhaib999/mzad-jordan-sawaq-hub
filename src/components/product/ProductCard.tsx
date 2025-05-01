
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { useCart } from '@/contexts/CartContext';
import { fetchProductById } from '@/services/product';
import { cn } from '@/lib/utils';

export interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  currency?: string;
  imageUrl: string;
  condition: string;
  isAuction?: boolean;
  endTime?: string;
  currentBid?: number;
  shipping?: string;
  location?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  title,
  price,
  currency = "JOD",
  imageUrl,
  condition,
  isAuction = false,
  endTime,
  currentBid,
  shipping,
  location
}) => {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);
  
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to product detail
    e.stopPropagation();
    
    try {
      // Fetch full product data for cart
      const product = await fetchProductById(id);
      if (product) {
        addToCart(product);
      }
    } catch (error) {
      console.error('Error adding product to cart:', error);
    }
  };
  
  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to product detail
    e.stopPropagation();
    
    setIsFavorite(!isFavorite);
    
    toast({
      title: isFavorite ? "Removed from favorites" : "Added to favorites",
      description: isFavorite ? `${title} has been removed from your favorites` : `${title} has been added to your favorites`,
      duration: 3000,
    });
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <Link to={`/product/${id}`}>
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-48 object-cover"
          />
        </Link>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={toggleFavorite}
          className={cn(
            "absolute top-2 right-2 bg-white/70 hover:bg-white rounded-full h-8 w-8",
            isFavorite ? "text-red-500" : "text-gray-400"
          )}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
        </Button>
        
        {isAuction && (
          <div className="absolute bottom-2 left-2">
            <span className="auction-badge">Auction</span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <Link to={`/product/${id}`}>
          <h3 className="font-medium text-gray-900 truncate-2 h-12 mb-2">{title}</h3>
        </Link>
        
        {isAuction ? (
          <>
            <div className="mb-1">
              <span className="text-sm text-gray-500">Current Bid:</span>
              <span className="text-lg font-bold text-mzad-primary ml-1">
                {currentBid?.toFixed(2)} {currency}
              </span>
            </div>
            {endTime && (
              <div className="text-sm text-gray-500 mb-2">
                Ends: {endTime}
              </div>
            )}
          </>
        ) : (
          <div className="mb-2">
            <span className="text-lg font-bold text-mzad-dark">
              {price.toFixed(2)} {currency}
            </span>
          </div>
        )}
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{condition}</span>
          {shipping && <span>{shipping}</span>}
        </div>
        
        {location && (
          <div className="mt-2 text-xs text-gray-500">
            {location}
          </div>
        )}
        
        {!isAuction && (
          <div className="mt-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full border-mzad-secondary text-mzad-secondary hover:bg-mzad-secondary hover:text-white"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="mr-1 h-4 w-4" />
              Add to Cart
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
