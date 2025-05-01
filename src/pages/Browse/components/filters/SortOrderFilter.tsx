
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type SortOrderFilterProps = {
  value: string;
  onChange: (value: string) => void;
};

const sortOptions = [
  { value: 'bestMatch', label: 'Best Match' },
  { value: 'priceAsc', label: 'Price: Low to High' },
  { value: 'priceDesc', label: 'Price: High to Low' },
  { value: 'newlyListed', label: 'Newly Listed' },
  { value: 'endingSoonest', label: 'Ending Soonest' }
];

const SortOrderFilter = ({ value, onChange }: SortOrderFilterProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="sort-order">Sort By</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Sort By" />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SortOrderFilter;
