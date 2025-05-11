
import { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SearchIcon } from 'lucide-react';

type SearchBarProps = {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearch: (e: FormEvent) => void;
  onToggleFilters?: () => void;
};

const SearchBar = ({ 
  searchQuery, 
  onSearchChange, 
  onSearch
}: SearchBarProps) => {
  return (
    <form onSubmit={onSearch} className="w-full flex gap-2">
      <div className="relative flex-grow">
        <Input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pr-10"
        />
        <SearchIcon className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
      </div>
      
      <Button type="submit">Search</Button>
    </form>
  );
};

export default SearchBar;
