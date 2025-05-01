
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  CommandDialog,
  CommandInput,
  CommandList,
} from '@/components/ui/command';

const SearchBox = () => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
      setOpen(false);
      setSearchQuery('');
    }
  };

  // Trigger search dialog with keyboard shortcut
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-9 rounded-full md:w-40 md:justify-start md:rounded-md md:pr-12 md:pl-3"
        onClick={() => setOpen(true)}
      >
        <SearchIcon className="h-4 w-4 md:mr-2" />
        <span className="hidden md:inline-flex">Search</span>
        <kbd className="pointer-events-none absolute right-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-background px-1.5 text-xs font-medium opacity-100 md:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <form onSubmit={handleSearch} className="w-full">
          <CommandInput
            placeholder="Search products..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="w-full"
          />
        </form>
        <CommandList>
          <div className="py-6 text-center text-sm">
            Type to search, press Enter to browse results
          </div>
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default SearchBox;
