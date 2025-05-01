
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

type LocationFilterProps = {
  value?: string;
  onChange: (value?: string) => void;
};

const LocationFilter = ({ value, onChange }: LocationFilterProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="location">Location</Label>
      <Input
        id="location"
        type="text"
        placeholder="Enter city or region"
        value={value || ''}
        onChange={(e) => onChange(e.target.value || undefined)}
      />
    </div>
  );
};

export default LocationFilter;
