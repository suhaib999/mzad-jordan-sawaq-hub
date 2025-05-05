
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ProductImage {
  id: string;
  image_url: string;
  product_id: string;
  display_order: number;
}

interface ProductImageGalleryProps {
  mainImageUrl: string;
  images: ProductImage[];
  title: string;
}

export const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  mainImageUrl,
  images,
  title
}) => {
  const [selectedImage, setSelectedImage] = useState(mainImageUrl);
  const [imagesLoaded, setImagesLoaded] = useState<Record<string, boolean>>({});

  const allImages = [
    { id: 'main', image_url: mainImageUrl, display_order: -1 },
    ...images
  ].sort((a, b) => a.display_order - b.display_order);

  const handleImageLoad = (imageUrl: string) => {
    setImagesLoaded(prev => ({ ...prev, [imageUrl]: true }));
  };

  return (
    <div>
      <div className="relative mb-4 bg-gray-100 rounded-lg overflow-hidden aspect-square">
        {!imagesLoaded[selectedImage] && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse">
            <span className="text-gray-400 text-sm">Loading image...</span>
          </div>
        )}
        <img
          src={selectedImage}
          alt={title}
          className={cn(
            "w-full h-full object-contain",
            !imagesLoaded[selectedImage] ? "opacity-0" : "opacity-100"
          )}
          onLoad={() => handleImageLoad(selectedImage)}
          loading="lazy"
        />
      </div>

      {allImages.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {allImages.map((image) => (
            <Card
              key={image.id}
              className={`cursor-pointer overflow-hidden ${
                image.image_url === selectedImage ? 'ring-2 ring-mzad-primary' : ''
              }`}
              onClick={() => setSelectedImage(image.image_url)}
            >
              <div className="relative aspect-square bg-gray-100">
                {!imagesLoaded[image.image_url] && (
                  <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
                )}
                <img
                  src={image.image_url}
                  alt={`${title} thumbnail`}
                  className={cn(
                    "w-full h-full object-cover",
                    !imagesLoaded[image.image_url] ? "opacity-0" : "opacity-100"
                  )}
                  onLoad={() => handleImageLoad(image.image_url)}
                  loading="lazy"
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
