
import React, { useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface ImageUploadHandlerProps {
  appendImage: (image: any) => void;
  watchedImages: Array<{ id: string; file?: File | null; url: string; order: number }>;
  children: React.ReactNode;
}

export const ImageUploadHandler = ({ appendImage, watchedImages, children }: ImageUploadHandlerProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const newFiles = Array.from(e.target.files);
    const currentImagesCount = watchedImages?.length || 0;
    
    newFiles.forEach((file, index) => {
      if (currentImagesCount + index < 10) { // Limit to 10 images
        const imageUrl = URL.createObjectURL(file);
        appendImage({ 
          id: uuidv4(), 
          file: file, 
          url: imageUrl,
          order: currentImagesCount + index
        });
      }
    });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        multiple
        className="hidden"
        id="image-upload-input"
      />
      {React.cloneElement(children as React.ReactElement, { 
        onClick: () => fileInputRef.current?.click() 
      })}
    </>
  );
};

export default ImageUploadHandler;
