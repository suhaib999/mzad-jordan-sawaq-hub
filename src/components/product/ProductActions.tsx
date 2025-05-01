
import React from 'react';
import { ProductWithImages } from '@/services/product/types';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { BidForm } from '@/components/product/BidForm';

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
      <Card className="p-4 border-mzad-secondary mb-6">
        <BidForm 
          product={product} 
          onBidPlaced={onBidPlaced} 
        />
      </Card>
    );
  }
  
  return (
    <Button 
      className="w-full bg-mzad-secondary text-white hover:bg-mzad-primary"
      onClick={onAddToCart}
    >
      <ShoppingCart className="mr-2 h-4 w-4" />
      Add to Cart
    </Button>
  );
};
