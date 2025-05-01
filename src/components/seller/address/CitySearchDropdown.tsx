
import React, { useState, useEffect } from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { jordanCities } from './neighborhoods';

interface CitySearchDropdownProps {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
}

const CitySearchDropdown: React.FC<CitySearchDropdownProps> = ({ 
  value, 
  onChange,
  error
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCities, setFilteredCities] = useState<string[]>(jordanCities);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredCities(jordanCities);
    } else {
      const filtered = jordanCities.filter(city => 
        city.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCities(filtered);
    }
  }, [searchTerm]);

  return (
    <div className="relative">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={`w-full ${error ? "border-red-500" : ""}`}>
          <SelectValue placeholder="Select city" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          <div className="p-2 sticky top-0 bg-background z-10">
            <Input
              placeholder="Search cities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-1"
            />
          </div>
          <ScrollArea className="h-[220px]">
            <div className="p-1">
              {filteredCities.map((city) => (
                <SelectItem key={city} value={city}>{city}</SelectItem>
              ))}
            </div>
          </ScrollArea>
        </SelectContent>
      </Select>
    </div>
  );
};

export default CitySearchDropdown;
