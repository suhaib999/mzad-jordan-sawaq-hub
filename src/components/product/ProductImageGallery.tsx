
import React, { useState } from 'react';
import { ProductImage } from '@/services/product/types';

interface ProductImageGalleryProps {
  mainImageUrl: string;
  images?: ProductImage[];
  title: string;
}

export const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  mainImageUrl,
  images = [],
  title,
}) => {
  const [selectedImage, setSelectedImage] = useState<string>(mainImageUrl);

  return (
    <div>
      <div className="aspect-square overflow-hidden rounded-lg border border-gray-200">
        <img 
          src={selectedImage || mainImageUrl} 
          alt={title} 
          className="w-full h-full object-contain"
        />
      </div>
      
      {/* Additional product images */}
      <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
        <div 
          onClick={() => setSelectedImage(mainImageUrl)}
          className={`w-20 h-20 rounded cursor-pointer border-2 ${selectedImage === mainImageUrl ? 'border-mzad-primary' : 'border-gray-200'}`}
        >
          <img 
            src={mainImageUrl} 
            alt={`${title} - main`}
            className="w-full h-full object-cover rounded"
          />
        </div>
        {images && images.slice(0, 4).map((image, index) => (
          <div
            key={image.id} 
            onClick={() => setSelectedImage(image.image_url)}
            className={`w-20 h-20 rounded cursor-pointer border-2 ${selectedImage === image.image_url ? 'border-mzad-primary' : 'border-gray-200'}`}
          >
            <img 
              src={image.image_url} 
              alt={`${title} - image ${index + 1}`}
              className="w-full h-full object-cover rounded"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
