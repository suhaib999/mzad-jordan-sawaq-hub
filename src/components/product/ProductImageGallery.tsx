
import React, { useState } from 'react';
import { ProductImage } from '@/services/product/types';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { ZoomIn } from 'lucide-react';

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
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Handle mouse movement for zoom effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    
    setMousePosition({ x, y });
  };

  return (
    <div>
      <div 
        className="relative aspect-square overflow-hidden rounded-lg border border-gray-200 cursor-zoom-in bg-white"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        <div className="absolute top-2 right-2 bg-white/80 p-1 rounded-full z-10">
          <ZoomIn size={18} className="text-gray-500" />
        </div>
        
        <div className="h-full w-full">
          <AspectRatio ratio={1 / 1}>
            {isZoomed ? (
              <div 
                className="absolute inset-0 w-full h-full"
                style={{
                  backgroundImage: `url(${selectedImage || mainImageUrl})`,
                  backgroundPosition: `${mousePosition.x}% ${mousePosition.y}%`,
                  backgroundSize: '200%',
                  backgroundRepeat: 'no-repeat',
                  zIndex: 5
                }}
              />
            ) : (
              <img 
                src={selectedImage || mainImageUrl} 
                alt={title} 
                className="w-full h-full object-contain transition-transform duration-200"
              />
            )}
          </AspectRatio>
        </div>
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
