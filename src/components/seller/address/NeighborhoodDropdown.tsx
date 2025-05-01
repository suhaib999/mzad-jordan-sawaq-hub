
import React, { useEffect, useState } from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ammanNeighborhoods } from './neighborhoods';

interface NeighborhoodDropdownProps {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  city?: string;
}

const NeighborhoodDropdown: React.FC<NeighborhoodDropdownProps> = ({
  value,
  onChange,
  error,
  city
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredNeighborhoods, setFilteredNeighborhoods] = useState<string[]>([]);
  const [isAmman, setIsAmman] = useState(false);

  // Check if selected city is Amman
  useEffect(() => {
    setIsAmman(city === 'Amman');
    setSearchTerm('');
  }, [city]);

  // Filter neighborhoods based on search term
  useEffect(() => {
    if (!isAmman) return;
    
    if (!searchTerm) {
      setFilteredNeighborhoods(ammanNeighborhoods);
    } else {
      const filtered = ammanNeighborhoods.filter(neighborhood =>
        neighborhood.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredNeighborhoods(filtered);
    }
  }, [searchTerm, isAmman]);

  if (!isAmman) {
    // Show regular input if not Amman
    return (
      <Input
        placeholder="Enter neighborhood"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={error ? "border-red-500" : ""}
      />
    );
  }

  // Show dropdown for Amman neighborhoods
  return (
    <div className="relative">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={`w-full ${error ? "border-red-500" : ""}`}>
          <SelectValue placeholder="Select neighborhood" />
        </SelectTrigger>
        <SelectContent>
          <div className="p-2 sticky top-0 bg-background z-10">
            <Input
              placeholder="Search neighborhoods..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-1"
            />
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {filteredNeighborhoods.map((neighborhood) => (
              <SelectItem key={neighborhood} value={neighborhood}>
                {neighborhood}
              </SelectItem>
            ))}
          </div>
        </SelectContent>
      </Select>
    </div>
  );
};

export default NeighborhoodDropdown;
