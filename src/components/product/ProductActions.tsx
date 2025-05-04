
import React from 'react';
import { ProductWithImages } from '@/services/product/types';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { BidForm } from '@/components/product/BidForm';
import { WishlistButton } from './WishlistButton';

interface ProductActionsProps {
  product: ProductWithImages;
  onAddToCart: () => void;
  onBidPlaced: (newBidAmount: number) => void;
}

export const ProductActions: React.FC<ProductActionsProps> = ({
  product,
  onAddToCart,
  onBidPlaced
}) => {
  if (product.is_auction) {
    return (
      <div className="space-y-4">
        <div className="flex space-x-2 mb-2">
          <WishlistButton productId={product.id} variant="detail" />
        </div>
        <Card className="p-4 border-mzad-secondary">
          <BidForm 
            product={product} 
            onBidPlaced={onBidPlaced} 
          />
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <Button 
        className="w-full bg-mzad-secondary text-white hover:bg-mzad-primary"
        onClick={onAddToCart}
      >
        <ShoppingCart className="mr-2 h-4 w-4" />
        Add to Cart
      </Button>
      
      <WishlistButton productId={product.id} variant="detail" />
    </div>
  );
};
