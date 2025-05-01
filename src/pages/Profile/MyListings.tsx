
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { ProductWithImages } from '@/services/productService';
import { Edit, Trash2, Plus, AlertCircle, Package } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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
  
  if (!session) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-12">
              <AlertCircle className="h-12 w-12 text-mzad-secondary mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Login Required</h2>
              <p className="text-gray-600 mb-6 text-center">
                You need to be logged in to view your listings
              </p>
              <Link to="/auth/login">
                <Button>Login to continue</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
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
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-12">
                  <Package className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-xl font-medium mb-2">No listings found</h3>
                  <p className="text-gray-500 mb-6 text-center">
                    {activeTab === "active" && "You don't have any active listings at the moment."}
                    {activeTab === "sold" && "You haven't sold any items yet."}
                    {activeTab === "draft" && "You don't have any draft listings."}
                    {activeTab === "expired" && "You don't have any expired listings."}
                  </p>
                  {activeTab !== "sold" && (
                    <Link to="/add-product">
                      <Button>Create a listing</Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {products.map((product) => {
                  const images = product.images as any[] || [];
                  const sortedImages = [...images].sort((a, b) => a.display_order - b.display_order);
                  const mainImageUrl = sortedImages.length > 0 
                    ? sortedImages[0].image_url 
                    : "https://via.placeholder.com/300x200";
                    
                  return (
                    <Card key={product.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex flex-col sm:flex-row">
                          <div className="w-full sm:w-48 h-48">
                            <img 
                              src={mainImageUrl} 
                              alt={product.title} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="p-4 flex flex-col flex-grow">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium text-lg mb-1">{product.title}</h3>
                                <p className="text-sm text-gray-500 mb-2">{product.category} • {product.condition}</p>
                              </div>
                              <div className="flex items-center">
                                <Badge variant={product.is_auction ? "secondary" : "outline"} className="mr-2">
                                  {product.is_auction ? 'Auction' : 'Fixed Price'}
                                </Badge>
                                <p className="font-semibold text-lg">
                                  {product.currency} {Number(product.is_auction ? product.current_bid || product.start_price : product.price).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            
                            <div className="mt-auto pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                              <div className="mb-2 sm:mb-0">
                                <p className="text-sm text-gray-500">
                                  Listed on {new Date(product.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              
                              <div className="flex space-x-2 w-full sm:w-auto">
                                {activeTab === "active" && (
                                  <>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleStatusChange(product.id, "draft")}
                                      className="flex-1 sm:flex-none"
                                    >
                                      Deactivate
                                    </Button>
                                    <Link to={`/edit-product/${product.id}`} className="flex-1 sm:flex-none">
                                      <Button size="sm" variant="outline" className="w-full">
                                        <Edit size={16} className="mr-1" /> Edit
                                      </Button>
                                    </Link>
                                  </>
                                )}
                                
                                {activeTab === "draft" && (
                                  <>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleStatusChange(product.id, "active")}
                                      className="flex-1 sm:flex-none"
                                    >
                                      Activate
                                    </Button>
                                    <Link to={`/edit-product/${product.id}`} className="flex-1 sm:flex-none">
                                      <Button size="sm" variant="outline" className="w-full">
                                        <Edit size={16} className="mr-1" /> Edit
                                      </Button>
                                    </Link>
                                  </>
                                )}
                                
                                {(activeTab === "expired" || activeTab === "sold") && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleStatusChange(product.id, "draft")}
                                    className="flex-1 sm:flex-none"
                                  >
                                    Relist
                                  </Button>
                                )}
                                
                                <Link to={`/product/${product.id}`} className="flex-1 sm:flex-none">
                                  <Button 
                                    size="sm"
                                    className="w-full"
                                  >
                                    View
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default MyListings;
