
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchProductById } from '@/services/product';
import { ProductWithImages } from '@/services/product/types';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Gavel } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { AuctionCountdown } from '@/components/product/AuctionCountdown';
import { BidForm } from '@/components/product/BidForm';
import { BidHistory } from '@/components/product/BidHistory';
import { SellerInfo } from '@/components/product/SellerInfo';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductWithImages | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();
  const [recentlyViewedProducts, setRecentlyViewedProducts] = useLocalStorage<string[]>('recentlyViewedProducts', []);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
    }
  };

  // Update recently viewed products - separate from product fetching
  useEffect(() => {
    if (id) {
      setRecentlyViewedProducts(prev => {
        // Avoid unnecessary updates by checking if id is already at the end
        if (prev[prev.length - 1] === id) {
          return prev;
        }
        const filtered = prev.filter(productId => productId !== id);
        return [...filtered, id];
      });
    }
  }, [id, setRecentlyViewedProducts]);

  // Fetch product data
  useEffect(() => {
    const fetchProductData = async () => {
      if (!id) {
        console.error("Product ID is missing.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const productData = await fetchProductById(id);
        if (productData) {
          setProduct(productData);
          setSelectedImage(productData.main_image_url);
        } else {
          console.error("Product not found");
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  // Callback to update UI after a bid is placed
  const handleBidPlaced = (newBidAmount: number) => {
    if (product) {
      setProduct({
        ...product,
        current_bid: newBidAmount
      });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[50vh]">Loading product details...</div>;
  }

  if (!product) {
    return <div className="flex justify-center items-center min-h-[50vh]">Product not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product image */}
        <div>
          <div className="aspect-square overflow-hidden rounded-lg border border-gray-200">
            <img 
              src={selectedImage || product.main_image_url} 
              alt={product.title} 
              className="w-full h-full object-contain"
            />
          </div>
          
          {/* Additional product images */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            <div 
              onClick={() => setSelectedImage(product.main_image_url)}
              className={`w-20 h-20 rounded cursor-pointer border-2 ${selectedImage === product.main_image_url ? 'border-mzad-primary' : 'border-gray-200'}`}
            >
              <img 
                src={product.main_image_url} 
                alt={`${product.title} - main`}
                className="w-full h-full object-cover rounded"
              />
            </div>
            {product.images && product.images.slice(0, 4).map((image, index) => (
              <div
                key={image.id} 
                onClick={() => setSelectedImage(image.image_url)}
                className={`w-20 h-20 rounded cursor-pointer border-2 ${selectedImage === image.image_url ? 'border-mzad-primary' : 'border-gray-200'}`}
              >
                <img 
                  src={image.image_url} 
                  alt={`${product.title} - image ${index + 1}`}
                  className="w-full h-full object-cover rounded"
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* Product details */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl font-bold">{product.title}</h1>
            {product.is_auction && (
              <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                Auction
              </Badge>
            )}
          </div>
          
          <div className="text-gray-600 mb-4">Condition: {product.condition}</div>
          
          {/* Seller information */}
          {product.seller_id && (
            <SellerInfo sellerId={product.seller_id} />
          )}
          
          {/* Pricing information */}
          {product.is_auction ? (
            <div className="space-y-2 mb-6">
              <div className="text-xl font-bold text-mzad-primary">
                Current bid: {(product.current_bid || product.start_price || 0).toFixed(2)} {product.currency}
              </div>
              
              {product.end_time && (
                <div className="mt-2">
                  <AuctionCountdown endTime={product.end_time} />
                </div>
              )}
            </div>
          ) : (
            <div className="text-xl font-semibold text-mzad-primary mb-4">
              {product.price.toFixed(2)} {product.currency}
            </div>
          )}
          
          {product.location && (
            <div className="text-sm text-gray-500 mb-4">
              Location: {product.location}
            </div>
          )}
          
          {product.shipping && (
            <div className="text-sm text-gray-500 mb-4">
              Shipping: {product.shipping}
            </div>
          )}
          
          <p className="text-gray-700 mb-6">{product.description}</p>
          
          {/* Action buttons */}
          {product.is_auction ? (
            <Card className="p-4 border-mzad-secondary mb-6">
              <BidForm 
                product={product} 
                onBidPlaced={handleBidPlaced} 
              />
            </Card>
          ) : (
            <Button 
              className="w-full bg-mzad-secondary text-white hover:bg-mzad-primary"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
          )}
          
          {/* Additional product details */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-2">Item Specifics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-sm">
                <span className="text-gray-500">Condition:</span> {product.condition}
              </div>
              {product.location && (
                <div className="text-sm">
                  <span className="text-gray-500">Location:</span> {product.location}
                </div>
              )}
              {product.shipping && (
                <div className="text-sm">
                  <span className="text-gray-500">Shipping:</span> {product.shipping}
                </div>
              )}
              <div className="text-sm">
                <span className="text-gray-500">Item ID:</span> {product.id.substring(0, 8)}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bid history section (only for auctions) */}
      {product.is_auction && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Gavel className="mr-2 h-5 w-5" />
            Bid History
          </h2>
          <Card className="p-4">
            <BidHistory productId={product.id} currency={product.currency} />
          </Card>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
