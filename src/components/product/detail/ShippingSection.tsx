
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Truck, MapPin } from 'lucide-react';
import { ShippingOption } from '@/services/product/types';

interface ShippingSectionProps {
  location?: string;
  shipping_options?: ShippingOption[];
  free_shipping?: boolean;
  local_pickup?: boolean;
  mzadkumsooq_delivery?: boolean;
  provides_shipping?: boolean;
  handling_time?: string;
}

const ShippingSection: React.FC<ShippingSectionProps> = ({
  location,
  shipping_options = [],
  free_shipping = false,
  local_pickup = false,
  mzadkumsooq_delivery = false,
  provides_shipping = false,
  handling_time
}) => {
  // Parse shipping options from string if needed
  let parsedOptions = shipping_options;
  if (!parsedOptions || parsedOptions.length === 0) {
    if (free_shipping) {
      parsedOptions = [{ method: 'Standard', price: 0 }];
    }
  }

  // Convert handling time to readable format
  const getHandlingTimeText = (time?: string) => {
    if (!time) return 'Not specified';
    
    switch (time) {
      case 'same_day': return 'Same business day';
      case 'one_day': return '1 business day';
      case 'two_days': return '2 business days';
      case 'three_days': return '3 business days';
      case 'four_days': return '4 business days';
      case 'five_days': return '5 business days';
      default: return time;
    }
  };

  return (
    <Card className="border border-gray-200 mb-6">
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-4">Shipping & Pickup</h3>
        
        <div className="space-y-4">
          {location && (
            <div className="flex items-start">
              <MapPin className="w-5 h-5 mr-3 text-gray-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Item location</h4>
                <p className="text-sm text-gray-600">{location}</p>
              </div>
            </div>
          )}

          {provides_shipping && parsedOptions && parsedOptions.length > 0 && (
            <div className="flex items-start">
              <Truck className="w-5 h-5 mr-3 text-gray-500 mt-0.5" />
              <div className="w-full">
                <h4 className="font-medium">Delivery options</h4>
                <div className="mt-2 space-y-2">
                  {parsedOptions.map((option, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{option.method}</span>
                      <span className="font-medium">
                        {option.price > 0 ? `${option.price.toFixed(2)} JOD` : 'Free'}
                      </span>
                    </div>
                  ))}
                  
                  {handling_time && (
                    <p className="text-xs text-gray-600 mt-1">
                      Ships within: {getHandlingTimeText(handling_time)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {mzadkumsooq_delivery && (
            <div className="border-t pt-3">
              <div className="flex justify-between text-sm">
                <span>Mzadkumsooq Delivery</span>
                <span className="font-medium">2.00 JOD</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Secure delivery by our trusted delivery partners
              </p>
            </div>
          )}
          
          {local_pickup && (
            <div className={`${(provides_shipping || mzadkumsooq_delivery) ? 'border-t pt-3' : ''}`}>
              <div className="flex justify-between text-sm">
                <span>Local pickup</span>
                <span className="font-medium">Free</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Pickup directly from the seller
              </p>
            </div>
          )}

          {!provides_shipping && !mzadkumsooq_delivery && !local_pickup && (
            <p className="text-gray-600 text-sm">
              No shipping options available. Contact seller for details.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ShippingSection;
