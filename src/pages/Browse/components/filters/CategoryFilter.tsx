
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { categories } from '@/data/categories';

type CategoryFilterProps = {
  value: string;
  onChange: (value: string) => void;
  categories: string[];
};

const CategoryFilter = ({ value, onChange }: CategoryFilterProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Get top-level categories
  const topCategories = categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    hasChildren: Boolean(cat.children && cat.children.length > 0)
  }));

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <Label className="font-medium">Category</Label>
        <Button variant="ghost" size="sm" className="p-0 h-auto">
          {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </Button>
      </div>
      
      {isExpanded && (
        <ScrollArea className="h-[240px] pr-3">
          <div className="space-y-1 py-1">
            <div 
              className={`rounded-md px-2 py-1.5 text-sm cursor-pointer hover:bg-gray-100 ${value === "all" ? "bg-mzad-primary/10 font-medium" : ""}`}
              onClick={() => onChange("all")}
            >
              All Categories
            </div>
            
            {topCategories.map((category) => (
              <div 
                key={category.id}
                className={`rounded-md px-2 py-1.5 text-sm cursor-pointer hover:bg-gray-100 ${value === category.slug ? "bg-mzad-primary/10 font-medium" : ""}`}
                onClick={() => onChange(category.slug)}
              >
                {category.name}
                {category.hasChildren && (
                  <span className="text-xs text-gray-500 ml-1">›</span>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
      
      {/* Mobile-friendly dropdown for smaller screens */}
      <div className="block md:hidden mt-2">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {topCategories.map((cat) => (
              <SelectItem key={cat.id} value={cat.slug}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default CategoryFilter;
