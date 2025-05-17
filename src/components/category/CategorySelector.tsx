import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronRight, Search, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Category, 
  categories, 
  findCategoryById, 
  searchCategories,
  CategoryBreadcrumb,
  buildCategoryPath
} from '@/data/categories';

interface CategorySelectorProps {
  onCategorySelect: (category: Category) => void;
  onCancel: () => void;
  initialCategoryId?: string;
}

const CategorySelector = ({ onCategorySelect, onCancel, initialCategoryId }: CategorySelectorProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [currentCategories, setCurrentCategories] = useState<Category[]>(categories);
  const [breadcrumbs, setBreadcrumbs] = useState<CategoryBreadcrumb[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load initial category if provided
  useEffect(() => {
    if (initialCategoryId) {
      const category = findCategoryById(initialCategoryId);
      if (category) {
        const path = buildCategoryPath(initialCategoryId);
        setBreadcrumbs(path.slice(0, -1)); // All except the last one
        
        // Find the parent category to display its subcategories
        if (path.length > 1) {
          const parentCategory = findCategoryById(path[path.length - 2].id);
          if (parentCategory && parentCategory.subcategories) {
            setCurrentCategories(parentCategory.subcategories);
          }
        }
        
        setSelectedCategory(category);
      }
    }
  }, [initialCategoryId]);

  // Handle search
  useEffect(() => {
    if (searchQuery) {
      const results = searchCategories(searchQuery);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  // Focus search input when component mounts
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category);
    
    if (category.subcategories && category.subcategories.length > 0) {
      setBreadcrumbs([...breadcrumbs, { 
        id: category.id, 
        name: category.name,
        slug: category.slug
      }]);
      setCurrentCategories(category.subcategories);
    } else {
      // If it's a leaf category, select it
      onCategorySelect(category);
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === 0) {
      // Click on root breadcrumb - show main categories
      setBreadcrumbs([]);
      setCurrentCategories(categories);
      return;
    }
    
    // Click on other breadcrumb - navigate to that level
    const newBreadcrumbs = breadcrumbs.slice(0, index);
    setBreadcrumbs(newBreadcrumbs);
    
    // Find the category at this level
    const lastBreadcrumb = newBreadcrumbs[newBreadcrumbs.length - 1];
    const parentCategory = findCategoryById(lastBreadcrumb.id);
    
    if (parentCategory && parentCategory.subcategories) {
      setCurrentCategories(parentCategory.subcategories);
    } else {
      setCurrentCategories(categories);
    }
  };

  const handleBackButton = () => {
    if (breadcrumbs.length === 0) {
      return;
    }
    
    const newBreadcrumbs = breadcrumbs.slice(0, -1);
    setBreadcrumbs(newBreadcrumbs);
    
    if (newBreadcrumbs.length === 0) {
      setCurrentCategories(categories);
    } else {
      const lastBreadcrumb = newBreadcrumbs[newBreadcrumbs.length - 1];
      const parentCategory = findCategoryById(lastBreadcrumb.id);
      
      if (parentCategory && parentCategory.subcategories) {
        setCurrentCategories(parentCategory.subcategories);
      }
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Select a Category</h2>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search categories..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1 h-7 w-7 px-0"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {searchQuery ? (
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Search Results</h3>
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 gap-1">
                {searchResults.map((category) => (
                  <Button
                    key={category.id}
                    variant="ghost"
                    className="justify-start text-left h-auto py-2"
                    onClick={() => handleCategoryClick(category)}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No categories found</p>
            )}
          </div>
        ) : (
          <>
            {/* Breadcrumbs */}
            {breadcrumbs.length > 0 && (
              <div className="flex items-center mb-3 flex-wrap">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mr-1 mb-1" 
                  onClick={handleBackButton}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
                
                <div className="flex items-center flex-wrap">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mr-1 mb-1"
                    onClick={() => handleBreadcrumbClick(0)}
                  >
                    All Categories
                  </Button>
                  
                  {breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={crumb.id}>
                      <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground mb-1" />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mr-1 mb-1"
                        onClick={() => handleBreadcrumbClick(index + 1)}
                      >
                        {crumb.name}
                      </Button>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentCategories.map((category) => (
                <Button
                  key={category.id}
                  variant="outline"
                  className="justify-start text-left h-auto py-3 px-4"
                  onClick={() => handleCategoryClick(category)}
                >
                  <div className="flex justify-between items-center w-full">
                    <span>{category.name}</span>
                    {category.subcategories && category.subcategories.length > 0 && (
                      <ChevronRight className="h-4 w-4 ml-2 text-muted-foreground" />
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </>
        )}
        
        {selectedCategory && !searchQuery && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">Selected Category:</p>
            <div className="flex items-center mt-1">
              <span className="font-medium">{selectedCategory.name}</span>
              {selectedCategory.subcategories && selectedCategory.subcategories.length === 0 && (
                <Button 
                  className="ml-auto"
                  onClick={() => onCategorySelect(selectedCategory)}
                >
                  Confirm Selection
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CategorySelector;
