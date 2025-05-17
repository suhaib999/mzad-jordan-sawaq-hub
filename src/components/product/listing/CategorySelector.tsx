import React, { useState, useEffect, useCallback } from 'react';
import { Check, ChevronRight, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { categories } from '@/data/categories';
import { toast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
  slug: string;
  children?: Category[];
}

interface CategorySelectorProps {
  onCategorySelect: (category: Category, subcategory?: Category) => void;
  selectedCategory?: string;
  selectedSubcategory?: string;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  onCategorySelect,
  selectedCategory,
  selectedSubcategory
}) => {
  const [level, setLevel] = useState<'main' | 'sub' | 'leaf'>('main');
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [currentSubcategory, setCurrentSubcategory] = useState<Category | null>(null);
  const [mainCategories] = useState<Category[]>(categories);
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [leafCategories, setLeafCategories] = useState<Category[]>([]);
  const [initialized, setInitialized] = useState<boolean>(false);

  // Helper function to find a category by slug
  const findCategoryBySlug = useCallback((slug: string, categoriesList: Category[]): Category | null => {
    for (const cat of categoriesList) {
      if (cat.slug === slug) {
        return cat;
      }
      if (cat.children) {
        const found = findCategoryBySlug(slug, cat.children);
        if (found) return found;
      }
    }
    return null;
  }, []);

  // Set initial state if category is already selected - only run once on mount or when selectedCategory changes
  useEffect(() => {
    if (!initialized && selectedCategory) {
      try {
        // Find the selected category
        const found = findCategoryBySlug(selectedCategory, categories);
        if (found) {
          setCurrentCategory(found);
          setSubCategories(found.children || []);
          setLevel('sub');
          
          // If subcategory is also provided, set it
          if (selectedSubcategory && found.children) {
            const foundSub = findCategoryBySlug(selectedSubcategory, found.children);
            if (foundSub) {
              setCurrentSubcategory(foundSub);
              setLeafCategories(foundSub.children || []);
              setLevel('leaf');
            }
          }
        }
      } catch (error) {
        console.error("Error initializing category selector:", error);
      }
      
      // Mark as initialized to prevent re-running
      setInitialized(true);
    }
  }, [selectedCategory, selectedSubcategory, findCategoryBySlug, initialized]);

  const handleCategorySelect = (category: Category) => {
    try {
      // Set state first to preserve UI state
      setCurrentCategory(category);
      setSubCategories(category.children || []);
      setLevel('sub');

      // If no children, this is a leaf category
      if (!category.children || category.children.length === 0) {
        // We pass only the main category without a subcategory
        onCategorySelect(category);
      }
      // Otherwise we don't call onCategorySelect yet - we'll wait for subcategory selection
    } catch (error) {
      console.error("Error in handleCategorySelect:", error);
      toast({
        title: "Error",
        description: "There was a problem selecting the category.",
        variant: "destructive"
      });
    }
  };

  const handleSubcategorySelect = (subcategory: Category) => {
    try {
      // Set state first
      setCurrentSubcategory(subcategory);
      setLeafCategories(subcategory.children || []);
      setLevel('leaf');

      // If no children, this is the final selection
      if (!subcategory.children || subcategory.children.length === 0) {
        // Pass both the main category and subcategory
        if (currentCategory) {
          onCategorySelect(currentCategory, subcategory);
        }
      }
      // Otherwise we don't call onCategorySelect yet - we'll wait for leaf category selection
    } catch (error) {
      console.error("Error in handleSubcategorySelect:", error);
      toast({
        title: "Error",
        description: "There was a problem selecting the subcategory.",
        variant: "destructive"
      });
    }
  };

  const handleLeafCategorySelect = (leafCategory: Category) => {
    try {
      // We now have all three levels selected, call onCategorySelect with the final leaf category
      if (currentSubcategory) {
        onCategorySelect(currentCategory as Category, leafCategory);
      }
    } catch (error) {
      console.error("Error in handleLeafCategorySelect:", error);
      toast({
        title: "Error",
        description: "There was a problem selecting the category.",
        variant: "destructive"
      });
    }
  };

  const handleBackClick = () => {
    if (level === 'leaf') {
      setLevel('sub');
    } else if (level === 'sub') {
      setLevel('main');
      setCurrentCategory(null);
    }
  };

  return (
    <Card className="border rounded-md">
      <CardHeader className="bg-muted/50 p-4 border-b">
        <CardTitle className="text-lg flex items-center">
          <Tag className="w-5 h-5 mr-2" />
          Select Category
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-4">
          {/* Breadcrumb navigation */}
          <div className="flex flex-wrap items-center text-sm mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setLevel('main')}
              className={level === 'main' ? "underline font-medium" : "text-muted-foreground"}
            >
              All Categories
            </Button>
            
            {currentCategory && (
              <>
                <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setLevel('sub')}
                  className={level === 'sub' ? "underline font-medium" : "text-muted-foreground"}
                >
                  {currentCategory.name}
                </Button>
              </>
            )}
            
            {currentSubcategory && (
              <>
                <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setLevel('leaf')}
                  className={level === 'leaf' ? "underline font-medium" : "text-muted-foreground"}
                >
                  {currentSubcategory.name}
                </Button>
              </>
            )}
          </div>

          {/* Back button */}
          {level !== 'main' && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleBackClick}
              className="mb-4"
            >
              Back
            </Button>
          )}

          {/* Category grid */}
          <ScrollArea className="h-[320px] pr-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {level === 'main' && mainCategories.map((category) => (
                <CategoryCard 
                  key={category.id} 
                  category={category} 
                  onClick={() => handleCategorySelect(category)}
                  isSelected={currentCategory?.id === category.id}
                />
              ))}
              
              {level === 'sub' && subCategories.map((subcategory) => (
                <CategoryCard 
                  key={subcategory.id} 
                  category={subcategory} 
                  onClick={() => handleSubcategorySelect(subcategory)}
                  isSelected={currentSubcategory?.id === subcategory.id}
                />
              ))}
              
              {level === 'leaf' && leafCategories.map((leafCategory) => (
                <CategoryCard 
                  key={leafCategory.id} 
                  category={leafCategory} 
                  onClick={() => handleLeafCategorySelect(leafCategory)}
                  isSelected={false}
                />
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

interface CategoryCardProps {
  category: Category;
  onClick: () => void;
  isSelected: boolean;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onClick,
  isSelected
}) => {
  return (
    <Button
      variant="outline"
      className={`h-auto text-left justify-between p-3 ${isSelected ? 'border-primary' : ''}`}
      onClick={onClick}
    >
      <div className="flex flex-col items-start">
        <span className="font-medium">{category.name}</span>
      </div>
      {isSelected ? (
        <Check className="h-4 w-4" />
      ) : (
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      )}
    </Button>
  );
};

export default CategorySelector;
