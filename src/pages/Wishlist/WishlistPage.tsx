import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Heart, Trash2 } from 'lucide-react';
import { getWishlist, removeFromWishlist } from '@/services/wishlistService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import ProductGrid from '@/components/product/ProductGrid';
import { Button } from '@/components/ui/button';
import { ProductCardProps } from '@/services/product/types';
import { mapProductToCardProps } from '@/services/product';
import { Card } from '@/components/ui/card';

const WishlistPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const {
    data: wishlistProducts = [],
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['wishlist', user?.id],
    queryFn: getWishlist,
    enabled: !!user,
  });

  const handleRemoveItem = async (productId: string) => {
    try {
      const success = await removeFromWishlist(productId);
      if (success) {
        toast({
          title: "Item removed",
          description: "Item removed from your wishlist",
        });
        refetch(); // Refresh the wishlist data
      }
    } catch (error) {
      console.error("Error removing item from wishlist:", error);
      toast({
        title: "Error",
        description: "There was a problem removing the item from your wishlist",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center py-12">
            <Heart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-4">Your Wishlist</h1>
            <p className="text-muted-foreground mb-6">Please sign in to view your wishlist</p>
            <Button className="bg-mzad-primary" asChild>
              <a href="/auth/login">Sign In</a>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const productCards: ProductCardProps[] = wishlistProducts.map(product => mapProductToCardProps(product));

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Your Wishlist</h1>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-mzad-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4">Loading your wishlist...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <p className="text-red-500">Failed to load wishlist</p>
          </div>
        ) : productCards.length === 0 ? (
          <Card className="p-12 text-center">
            <Heart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6">Browse products and click the heart icon to add items to your wishlist</p>
            <Button className="bg-mzad-primary" asChild>
              <a href="/browse">Browse Products</a>
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            <ProductGrid products={productCards} />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default WishlistPage;
