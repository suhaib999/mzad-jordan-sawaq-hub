
import React from 'react';
import { Button } from '@/components/ui/button';

interface DraftManagerProps {
  hasDraft: boolean;
  draftSaved: boolean;
  onLoadDraft: () => void;
  onDiscardDraft: () => void;
}

export const DraftManager = ({ 
  hasDraft, 
  draftSaved, 
  onLoadDraft, 
  onDiscardDraft 
}: DraftManagerProps) => {
  return (
    <div className="mt-4 sm:mt-0 flex space-x-2">
      {hasDraft && (
        <>
          <Button 
            variant="outline" 
            onClick={onLoadDraft}
          >
            Load Draft
          </Button>
          <Button 
            variant="outline" 
            onClick={onDiscardDraft}
          >
            Discard Draft
          </Button>
        </>
      )}
      
      {draftSaved && (
        <span className="text-sm text-muted-foreground animate-fade-in-out flex items-center">
          Draft saved
        </span>
      )}
    </div>
  );
};

export default DraftManager;
