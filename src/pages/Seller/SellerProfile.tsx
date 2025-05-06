
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Star, Package, MessageCircle, User, ThumbsUp, BookmarkPlus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Layout from '@/components/layout/Layout';
import ProductGrid from '@/components/product/ProductGrid';
import { fetchProfile } from '@/services/profileService';
import { fetchProductsBySellerId } from '@/services/product';
import { mapProductToCardProps } from '@/services/product/mappers';
import { toast } from 'sonner';
import { SellerFeedbackSummary } from '@/components/feedback/SellerFeedbackSummary';
import { calculateFeedbackStats } from '@/services/feedbackService';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const SellerProfile = () => {
  const { sellerId } = useParams<{ sellerId: string }>();
  const [isSavedSeller, setIsSavedSeller] = React.useState(false);
  const { user } = useAuth();
  
  const { data: sellerProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['profile', sellerId],
    queryFn: () => fetchProfile(sellerId || ''),
    enabled: !!sellerId,
  });

  const { data: sellerProducts, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['sellerProducts', sellerId],
    queryFn: () => fetchProductsBySellerId(sellerId || ''),
    enabled: !!sellerId,
  });
  
  const { data: feedbackStats } = useQuery({
    queryKey: ['feedback-stats', sellerId],
    queryFn: () => calculateFeedbackStats(sellerId || ''),
    enabled: !!sellerId,
  });

  // Check if seller is already saved by the user
  useEffect(() => {
    const checkSavedSeller = async () => {
      if (!user || !sellerId) return;
      
      try {
        const { data, error } = await supabase
          .from('saved_sellers')
          .select('*')
          .eq('user_id', user.id)
          .eq('seller_id', sellerId)
          .single();
        
        if (data && !error) {
          setIsSavedSeller(true);
        }
      } catch (error) {
        // Single throws error when no results, which is expected sometimes
        console.log('Seller not saved yet');
      }
    };
    
    checkSavedSeller();
  }, [user, sellerId]);

  const handleSaveSellerClick = async () => {
    if (!user) {
      toast.error("Please sign in to save this seller", {
        description: "You need to be logged in to save sellers",
        action: {
          label: "Sign In",
          onClick: () => window.location.href = "/login"
        }
      });
      return;
    }

    if (!sellerId) return;

    try {
      if (isSavedSeller) {
        // Remove from saved sellers
        const { error } = await supabase
          .from('saved_sellers')
          .delete()
          .eq('user_id', user.id)
          .eq('seller_id', sellerId);

        if (error) throw error;
        
        setIsSavedSeller(false);
        toast.success(`You've removed ${displayName} from your saved sellers`);
      } else {
        // Add to saved sellers
        const { error } = await supabase
          .from('saved_sellers')
          .insert([
            { 
              user_id: user.id, 
              seller_id: sellerId,
              seller_name: sellerProfile?.username || sellerProfile?.full_name || `User ${sellerId.substring(0, 5)}`
            }
          ]);

        if (error) {
          console.error("Error inserting saved seller:", error);
          throw error;
        }
        
        setIsSavedSeller(true);
        toast.success(`${displayName} saved to your sellers list`, {
          description: "You'll see this seller in your saved sellers",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error updating saved seller:", error);
      toast.error("Unable to update saved sellers");
    }
  };

  const handleContactSellerClick = () => {
    if (!user) {
      toast.error("Please sign in to contact this seller", {
        description: "You need to be logged in to send messages",
        action: {
          label: "Sign In",
          onClick: () => window.location.href = "/login"
        }
      });
      return;
    }
    
    window.location.href = "/messages?new=true&recipient=" + sellerId;
  };

  if (!sellerId) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Seller ID Missing</h1>
            <p className="text-gray-600">The seller profile you're trying to view could not be found.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const displayName = sellerProfile?.username || sellerProfile?.full_name || `User ${sellerId.substring(0, 5)}`;
  // Use feedback stats if available, otherwise fallback values
  const positivePercentage = feedbackStats?.positivePercentage || 100;
  const totalFeedback = feedbackStats?.total || 0;
  const salesCount = totalFeedback || 245; // Use feedback count or fallback
  const sellerRating = (positivePercentage / 100) * 5; // Calculate a 5-star rating from the percentage

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(sellerRating);
    const hasHalfStar = sellerRating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="h-5 w-5 fill-amber-400 text-amber-400" />);
    }

    if (hasHalfStar && stars.length < 5) {
      stars.push(<Star key="half-star" className="h-5 w-5 text-amber-400" />);
    }

    while (stars.length < 5) {
      stars.push(<Star key={`empty-star-${stars.length}`} className="h-5 w-5 text-gray-300" />);
    }

    return stars;
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={sellerProfile?.avatar_url || undefined} alt={displayName} />
                  <AvatarFallback>
                    <User className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold">{displayName}</h1>
                  <div className="flex items-center mt-1">
                    {renderStars()}
                    <span className="ml-2 text-lg font-medium">{sellerRating.toFixed(1)}</span>
                    <span className="ml-2 text-gray-500">({salesCount}+ sales)</span>
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    Member since {new Date().getFullYear() - 3}
                  </div>
                </div>
              </div>
              <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
                <Button className="flex items-center" onClick={handleContactSellerClick}>
                  <MessageCircle className="mr-2" />
                  Contact
                </Button>
                <Button 
                  variant={isSavedSeller ? "default" : "outline"}
                  onClick={handleSaveSellerClick}
                  className={isSavedSeller ? "bg-mzad-primary" : ""}
                >
                  <BookmarkPlus className="mr-2 h-4 w-4" />
                  {isSavedSeller ? 'Saved Seller' : 'Save Seller'}
                </Button>
              </div>
            </div>
            <div className="mt-6 flex items-center">
              <Badge className={`${positivePercentage >= 98 ? 'bg-green-50 text-green-700 border-green-300' : 'bg-amber-50 text-amber-700 border-amber-300'} mr-4`}>
                {positivePercentage}% positive feedback
              </Badge>
              {sellerProfile?.location && (
                <div className="text-gray-600">
                  <span className="font-medium">Location:</span> {sellerProfile.location}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="feedback">
          <TabsList className="mb-6">
            <TabsTrigger value="items">
              <Package className="mr-2" />
              Items for sale
            </TabsTrigger>
            <TabsTrigger value="feedback">
              <ThumbsUp className="mr-2" />
              Feedback
            </TabsTrigger>
          </TabsList>
          <TabsContent value="items">
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-4">{displayName}'s Items</h2>
              {isLoadingProducts ? (
                <div className="flex justify-center">
                  <div className="animate-spin h-8 w-8 border-4 border-mzad-primary border-t-transparent rounded-full"></div>
                </div>
              ) : sellerProducts && sellerProducts.length > 0 ? (
                <ProductGrid products={sellerProducts.map(product => mapProductToCardProps(product))} />
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No items found</h3>
                  <p className="mt-2 text-sm text-gray-500">This seller doesn't have any active listings.</p>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="feedback">
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-4">Seller Feedback</h2>
              {sellerId && <SellerFeedbackSummary sellerId={sellerId} />}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default SellerProfile;
