
import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { fetchCategories, CategoryWithChildren } from '@/services/category/categoryService';

interface CategoryFilterProps {
  value: string;
  onChange: (value: string) => void;
  categories?: string[];
}

const CategoryFilter = ({ value, onChange }: CategoryFilterProps) => {
  const [dbCategories, setDbCategories] = useState<CategoryWithChildren[]>([]);

  useEffect(() => {
    const loadCategories = async () => {
      const fetchedCategories = await fetchCategories();
      setDbCategories(fetchedCategories);
    };
    
    loadCategories();
  }, []);

  return (
    <div className="py-2">
      <Label className="text-base mb-3 block">Categories</Label>
      <RadioGroup 
        value={value} 
        onValueChange={onChange}
        className="space-y-1"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="all" id="all" />
          <Label htmlFor="all" className="cursor-pointer">All Categories</Label>
        </div>

        {dbCategories.map((category) => (
          <div key={category.id} className="flex items-center space-x-2">
            <RadioGroupItem value={category.id} id={category.id} />
            <Label htmlFor={category.id} className="cursor-pointer">{category.name}</Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default CategoryFilter;
