
import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin } from 'lucide-react';

export interface ProductCardPropsFull {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  condition: string;
  isAuction: boolean;
  endTime?: string;
  location?: string;
  currency?: string;
  shipping?: string;
  brand?: string;
  model?: string;
  showBranding?: boolean;
}

// Re-export the type from services for backward compatibility
export type { ProductCardProps } from '@/services/product/types';

const ProductCard: React.FC<ProductCardPropsFull> = ({
  id,
  title,
  price,
  imageUrl,
  condition,
  isAuction,
  endTime,
  location,
  currency = 'JOD',
  shipping,
  brand,
  model,
  showBranding = false
}) => {
  // Format price to 2 decimal places
  const formattedPrice = price.toFixed(2);

  return (
    <Link to={`/product/${id}`} className="group">
      <div className="flex flex-col h-full bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        {/* Image container with fixed aspect ratio */}
        <div className="relative pt-[100%] bg-gray-100">
          <img
            src={imageUrl || 'https://via.placeholder.com/300'}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
              e.currentTarget.src = 'https://via.placeholder.com/300?text=No+Image';
            }}
          />
          {condition && (
            <span className="absolute top-2 left-2 bg-white px-2 py-1 text-xs rounded-full">
              {condition}
            </span>
          )}
          {isAuction && endTime && (
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs p-1 flex items-center justify-center">
              <Clock className="w-3 h-3 mr-1" />
              <span>{endTime}</span>
            </div>
          )}
        </div>

        {/* Product details */}
        <div className="p-3 flex-grow flex flex-col">
          <h3 className="font-medium text-sm line-clamp-2 group-hover:text-mzad-primary mb-1">
            {title}
          </h3>
          
          {showBranding && brand && (
            <div className="text-xs text-gray-600 mb-1">
              {brand} {model && `• ${model}`}
            </div>
          )}
          
          <div className="mt-auto">
            <div className="font-bold text-mzad-primary">
              {isAuction ? 'Current Bid: ' : ''}
              {formattedPrice} {currency}
            </div>
            
            {shipping && (
              <div className="text-xs text-gray-600 mt-1">
                {shipping}
              </div>
            )}
            
            {location && (
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <MapPin className="w-3 h-3 mr-1" />
                <span className="truncate">{typeof location === 'string' ? location : location.city}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
