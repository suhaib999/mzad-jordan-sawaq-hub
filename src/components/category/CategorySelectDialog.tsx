
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import CategorySelector from './CategorySelector';
import { Category } from '@/data/categories';

interface CategorySelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategorySelect: (category: Category) => void;
  initialCategoryId?: string;
}

const CategorySelectDialog: React.FC<CategorySelectDialogProps> = ({ 
  open, 
  onOpenChange, 
  onCategorySelect,
  initialCategoryId
}) => {
  const handleCategorySelect = (category: Category) => {
    onCategorySelect(category);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl p-0">
        <CategorySelector 
          onCategorySelect={handleCategorySelect} 
          onCancel={() => onOpenChange(false)}
          initialCategoryId={initialCategoryId} 
        />
      </DialogContent>
    </Dialog>
  );
};

export default CategorySelectDialog;
