
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form } from '@/components/ui/form';

const SearchBox = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative flex w-full max-w-[200px] md:max-w-[300px]">
      <Input
        type="text"
        placeholder="Search products..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pr-8"
      />
      <Button 
        type="submit" 
        size="sm" 
        variant="ghost" 
        className="absolute right-0 top-0 h-full px-3"
      >
        <SearchIcon className="h-4 w-4" />
        <span className="sr-only">Search</span>
      </Button>
    </form>
  );
};

export default SearchBox;
