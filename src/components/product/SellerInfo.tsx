
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { User, Star, ExternalLink } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { fetchProfile } from '@/services/profileService';

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
        <div className="flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={sellerProfile?.avatar_url || undefined} alt={displayName} />
                <AvatarFallback>
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <Link to={`/seller/profile/${sellerId}`} className="font-medium hover:underline flex items-center">
                  {displayName}
                  <ExternalLink className="ml-1 h-3 w-3" />
                </Link>
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

          <div className="mt-3 flex flex-wrap gap-2">
            <Link to={`/seller/profile/${sellerId}`} className="text-sm text-blue-600 hover:underline flex items-center">
              <span className="font-medium">100% positive</span>
            </Link>
            <span className="text-gray-400">•</span>
            <Link to={`/seller/profile/${sellerId}/items`} className="text-sm text-blue-600 hover:underline">
              Seller's other items
            </Link>
            <span className="text-gray-400">•</span>
            <Link to={`/messages/new?recipient=${sellerId}`} className="text-sm text-blue-600 hover:underline">
              Contact seller
            </Link>
          </div>

          {sellerProfile?.location && (
            <div className="mt-2 text-sm text-gray-600">
              Location: {sellerProfile.location}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
