
import React, { useState } from 'react';
import { ProductWithImages } from '@/services/product/types';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { BidForm } from '@/components/product/BidForm';
import { WishlistButton } from './WishlistButton';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';

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
  const [showDeliveryOptions, setShowDeliveryOptions] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState<string | null>(null);
  const [deliveryPrice, setDeliveryPrice] = useState(0);
  
  const handleBuyNowClick = () => {
    setShowDeliveryOptions(true);
  };
  
  const handleDeliveryOptionSelect = (value: string) => {
    setSelectedDeliveryOption(value);
    
    // Set delivery price based on selected option
    switch(value) {
      case 'pickup':
        setDeliveryPrice(0);
        break;
      case 'seller_delivery':
        // Use the seller's delivery price or default to 3 JOD
        setDeliveryPrice(product.shipping_fee || 3);
        break;
      case 'mzadkum_standard':
        // 2-3 days delivery price
        setDeliveryPrice(product.mzadkumsooq_delivery ? 3 : 4);
        break;
      case 'mzadkum_sameday':
        // Same day delivery price
        setDeliveryPrice(product.mzadkumsooq_delivery ? 4 : 5);
        break;
      default:
        setDeliveryPrice(0);
    }
    
    setShowDeliveryOptions(false);
    setShowConfirmation(true);
  };
  
  const handleConfirmPurchase = () => {
    // Close the dialog
    setShowConfirmation(false);
    
    // Show success toast
    toast({
      title: "Order placed!",
      description: "The seller has been notified of your purchase.",
      variant: "success",
    });
    
    // Additional logic could go here for creating the order in the database
    console.log("Purchase confirmed with delivery option:", selectedDeliveryOption);
  };
  
  const handleCancelPurchase = () => {
    setShowConfirmation(false);
  };
  
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
        onClick={handleBuyNowClick}
      >
        <ShoppingBag className="mr-2 h-4 w-4" />
        Buy Now
      </Button>
      
      <WishlistButton productId={product.id} variant="detail" />
      
      {/* Delivery Options Dialog */}
      <Dialog open={showDeliveryOptions} onOpenChange={setShowDeliveryOptions}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Choose Delivery Option</DialogTitle>
            <DialogDescription>
              Select how you would like to receive your purchase.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <RadioGroup onValueChange={handleDeliveryOptionSelect} className="space-y-3">
              {product.local_pickup && (
                <div className="flex items-center space-x-2 border p-3 rounded-md hover:bg-gray-50">
                  <RadioGroupItem value="pickup" id="pickup" />
                  <Label htmlFor="pickup" className="flex-1 cursor-pointer">
                    <div className="font-medium">Pickup (Free)</div>
                    <div className="text-sm text-gray-500">Pickup directly from the seller</div>
                  </Label>
                </div>
              )}
              
              {product.provides_shipping && (
                <div className="flex items-center space-x-2 border p-3 rounded-md hover:bg-gray-50">
                  <RadioGroupItem value="seller_delivery" id="seller_delivery" />
                  <Label htmlFor="seller_delivery" className="flex-1 cursor-pointer">
                    <div className="font-medium">Seller Delivery {product.shipping_fee ? `(${product.shipping_fee} JOD)` : ''}</div>
                    <div className="text-sm text-gray-500">Delivery provided by the seller</div>
                  </Label>
                </div>
              )}
              
              {/* Always show Mzadkum delivery options, with different pricing based on seller settings */}
              <div className="flex items-center space-x-2 border p-3 rounded-md hover:bg-gray-50">
                <RadioGroupItem value="mzadkum_standard" id="mzadkum_standard" />
                <Label htmlFor="mzadkum_standard" className="flex-1 cursor-pointer">
                  <div className="font-medium">
                    Mzadkum 2-3 Days Delivery ({product.mzadkumsooq_delivery ? '3' : '4'} JOD)
                  </div>
                  <div className="text-sm text-gray-500">Standard delivery service</div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 border p-3 rounded-md hover:bg-gray-50">
                <RadioGroupItem value="mzadkum_sameday" id="mzadkum_sameday" />
                <Label htmlFor="mzadkum_sameday" className="flex-1 cursor-pointer">
                  <div className="font-medium">
                    Mzadkum Same Day Delivery ({product.mzadkumsooq_delivery ? '4' : '5'} JOD)
                  </div>
                  <div className="text-sm text-gray-500">Express same-day delivery</div>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Purchase Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Purchase</DialogTitle>
            <DialogDescription>
              Please review and confirm your purchase details.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="border-b pb-2">
              <h4 className="text-sm font-medium text-gray-500">Product</h4>
              <p className="text-lg font-medium mt-1">{product.title}</p>
              <p className="text-lg font-bold mt-1">{product.price} {product.currency}</p>
            </div>
            
            <div className="border-b pb-2">
              <h4 className="text-sm font-medium text-gray-500">Delivery Option</h4>
              <p className="font-medium mt-1">
                {selectedDeliveryOption === 'pickup' && 'Pickup (Free)'}
                {selectedDeliveryOption === 'seller_delivery' && `Seller Delivery (${deliveryPrice} JOD)`}
                {selectedDeliveryOption === 'mzadkum_standard' && `Mzadkum 2-3 Days Delivery (${deliveryPrice} JOD)`}
                {selectedDeliveryOption === 'mzadkum_sameday' && `Mzadkum Same Day Delivery (${deliveryPrice} JOD)`}
              </p>
            </div>
            
            <div className="border-b pb-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Subtotal:</span>
                <span>{product.price} {product.currency}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Delivery:</span>
                <span>{deliveryPrice} {product.currency}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold mt-2">
                <span>Total:</span>
                <span>{Number(product.price) + deliveryPrice} {product.currency}</span>
              </div>
            </div>
            
            <div className="flex space-x-3 justify-end mt-4">
              <Button variant="outline" onClick={handleCancelPurchase}>
                Cancel
              </Button>
              <Button onClick={handleConfirmPurchase}>
                Confirm Purchase
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
