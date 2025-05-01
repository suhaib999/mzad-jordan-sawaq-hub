
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Camera } from 'lucide-react';
import { uploadAvatar } from '@/services/profileService';

interface AvatarUploadProps {
  userId: string;
  currentAvatarUrl: string | null;
  onAvatarChange: (url: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

export function AvatarUpload({ 
  userId, 
  currentAvatarUrl, 
  onAvatarChange,
  size = 'md' 
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const avatarSizeClass = {
    sm: 'h-16 w-16',
    md: 'h-24 w-24',
    lg: 'h-32 w-32',
  }[size];
  
  const iconSizeClass = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }[size];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a valid image file (JPEG, PNG, GIF, or WEBP).',
        variant: 'destructive',
      });
      return;
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 5MB.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsUploading(true);
    try {
      const avatarUrl = await uploadAvatar(userId, file);
      if (avatarUrl) {
        onAvatarChange(avatarUrl);
        toast({
          title: 'Avatar updated',
          description: 'Your avatar has been updated successfully.',
        });
      } else {
        throw new Error('Failed to upload avatar');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Upload failed',
        description: 'Could not upload your avatar. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <Avatar className={`${avatarSizeClass} relative group cursor-pointer`} onClick={() => fileInputRef.current?.click()}>
        <AvatarImage src={currentAvatarUrl || ''} alt="User avatar" />
        <AvatarFallback className="bg-mzad-secondary text-white text-lg">
          {!isUploading && (userId.charAt(0) || 'U')}
          {isUploading && '...'}
        </AvatarFallback>
        
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 rounded-full transition-opacity">
          <Camera className={`${iconSizeClass} text-white`} />
        </div>
      </Avatar>
      
      <div className="flex items-center gap-2">
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={() => fileInputRef.current?.click()} 
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : 'Change Avatar'}
        </Button>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />
    </div>
  );
}
