
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ProductCardProps } from '@/services/product/types';
import ProductGrid from '@/components/product/ProductGrid';
import { Skeleton } from '@/components/ui/skeleton';
import { mapProductToCardProps } from '@/services/product/mappers';
import { toast } from '@/hooks/use-toast';
import SellerFeedbackSummary from '@/components/feedback/SellerFeedbackSummary';
import { CalendarDays, MapPin, ShoppingBag, Star } from 'lucide-react';

interface SellerProfile {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  location?: string;
  created_at: string;
}

const SellerProfile = () => {
  const { sellerId } = useParams<{ sellerId: string }>();
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [activeTab, setActiveTab] = useState('listings');
  const [isLoading, setIsLoading] = useState(true);
  const [sellerListings, setSellerListings] = useState<ProductCardProps[]>([]);
  
  useEffect(() => {
    const fetchSellerProfile = async () => {
      if (!sellerId) return;
      
      try {
        setIsLoading(true);
        
        // Fetch seller profile
        const { data: sellerData, error: sellerError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sellerId)
          .single();
          
        if (sellerError) {
          throw sellerError;
        }
        
        if (sellerData) {
          setSeller(sellerData);
        }
        
        // Fetch seller's products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select(`
            *,
            product_images(*)
          `)
          .eq('seller_id', sellerId)
          .eq('status', 'active')
          .limit(12);
          
        if (productsError) {
          throw productsError;
        }
        
        // Map products to card props
        if (productsData) {
          const mappedProducts = productsData.map((product) => {
            // Add the images to the product
            const productWithImages = {
              ...product,
              images: product.product_images || []
            };
            return mapProductToCardProps(productWithImages);
          });
          setSellerListings(mappedProducts);
        }
        
      } catch (error: any) {
        console.error('Error fetching seller profile:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load seller profile. Please try again later.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSellerProfile();
  }, [sellerId]);
  
  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-6 px-4">
          <Card>
            <CardHeader className="flex flex-row items-center space-x-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-24" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
          
          <div className="mt-8">
            <Skeleton className="h-10 w-48 mb-6" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Card key={i}>
                  <Skeleton className="h-40 w-full" />
                  <CardContent className="p-4">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3 mb-2" />
                    <Skeleton className="h-4 w-1/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!seller) {
    return (
      <Layout>
        <div className="container mx-auto py-12 px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Seller Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The seller profile you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-6 px-4">
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center border-b pb-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={seller.avatar_url || ''} alt={seller.username || 'Seller'} />
              <AvatarFallback className="text-lg">
                {(seller.username?.charAt(0) || seller.full_name?.charAt(0) || 'S').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="ml-6">
              <CardTitle className="text-2xl">{seller.full_name || seller.username || 'Anonymous Seller'}</CardTitle>
              <div className="flex items-center mt-2">
                <div className="flex items-center text-sm text-muted-foreground mr-4">
                  <CalendarDays className="h-4 w-4 mr-1" />
                  <span>Member since {new Date(seller.created_at).toLocaleDateString()}</span>
                </div>
                {seller.location && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{seller.location}</span>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="py-6">
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center">
                <ShoppingBag className="h-5 w-5 mr-2 text-muted-foreground" />
                <div>
                  <p className="font-medium">{sellerListings.length} active listings</p>
                  <p className="text-xs text-muted-foreground">
                    Products currently for sale
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Star className="h-5 w-5 mr-2 text-muted-foreground" />
                <div>
                  <p className="font-medium">Seller rating</p>
                  <SellerFeedbackSummary sellerId={sellerId as string} />
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="border-t pt-6">
            <Button variant="outline">Contact Seller</Button>
          </CardFooter>
        </Card>
        
        <Tabs defaultValue="listings" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="listings">Listings</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
          </TabsList>
          
          <TabsContent value="listings">
            {sellerListings.length > 0 ? (
              <ProductGrid 
                products={sellerListings} 
                title="Active Listings" 
                viewAllLink={`/browse?seller=${sellerId}`}
              />
            ) : (
              <Card className="bg-muted/40 border-dashed text-center py-12">
                <CardContent>
                  <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No active listings</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto mt-2">
                    This seller doesn't have any active listings at the moment.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="feedback">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Seller Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Mock feedback for now - would be replaced with actual feedback component */}
                  {/* <FeedbackList sellerId={sellerId as string} /> */}
                  <div className="space-y-4">
                    <p className="text-center text-muted-foreground">
                      No feedback available yet.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default SellerProfile;
