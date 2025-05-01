
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { User, Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { fetchProfile } from '@/services/profileService';
import { Badge } from '@/components/ui/badge';

interface SellerInfoProps {
  sellerId: string;
  sellerRating?: number;
  salesCount?: number;
}

export const SellerInfo = ({ 
  sellerId,
  sellerRating = 4.8, 
  salesCount = 245 
}: SellerInfoProps) => {
  const { data: sellerProfile, isLoading } = useQuery({
    queryKey: ['profile', sellerId],
    queryFn: () => fetchProfile(sellerId),
    enabled: !!sellerId,
  });

  if (isLoading) {
    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayName = sellerProfile?.username || sellerProfile?.full_name || `User ${sellerId.substring(0, 5)}`;

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(sellerRating);
    const hasHalfStar = sellerRating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="h-4 w-4 fill-amber-400 text-amber-400" />);
    }

    if (hasHalfStar && stars.length < 5) {
      stars.push(<Star key="half-star" className="h-4 w-4 text-amber-400" />);
    }

    while (stars.length < 5) {
      stars.push(<Star key={`empty-star-${stars.length}`} className="h-4 w-4 text-gray-300" />);
    }

    return stars;
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={sellerProfile?.avatar_url || undefined} alt={displayName} />
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{displayName}</div>
              <div className="flex items-center mt-1">
                {renderStars()}
                <span className="ml-1 text-sm text-gray-600">{sellerRating.toFixed(1)}</span>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {salesCount}+ sales
          </Badge>
        </div>
        {sellerProfile?.location && (
          <div className="mt-3 text-sm text-gray-600">
            Location: {sellerProfile.location}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
