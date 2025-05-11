
import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { 
  fetchCategories, 
  fetchSubcategories, 
  fetchCategoryBySlug,
  DatabaseCategory,
  CategoryWithChildren 
} from '@/services/category/categoryService';

interface CategoryFilterProps {
  value: string;
  onChange: (value: string) => void;
  categories?: string[];
}

const CategoryFilter = ({ value, onChange }: CategoryFilterProps) => {
  const [dbCategories, setDbCategories] = useState<CategoryWithChildren[]>([]);
  const [currentCategories, setCurrentCategories] = useState<DatabaseCategory[]>([]);
  const [categoryPath, setCategoryPath] = useState<{ id: string; name: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      setIsLoading(true);
      const fetchedCategories = await fetchCategories();
      setDbCategories(fetchedCategories);
      
      // Convert hierarchical structure to flat list for initial view
      const topLevelCategories: DatabaseCategory[] = fetchedCategories.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        parent_id: cat.parent_id,
        level: cat.level,
        created_at: cat.created_at,
        updated_at: cat.updated_at,
        path: cat.path,
        is_leaf: cat.children && cat.children.length === 0
      }));

      setCurrentCategories(topLevelCategories);
      setIsLoading(false);
    };
    
    loadCategories();
  }, []);

  useEffect(() => {
    // Initialize from URL value if present
    const initializeFromValue = async () => {
      if (value && value !== 'all' && dbCategories.length > 0) {
        try {
          // Fetch the selected category by ID
          const category = await fetchCategoryBySlug(value);
          
          if (category) {
            setSelectedCategory(category.id);
            
            // If it has a parent, build the path
            if (category.parent_id) {
              const parentPath: { id: string; name: string }[] = [];
              let currentParentId = category.parent_id;
              
              // Loop through parents to build path
              while (currentParentId) {
                const parent = dbCategories.find(cat => cat.id === currentParentId);
                if (parent) {
                  parentPath.unshift({ id: parent.id, name: parent.name });
                  currentParentId = parent.parent_id;
                } else {
                  break;
                }
              }
              
              setCategoryPath(parentPath);
              
              // Set current categories to siblings
              if (parentPath.length > 0) {
                const lastParent = parentPath[parentPath.length - 1];
                const siblings = await fetchSubcategories(lastParent.id);
                setCurrentCategories(siblings);
              }
            }
          }
        } catch (error) {
          console.error("Error initializing from value:", error);
        }
      }
    };
    
    if (dbCategories.length > 0) {
      initializeFromValue();
    }
  }, [value, dbCategories]);

  useEffect(() => {
    // When value changes from outside (like filters being cleared)
    if (value === 'all' && selectedCategory) {
      setSelectedCategory(null);
      setCategoryPath([]);
      
      // Reset to top-level categories
      const topLevelCategories: DatabaseCategory[] = dbCategories.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        parent_id: cat.parent_id,
        level: cat.level,
        created_at: cat.created_at,
        updated_at: cat.updated_at,
        path: cat.path,
        is_leaf: cat.children && cat.children.length === 0
      }));
      
      setCurrentCategories(topLevelCategories);
    }
  }, [value, dbCategories, selectedCategory]);

  const handleCategorySelect = async (categoryId: string, categoryName: string, categorySlug: string) => {
    setSelectedCategory(categoryId);
    onChange(categorySlug); // Use slug for filtering

    // Find subcategories
    const loadSubcategories = async () => {
      const subcategories = await fetchSubcategories(categoryId);
      if (subcategories && subcategories.length > 0) {
        setCurrentCategories(subcategories);
        setCategoryPath([...categoryPath, { id: categoryId, name: categoryName }]);
      }
    };

    loadSubcategories();
  };

  const handleNavigateBack = async () => {
    if (categoryPath.length === 0) return;

    const newPath = [...categoryPath];
    newPath.pop();
    setCategoryPath(newPath);

    if (newPath.length === 0) {
      // Reset to top-level categories
      const topLevelCategories: DatabaseCategory[] = dbCategories.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        parent_id: cat.parent_id,
        level: cat.level,
        created_at: cat.created_at,
        updated_at: cat.updated_at,
        path: cat.path,
        is_leaf: cat.children && cat.children.length === 0
      }));
      
      setCurrentCategories(topLevelCategories);
      setSelectedCategory(null);
      onChange('all');
    } else {
      const parentId = newPath[newPath.length - 1].id;
      setSelectedCategory(parentId);
      
      // Get the parent category to get its slug
      const parentCategory = await fetchCategoryBySlug(parentId);
      if (parentCategory) {
        onChange(parentCategory.slug);
      }
      
      const loadSubcategories = async () => {
        const subcategories = await fetchSubcategories(parentId);
        if (subcategories) {
          setCurrentCategories(subcategories);
        }
      };
      
      loadSubcategories();
    }
  };

  if (isLoading) {
    return (
      <div className="py-2">
        <Label className="text-base mb-3 block">Categories</Label>
        <div className="h-40 flex items-center justify-center">
          <div className="animate-spin h-6 w-6 border-2 border-mzad-primary rounded-full border-t-transparent"></div>
        </div>
      </div>
    );
  }

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
              <RadioGroupItem value={category.slug} id={category.id} />
              <Label htmlFor={category.id} className="cursor-pointer">{category.name}</Label>
            </div>
            {!category.is_leaf && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="px-2 h-6"
                onClick={(e) => {
                  e.preventDefault();
                  handleCategorySelect(category.id, category.name, category.slug);
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
