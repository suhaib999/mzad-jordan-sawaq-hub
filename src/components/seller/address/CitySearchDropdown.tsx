import React, { useState, useEffect, useRef } from 'react';
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CitySearchDropdownProps {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
}

// List of Jordanian cities for the dropdown
const jordanianCities = [
  "Ajloun",
  "Al Karak",
  "Amman",
  "Aqaba",
  "Irbid",
  "Jerash",
  "Jordan Valley",
  "Ma'an",
  "Madaba",
  "Mafraq",
  "Ramtha",
  "Salt",
  "Tafila",
  "Zarqa"
];

const CitySearchDropdown: React.FC<CitySearchDropdownProps> = ({ value, onChange, error }) => {
  const [citySearch, setCitySearch] = useState('');
  const [filteredCities, setFilteredCities] = useState(jordanianCities);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Filter cities based on search input
  useEffect(() => {
    if (!citySearch) {
      setFilteredCities(jordanianCities);
    } else {
      const filtered = jordanianCities.filter(city => 
        city.toLowerCase().includes(citySearch.toLowerCase())
      );
      setFilteredCities(filtered);
    }
  }, [citySearch]);

  // Handle scroll behavior
  useEffect(() => {
    const scrollableArea = scrollAreaRef.current;
    
    if (!scrollableArea) return;
    
    const handleWheel = (event: WheelEvent) => {
      // Check if we can scroll in the direction the user is trying to scroll
      const isScrollingUp = event.deltaY < 0;
      const isScrollingDown = event.deltaY > 0;
      
      const isAtTop = scrollableArea.scrollTop === 0;
      const isAtBottom = Math.abs(scrollableArea.scrollHeight - scrollableArea.clientHeight - scrollableArea.scrollTop) < 1;
      
      // If at the boundaries, let the event propagate (default behavior)
      if ((isScrollingUp && isAtTop) || (isScrollingDown && isAtBottom)) {
        return;
      }
      
      // Otherwise, handle the scroll ourselves
      event.preventDefault();
      event.stopPropagation();
      
      // Manually scroll the element
      scrollableArea.scrollTop += event.deltaY;
    };
    
    scrollableArea.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      scrollableArea.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Clear the search when the dropdown closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setCitySearch('');
      setFilteredCities(jordanianCities);
    }
  };

  return (
    <Select 
      onValueChange={onChange} 
      defaultValue={value}
      onOpenChange={handleOpenChange}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select a city" />
      </SelectTrigger>
      <SelectContent>
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search city..."
              value={citySearch}
              onChange={(e) => setCitySearch(e.target.value)}
              className="pl-8 w-full"
              style={{ 
                overflow: 'visible',
                textOverflow: 'clip'
              }}
            />
          </div>
        </div>
        <ScrollArea 
          ref={scrollAreaRef} 
          className="max-h-[200px]"
          style={{ touchAction: 'none' }}
        >
          {filteredCities.length > 0 ? (
            filteredCities.map((city) => (
              <SelectItem key={city} value={city}>{city}</SelectItem>
            ))
          ) : (
            <div className="p-2 text-center text-muted-foreground">No cities found</div>
          )}
        </ScrollArea>
      </SelectContent>
    </Select>
  );
};

export default CitySearchDropdown;
