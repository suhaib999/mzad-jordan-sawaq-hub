
import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger 
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { 
  fetchCategories, 
  DatabaseCategory,
  CategoryWithChildren 
} from '@/services/category/categoryService';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";

interface CategoryFilterProps {
  value: string | undefined;
  onChange: (value: string) => void;
}

const CategoryFilter = ({ value, onChange }: CategoryFilterProps) => {
  const [categories, setCategories] = useState<CategoryWithChildren[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      try {
        const fetchedCategories = await fetchCategories();
        setCategories(fetchedCategories);
        
        // Auto-expand the Vehicles category to show subcategories
        const vehiclesCategory = fetchedCategories.find(cat => cat.slug === 'vehicles');
        if (vehiclesCategory) {
          setExpandedIds(prev => [...prev, vehiclesCategory.id]);
        }
      } catch (error) {
        console.error("Error loading categories:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadCategories();
  }, []);

  // Auto-expand parent categories when a child is selected
  useEffect(() => {
    if (value) {
      const parts = value.split('/');
      let currentPath = '';
      const pathsToExpand = [];
      
      for (let i = 0; i < parts.length - 1; i++) {
        if (i === 0) {
          currentPath = parts[i];
        } else {
          currentPath += '/' + parts[i];
        }
        
        // Find the category with this path
        const findCategory = (cats: CategoryWithChildren[]): CategoryWithChildren | null => {
          for (const cat of cats) {
            if (cat.slug === currentPath) {
              return cat;
            }
            if (cat.children) {
              const found = findCategory(cat.children);
              if (found) return found;
            }
          }
          return null;
        };
        
        const category = findCategory(categories);
        if (category) {
          pathsToExpand.push(category.id);
        }
      }
      
      if (pathsToExpand.length > 0) {
        setExpandedIds(prev => {
          const newExpanded = [...prev];
          pathsToExpand.forEach(id => {
            if (!newExpanded.includes(id)) {
              newExpanded.push(id);
            }
          });
          return newExpanded;
        });
      }
    }
  }, [value, categories]);

  const toggleExpand = (categoryId: string) => {
    setExpandedIds(prevIds => 
      prevIds.includes(categoryId) 
        ? prevIds.filter(id => id !== categoryId)
        : [...prevIds, categoryId]
    );
  };

  const handleSelect = (category: DatabaseCategory) => {
    onChange(category.slug);
  };

  const isSelected = (slug: string) => value === slug;
  
  // Improved rendering of categories to ensure proper hierarchy display
  const renderCategories = (cats: CategoryWithChildren[], depth = 0) => {
    return cats.map(category => {
      const hasChildren = category.children && category.children.length > 0;
      const isExpanded = expandedIds.includes(category.id);
      const isActive = isSelected(category.slug);
      
      return (
        <div key={category.id} className="pl-2">
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center">
              <Checkbox 
                id={category.id}
                checked={isActive}
                onCheckedChange={() => handleSelect(category)}
                className="mr-2"
              />
              <Label 
                htmlFor={category.id}
                className={`text-sm cursor-pointer ${isActive ? 'font-medium text-primary' : ''}`}
              >
                {category.name}
              </Label>
            </div>
            
            {hasChildren && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-0 h-6 w-6"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleExpand(category.id);
                }}
              >
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </Button>
            )}
          </div>
          
          {hasChildren && isExpanded && (
            <div className="ml-4 border-l pl-2 border-gray-200">
              {renderCategories(category.children, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <Label className="text-base font-medium">Categories</Label>
        <div className="animate-pulse space-y-2">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-6 w-full rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label className="text-base font-medium">Categories</Label>
      <div className="max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        <Accordion type="multiple" className="w-full">
          {categories.map(category => (
            <AccordionItem key={category.id} value={category.id} className="border-b-0">
              <div className="flex items-center">
                <Checkbox 
                  id={`top-${category.id}`}
                  checked={isSelected(category.slug)}
                  onCheckedChange={() => handleSelect(category)}
                  className="mr-2"
                />
                <AccordionTrigger className="py-2 hover:no-underline font-normal flex-1">
                  {category.name}
                </AccordionTrigger>
              </div>
              <AccordionContent>
                <div className="pl-6 border-l border-gray-200 space-y-1">
                  {category.children && renderCategories(category.children, 1)}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default CategoryFilter;
