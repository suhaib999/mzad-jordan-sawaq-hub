
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import { fetchProductById } from '@/services/productService';
import { getMinimumBidAmount } from '@/services/biddingService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Heart, Share2, Clock, MapPin, Tag, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { BidForm } from '@/components/product/BidForm';
import { BidHistory } from '@/components/product/BidHistory';
import { AuctionCountdown } from '@/components/product/AuctionCountdown';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [auctionEnded, setAuctionEnded] = useState(false);
  
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!id) return null;
      return fetchProductById(id);
    },
    enabled: !!id
  });

  useEffect(() => {
    // Reset image index when product changes
    setCurrentImageIndex(0);
    
    // Check if auction has ended
    if (product?.is_auction && product.end_time) {
      const endTime = new Date(product.end_time);
      setAuctionEnded(endTime <= new Date());
    }
  }, [product?.id, product?.is_auction, product?.end_time]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin h-8 w-8 border-4 border-mzad-primary border-t-transparent rounded-full"></div>
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 p-4 rounded-md">
            <h2 className="text-red-700 font-medium text-lg">Product not found</h2>
            <p className="text-red-600 mt-2">The product you are looking for does not exist or has been removed.</p>
            <Link to="/browse">
              <Button variant="outline" className="mt-4">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Products
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const images = product.images && product.images.length > 0
    ? product.images.map(img => img.image_url)
    : ["https://via.placeholder.com/600x400?text=No+Image+Available"];

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-JO', { 
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  };

  const handleAuctionEnd = () => {
    setAuctionEnded(true);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <Link to="/browse" className="text-mzad-primary hover:underline inline-flex items-center">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Browse
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative bg-gray-100 rounded-lg overflow-hidden">
              <AspectRatio ratio={4/3} className="bg-muted">
                <img
                  src={images[currentImageIndex]}
                  alt={product.title}
                  className="object-cover w-full h-full"
                />
              </AspectRatio>
              
              {images.length > 1 && (
                <>
                  <Button 
                    variant="secondary" 
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full h-8 w-8"
                    onClick={handlePrevImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full h-8 w-8"
                    onClick={handleNextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
            
            {images.length > 1 && (
              <div className="flex overflow-x-auto gap-2 pb-2">
                {images.map((img, index) => (
                  <div 
                    key={index}
                    className={`flex-shrink-0 cursor-pointer w-16 h-16 rounded overflow-hidden border-2 ${
                      currentImageIndex === index ? 'border-mzad-primary' : 'border-transparent'
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img 
                      src={img} 
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-start">
                <h1 className="text-2xl md:text-3xl font-bold">{product.title}</h1>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Heart className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              <div className="mt-2 flex items-center text-sm">
                <Tag className="h-4 w-4 mr-1.5" /> {product.category}
                {product.location && (
                  <>
                    <span className="mx-2">•</span>
                    <MapPin className="h-4 w-4 mr-1.5" /> {product.location}
                  </>
                )}
              </div>
            </div>

            {/* Auction or Buy Now Section */}
            <div className="bg-mzad-accent/10 p-4 rounded-md">
              {product.is_auction ? (
                <div>
                  {/* Auction Status */}
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm">Current Bid:</span>
                      <span className="text-2xl font-bold text-mzad-primary">
                        {product.current_bid ? formatPrice(Number(product.current_bid)) : formatPrice(Number(product.start_price))} {product.currency}
                      </span>
                    </div>
                    
                    {/* Auction Countdown */}
                    {product.end_time && (
                      <div className="mt-1">
                        <AuctionCountdown 
                          endTime={product.end_time} 
                          onEnd={handleAuctionEnd}
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Bid Form or Auction Ended Notice */}
                  <div className="mt-4">
                    {auctionEnded ? (
                      <div className="bg-red-50 border border-red-200 p-3 rounded-md text-center text-red-700">
                        <p className="font-medium">This auction has ended</p>
                      </div>
                    ) : (
                      <BidForm product={product} />
                    )}
                    
                    {Number(product.price) > 0 && (
                      <Button variant="secondary" className="w-full mt-3">
                        Buy Now: {formatPrice(Number(product.price))} {product.currency}
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-baseline">
                    <span className="text-2xl font-bold text-mzad-dark">
                      {formatPrice(Number(product.price))} {product.currency}
                    </span>
                  </div>
                  <div className="mt-4">
                    <Button className="w-full sm:w-auto">Add to Cart</Button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Product Details Card */}
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-500">Condition</p>
                      <p className="font-medium">{product.condition}</p>
                    </div>
                    {product.shipping && (
                      <div>
                        <p className="text-gray-500">Shipping</p>
                        <p className="font-medium">{product.shipping}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-500">Listed</p>
                      <p className="font-medium">{formatDateTime(product.created_at)}</p>
                    </div>
                    {product.is_auction && product.reserve_price && (
                      <div>
                        <p className="text-gray-500">Reserve Price</p>
                        <p className="font-medium">{formatPrice(Number(product.reserve_price))} {product.currency}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Tabs Section */}
            <Tabs defaultValue="description">
              <TabsList className="w-full">
                <TabsTrigger value="description" className="flex-1">Description</TabsTrigger>
                <TabsTrigger value="seller" className="flex-1">Seller</TabsTrigger>
                {product.is_auction && <TabsTrigger value="bids" className="flex-1">Bid History</TabsTrigger>}
                <TabsTrigger value="shipping" className="flex-1">Shipping</TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="mt-4">
                <div className="prose max-w-none">
                  <p>{product.description}</p>
                </div>
              </TabsContent>
              
              <TabsContent value="seller" className="mt-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-mzad-primary/20 rounded-full flex items-center justify-center text-mzad-primary font-bold">
                    S
                  </div>
                  <div className="ml-3">
                    <p className="font-medium">Seller ID: {product.seller_id.substring(0, 8)}...</p>
                    <Button variant="link" className="h-auto p-0 text-mzad-primary">
                      View seller's other items
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              {product.is_auction && (
                <TabsContent value="bids" className="mt-4">
                  <BidHistory productId={product.id} currency={product.currency} />
                </TabsContent>
              )}
              
              <TabsContent value="shipping" className="mt-4">
                <div className="space-y-2">
                  {product.shipping ? (
                    <p>{product.shipping}</p>
                  ) : (
                    <div className="flex items-center text-amber-600">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      <p>Shipping information not provided by seller</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;
