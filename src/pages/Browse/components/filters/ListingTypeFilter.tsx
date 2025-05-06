
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tag, ShoppingCart, Gavel } from 'lucide-react';

type ListingTypeFilterProps = {
  value: 'all' | 'auction' | 'fixed';
  onChange: (value: 'all' | 'auction' | 'fixed') => void;
};

const ListingTypeFilter = ({ value, onChange }: ListingTypeFilterProps) => {
  return (
    <div className="space-y-2">
      <Label className="font-medium">Listing Type</Label>
      <RadioGroup value={value} onValueChange={(value: 'all' | 'auction' | 'fixed') => onChange(value)}>
        <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 cursor-pointer" 
             onClick={() => onChange('all')}>
          <RadioGroupItem value="all" id="all" className="border-gray-300" />
          <Label htmlFor="all" className="cursor-pointer flex items-center">
            <Tag size={16} className="mr-2 text-gray-600" />
            <span>All Listings</span>
          </Label>
        </div>
        <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 cursor-pointer"
             onClick={() => onChange('auction')}>
          <RadioGroupItem value="auction" id="auction" className="border-gray-300" />
          <Label htmlFor="auction" className="cursor-pointer flex items-center">
            <Gavel size={16} className="mr-2 text-amber-500" />
            <span>Auctions</span>
          </Label>
        </div>
        <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 cursor-pointer"
             onClick={() => onChange('fixed')}>
          <RadioGroupItem value="fixed" id="fixed" className="border-gray-300" />
          <Label htmlFor="fixed" className="cursor-pointer flex items-center">
            <ShoppingCart size={16} className="mr-2 text-blue-500" />
            <span>Buy Now</span>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default ListingTypeFilter;
