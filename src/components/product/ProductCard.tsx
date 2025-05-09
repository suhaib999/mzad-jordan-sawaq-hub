
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { fetchProductById } from '@/services/product';
import { fetchHighestBid, formatTimeRemaining } from '@/services/biddingService';
import { Badge } from '@/components/ui/badge';
import { WishlistButton } from './WishlistButton';

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
  location?: string | {
    city: string;
    neighborhood: string;
    street?: string;
  };
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
  const [highestBid, setHighestBid] = useState<number | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Fetch highest bid if this is an auction
  useEffect(() => {
    if (isAuction) {
      const getHighestBid = async () => {
        const bidAmount = await fetchHighestBid(id);
        if (bidAmount !== null) {
          setHighestBid(bidAmount);
        }
      };
      
      getHighestBid();
    }
  }, [id, isAuction]);
  
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

  const formattedTimeRemaining = endTime ? formatTimeRemaining(endTime) : '';
  const isEnded = formattedTimeRemaining === 'Auction ended';
  
  // For auctions, display the highest bid, current bid or starting price
  const displayPrice = isAuction ? (highestBid || currentBid || price) : price;

  // Format location string from object if needed
  const displayLocation = location ? 
    (typeof location === 'string' ? 
      location : 
      `${location.city}, ${location.neighborhood}${location.street ? `, ${location.street}` : ''}`) 
    : '';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <Link to={`/product/${id}`}>
          <div className="w-full h-48 bg-gray-100">
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse">
                <span className="text-gray-400 text-sm">Loading...</span>
              </div>
            )}
            <img 
              src={imageUrl} 
              alt={title} 
              className={`w-full h-48 object-cover ${!imageLoaded ? 'opacity-0' : 'opacity-100'}`}
              onLoad={() => setImageLoaded(true)}
              loading="lazy"
            />
          </div>
        </Link>
        <WishlistButton productId={id} variant="card" />
        
        {isAuction && (
          <div className="absolute bottom-2 left-2">
            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
              {isEnded ? 'Ended' : 'Auction'}
            </Badge>
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
                {displayPrice.toFixed(2)} {currency}
              </span>
            </div>
            {endTime && (
              <div className="text-sm flex items-center text-amber-600 mb-2">
                <Clock className="h-3 w-3 mr-1" />
                <span className={isEnded ? 'text-red-500' : ''}>
                  {formattedTimeRemaining}
                </span>
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
        
        {displayLocation && (
          <div className="mt-2 text-xs text-gray-500">
            {displayLocation}
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
