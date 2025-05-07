
import React, { useRef } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductFormValues } from '@/types/product';
import { ArrowRight, Trash2, Upload, Image as ImageIcon, Save, Loader, CheckCircle2 } from 'lucide-react';

interface TabsImagesProps {
  form: UseFormReturn<ProductFormValues>;
  watchedImages: any[];
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  moveImage: (index: number, direction: 'up' | 'down') => void;
  removeImage: (index: number) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  isSubmitting: boolean;
  isDraft: boolean;
  setIsDraft: (isDraft: boolean) => void;
  onSubmit: () => void;
  completionScore: number;
  setActiveTab: (tab: string) => void;
}

const TabsImages: React.FC<TabsImagesProps> = ({ 
  form, 
  watchedImages, 
  handleImageUpload, 
  moveImage, 
  removeImage,
  fileInputRef, 
  isSubmitting, 
  isDraft,
  setIsDraft,
  onSubmit,
  completionScore,
  setActiveTab
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <ImageIcon className="w-5 h-5 mr-2" />
          Product Images
        </CardTitle>
        <CardDescription>
          Upload high-quality images of your item (up to 10 images)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6">
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            multiple
            className="hidden"
          />
          
          <Upload className="h-10 w-10 text-muted-foreground mb-2" />
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Drag & drop images here or click to browse
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              JPG, PNG or GIF, max 5MB each
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            className="mt-4"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Images
          </Button>
        </div>

        {/* Image Preview and Management */}
        {watchedImages.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium">Uploaded Images ({watchedImages.length}/10)</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {watchedImages.map((image, index) => (
                <div key={image.id} className="relative group border rounded-lg overflow-hidden aspect-square">
                  <img
                    src={image.url}
                    alt={`Product image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center space-y-2 p-2">
                    <div className="flex space-x-1">
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => moveImage(index, 'up')}
                        disabled={index === 0}
                      >
                        <ArrowRight className="h-4 w-4 -rotate-90" />
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => moveImage(index, 'down')}
                        disabled={index === watchedImages.length - 1}
                      >
                        <ArrowRight className="h-4 w-4 rotate-90" />
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => removeImage(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {index === 0 && (
                      <Badge className="bg-primary">Main Image</Badge>
                    )}
                  </div>
                  {index === 0 && (
                    <Badge className="absolute top-1 left-1 bg-primary">Main</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => setActiveTab('shipping')}
          className="flex items-center"
        >
          Back: Shipping
        </Button>
        <div className="flex space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsDraft(true);
              onSubmit();
            }}
            disabled={isSubmitting}
          >
            {isSubmitting && isDraft ? (
              <Loader className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save as Draft
          </Button>
          <Button
            type="submit"
            onClick={() => {
              setIsDraft(false);
              onSubmit();
            }}
            disabled={isSubmitting || completionScore < 75}
          >
            {isSubmitting && !isDraft ? (
              <Loader className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-2 h-4 w-4" />
            )}
            Create Listing
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TabsImages;
