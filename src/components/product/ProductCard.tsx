
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
          className="absolute top-2 right-2 bg-white/70 hover:bg-white rounded-full h-8 w-8"
        >
          <Heart size={18} />
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
      </div>
    </div>
  );
};

export default ProductCard;
