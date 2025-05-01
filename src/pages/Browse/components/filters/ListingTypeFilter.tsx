
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

type ListingTypeFilterProps = {
  value: 'all' | 'auction' | 'fixed';
  onChange: (value: 'all' | 'auction' | 'fixed') => void;
};

const ListingTypeFilter = ({ value, onChange }: ListingTypeFilterProps) => {
  return (
    <div className="space-y-2">
      <Label>Listing Type</Label>
      <RadioGroup value={value} onValueChange={(value: 'all' | 'auction' | 'fixed') => onChange(value)}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="all" id="all" />
          <Label htmlFor="all" className="cursor-pointer">All</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="auction" id="auction" />
          <Label htmlFor="auction" className="cursor-pointer">Auction Only</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="fixed" id="fixed" />
          <Label htmlFor="fixed" className="cursor-pointer">Fixed Price Only</Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default ListingTypeFilter;
