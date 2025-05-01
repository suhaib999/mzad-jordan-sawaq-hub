import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { fetchProductsBySellerId, ProductWithImages } from '@/services/productService';
import RequireAuth from '@/components/auth/RequireAuth';
import ListingCard from '@/components/product/ListingCard';
import EmptyListingState from '@/components/product/EmptyListingState';

const MyListings = () => {
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState('active');
  
  const { data: products = [], isLoading, refetch } = useQuery({
    queryKey: ['myProducts', activeTab],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          images:product_images(*)
        `)
        .eq("seller_id", session.user.id)
        .eq("status", activeTab)
        .order("created_at", { ascending: false });
        
      if (error) {
        toast({
          title: "Error fetching listings",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
      
      return data as ProductWithImages[];
    },
    enabled: !!session?.user?.id,
  });
  
  const handleStatusChange = async (productId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("products")
        .update({ status: newStatus })
        .eq("id", productId);
        
      if (error) throw error;
      
      toast({
        title: "Status updated",
        description: `Product has been marked as ${newStatus}`,
      });
      
      refetch();
    } catch (error: any) {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <RequireAuth message="You need to be logged in to view your listings">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h1 className="text-2xl font-bold mb-4 md:mb-0">My Listings</h1>
            <Link to="/add-product">
              <Button className="flex items-center">
                <Plus size={18} className="mr-2" />
                Add New Listing
              </Button>
            </Link>
          </div>

          <Tabs defaultValue="active" onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="sold">Sold</TabsTrigger>
              <TabsTrigger value="draft">Drafts</TabsTrigger>
              <TabsTrigger value="expired">Expired</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-0">
              {isLoading ? (
                <div className="flex justify-center p-12">
                  <div className="animate-spin h-8 w-8 border-4 border-mzad-primary border-t-transparent rounded-full"></div>
                </div>
              ) : products.length === 0 ? (
                <EmptyListingState activeTab={activeTab} />
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {products.map((product) => (
                    <ListingCard 
                      key={product.id}
                      product={product}
                      activeTab={activeTab}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </RequireAuth>
    </Layout>
  );
};

export default MyListings;
