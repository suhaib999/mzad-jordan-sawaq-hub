
import React from 'react';
import { ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { buildCategoryPath, findCategoryById, Category } from '@/data/categories';

interface CategoryDisplayProps {
  categoryId: string | null;
  onClick: () => void;
  onClear?: () => void;
  showClear?: boolean;
}

const CategoryDisplay: React.FC<CategoryDisplayProps> = ({ 
  categoryId, 
  onClick, 
  onClear,
  showClear = true 
}) => {
  if (!categoryId) {
    return (
      <Button 
        variant="outline" 
        className="w-full h-auto py-3 justify-start text-muted-foreground" 
        onClick={onClick}
      >
        Select a category
      </Button>
    );
  }

  const breadcrumbs = buildCategoryPath(categoryId);
  
  if (breadcrumbs.length === 0) {
    return (
      <Button 
        variant="outline" 
        className="w-full h-auto py-3 justify-start text-muted-foreground" 
        onClick={onClick}
      >
        Select a category
      </Button>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="border rounded-md p-3 relative">
        <div className="flex items-center flex-wrap gap-y-1">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.id}>
              {index > 0 && <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />}
              <span>{crumb.name}</span>
            </React.Fragment>
          ))}
          
          {showClear && onClear && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-auto -mr-1 h-8 w-8 p-0 text-muted-foreground" 
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <button 
          className="absolute inset-0 w-full h-full cursor-pointer"
          onClick={onClick}
          aria-label="Change category"
        />
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Click to change category
      </p>
    </div>
  );
};

export default CategoryDisplay;
