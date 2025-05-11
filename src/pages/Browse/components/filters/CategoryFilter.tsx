
import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { fetchCategories, CategoryWithChildren, fetchSubcategories } from '@/services/category/categoryService';

interface CategoryFilterProps {
  value: string;
  onChange: (value: string) => void;
  categories?: string[];
}

const CategoryFilter = ({ value, onChange }: CategoryFilterProps) => {
  const [dbCategories, setDbCategories] = useState<CategoryWithChildren[]>([]);
  const [currentCategories, setCurrentCategories] = useState<CategoryWithChildren[]>([]);
  const [categoryPath, setCategoryPath] = useState<{ id: string; name: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      const fetchedCategories = await fetchCategories();
      setDbCategories(fetchedCategories);
      setCurrentCategories(fetchedCategories);
    };
    
    loadCategories();
  }, []);

  useEffect(() => {
    // When value changes from outside (like filters being cleared)
    if (value === 'all' && selectedCategory) {
      setSelectedCategory(null);
      setCategoryPath([]);
      setCurrentCategories(dbCategories);
    }
  }, [value, dbCategories, selectedCategory]);

  const handleCategorySelect = (categoryId: string, categoryName: string) => {
    setSelectedCategory(categoryId);
    onChange(categoryId);

    // Find subcategories
    const loadSubcategories = async () => {
      const subcategories = await fetchSubcategories(categoryId);
      if (subcategories && subcategories.length > 0) {
        setCurrentCategories(subcategories.map(cat => ({ ...cat, children: [] })));
        setCategoryPath([...categoryPath, { id: categoryId, name: categoryName }]);
      }
    };

    loadSubcategories();
  };

  const handleNavigateBack = () => {
    if (categoryPath.length === 0) return;

    const newPath = [...categoryPath];
    newPath.pop();
    setCategoryPath(newPath);

    if (newPath.length === 0) {
      setCurrentCategories(dbCategories);
      setSelectedCategory(null);
      onChange('all');
    } else {
      const parentId = newPath[newPath.length - 1].id;
      setSelectedCategory(parentId);
      onChange(parentId);
      
      const loadSubcategories = async () => {
        const subcategories = await fetchSubcategories(parentId);
        if (subcategories) {
          setCurrentCategories(subcategories.map(cat => ({ ...cat, children: [] })));
        }
      };
      
      loadSubcategories();
    }
  };

  return (
    <div className="py-2">
      <Label className="text-base mb-3 block">Categories</Label>

      {/* Breadcrumb navigation */}
      {categoryPath.length > 0 && (
        <div className="mb-3 flex items-center text-sm">
          <Button 
            variant="ghost" 
            size="sm" 
            className="px-2 h-8" 
            onClick={handleNavigateBack}
          >
            <ChevronLeft size={16} />
            <span>Back</span>
          </Button>
          <span className="mx-1 text-muted-foreground">/</span>
          {categoryPath.map((item, index) => (
            <span key={item.id} className="mx-1 text-muted-foreground">
              {item.name} {index < categoryPath.length - 1 && <span>/</span>}
            </span>
          ))}
        </div>
      )}

      <RadioGroup 
        value={value} 
        onValueChange={onChange}
        className="space-y-1"
      >
        {categoryPath.length === 0 && (
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="all" />
            <Label htmlFor="all" className="cursor-pointer">All Categories</Label>
          </div>
        )}

        {currentCategories.map((category) => (
          <div key={category.id} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={category.id} id={category.id} />
              <Label htmlFor={category.id} className="cursor-pointer">{category.name}</Label>
            </div>
            {!category.is_leaf && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="px-2 h-6"
                onClick={(e) => {
                  e.preventDefault();
                  handleCategorySelect(category.id, category.name);
                }}
              >
                <ChevronRight size={16} />
              </Button>
            )}
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default CategoryFilter;
