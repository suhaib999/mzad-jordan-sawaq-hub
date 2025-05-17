
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Trash2, Upload, Image as ImageIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ImageUploaderProps {
  images: {
    id?: string;
    file?: File;
    url?: string;
    order?: number;
  }[];
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (index: number) => void;
  onMove: (index: number, direction: 'up' | 'down') => void;
  maxImages: number;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onUpload,
  onRemove,
  onMove,
  maxImages = 10
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6">
        <input 
          type="file"
          ref={fileInputRef}
          onChange={onUpload}
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
      {images && images.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium">Uploaded Images ({images.length}/{maxImages})</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {images.map((image, index) => (
              <div key={image.id || index} className="relative group border rounded-lg overflow-hidden aspect-square">
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
                      onClick={() => onMove(index, 'up')}
                      disabled={index === 0}
                    >
                      <ArrowRight className="h-4 w-4 -rotate-90" />
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onMove(index, 'down')}
                      disabled={index === images.length - 1}
                    >
                      <ArrowRight className="h-4 w-4 rotate-90" />
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onRemove(index)}
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
    </div>
  );
};

export default ImageUploader;
