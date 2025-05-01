
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { useState, useEffect } from 'react';

type PriceRangeFilterProps = {
  minPrice?: number;
  maxPrice?: number;
  onMinChange: (value?: number) => void;
  onMaxChange: (value?: number) => void;
};

const PriceRangeFilter = ({ 
  minPrice, 
  maxPrice, 
  onMinChange, 
  onMaxChange 
}: PriceRangeFilterProps) => {
  const [localMin, setLocalMin] = useState<string>(minPrice?.toString() || '');
  const [localMax, setLocalMax] = useState<string>(maxPrice?.toString() || '');
  
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalMin(value);
    if (value === '') {
      onMinChange(undefined);
    } else {
      const numValue = Number(value);
      if (!isNaN(numValue)) {
        onMinChange(numValue);
      }
    }
  };
  
  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalMax(value);
    if (value === '') {
      onMaxChange(undefined);
    } else {
      const numValue = Number(value);
      if (!isNaN(numValue)) {
        onMaxChange(numValue);
      }
    }
  };

  return (
    <div className="space-y-4">
      <Label>Price Range</Label>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          placeholder="Min"
          value={localMin}
          onChange={handleMinChange}
          className="w-full"
          min={0}
        />
        <span>to</span>
        <Input
          type="number"
          placeholder="Max"
          value={localMax}
          onChange={handleMaxChange}
          className="w-full"
          min={0}
        />
      </div>
    </div>
  );
};

export default PriceRangeFilter;
