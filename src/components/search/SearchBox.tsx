
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const SearchBox = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();

  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Clear search input
  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <form 
      onSubmit={handleSearch} 
      className={`relative flex w-full max-w-sm md:max-w-md transition-all duration-200 ${isFocused ? 'scale-[1.02]' : ''}`}
    >
      <div className="relative flex-grow">
        <Input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-8 pl-10"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        {searchQuery && (
          <Button 
            type="button" 
            size="sm" 
            variant="ghost" 
            className="absolute right-0 top-0 h-full px-3"
            onClick={clearSearch}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
      </div>
      <Button 
        type="submit" 
        className="ml-2 bg-mzad-primary hover:bg-mzad-primary/90"
      >
        Search
      </Button>
    </form>
  );
};

export default SearchBox;
