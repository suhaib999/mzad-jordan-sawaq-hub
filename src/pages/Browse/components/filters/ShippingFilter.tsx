
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

type ShippingFilterProps = {
  freeShippingOnly: boolean;
  localPickupOnly: boolean;
  onFreeShippingChange: (value: boolean) => void;
  onLocalPickupChange: (value: boolean) => void;
};

const ShippingFilter = ({ 
  freeShippingOnly, 
  localPickupOnly, 
  onFreeShippingChange, 
  onLocalPickupChange 
}: ShippingFilterProps) => {
  return (
    <div className="space-y-2">
      <Label>Shipping Options</Label>
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="free-shipping" 
            checked={freeShippingOnly}
            onCheckedChange={(checked) => onFreeShippingChange(checked === true)}
          />
          <Label htmlFor="free-shipping" className="cursor-pointer text-sm">
            Free Shipping Only
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="local-pickup" 
            checked={localPickupOnly}
            onCheckedChange={(checked) => onLocalPickupChange(checked === true)}
          />
          <Label htmlFor="local-pickup" className="cursor-pointer text-sm">
            Local Pickup Only
          </Label>
        </div>
      </div>
    </div>
  );
};

export default ShippingFilter;
