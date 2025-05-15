
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchProductById } from '@/services/product';
import { ProductWithImages } from '@/services/product/types';
import { useCart } from '@/contexts/CartContext';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Gavel } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import Layout from '@/components/layout/Layout';
import { BidHistory } from '@/components/product/BidHistory';
import { SellerInfo } from '@/components/product/SellerInfo';
import { ProductImageGallery } from '@/components/product/ProductImageGallery';
import { ProductPricing } from '@/components/product/ProductPricing';
import { ProductActions } from '@/components/product/ProductActions';
import { ProductSpecs } from '@/components/product/ProductSpecs';
import { ProductDetailSkeleton } from '@/components/product/ProductDetailSkeleton';
import { ProductError } from '@/components/product/ProductError';
import ShippingSection from '@/components/product/detail/ShippingSection';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductWithImages | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();
  const [recentlyViewedProducts, setRecentlyViewedProducts] = useLocalStorage<string[]>('recentlyViewedProducts', []);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
    }
  };

  // Update recently viewed products
  useEffect(() => {
    if (id) {
      setRecentlyViewedProducts(prev => {
        if (prev[prev.length - 1] === id) {
          return prev;
        }
        const filtered = prev.filter(productId => productId !== id);
        return [...filtered, id];
      });
    }
  }, [id, setRecentlyViewedProducts]);

  // Fetch product data
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
        console.log("Fetched product data:", productData);
        setProduct(productData);
      } else {
        console.error("Product not found");
      }
    } catch (error) {
      console.error("Failed to fetch product:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch - no auto refresh
  useEffect(() => {
    fetchProductData();
  }, [id]);

  // Callback to update UI after a bid is placed
  const handleBidPlaced = (newBidAmount: number) => {
    if (product) {
      console.log(`Updating product with new bid amount: ${newBidAmount}`);
      
      // Update local state immediately for responsive UI
      setProduct(prevProduct => {
        if (!prevProduct) return null;
        return {
          ...prevProduct,
          current_bid: newBidAmount
        };
      });
      
      // Refetch product data with a slight delay
      setTimeout(() => {
        fetchProductData();
      }, 1000);
    }
  };

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return <ProductError />;
  }

  // Format location string from object if needed
  const displayLocation = product.location ? 
    (typeof product.location === 'string' ? 
      product.location : 
      `${product.location.city}, ${product.location.neighborhood}${product.location.street ? `, ${product.location.street}` : ''}`) 
    : '';

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product image gallery */}
          <ProductImageGallery 
            mainImageUrl={product.main_image_url || ''} 
            images={product.images} 
            title={product.title}
          />
          
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
            <ProductPricing 
              isAuction={product.is_auction}
              currentBid={product.current_bid}
              startPrice={product.start_price}
              price={product.price}
              currency={product.currency}
              endTime={product.end_time}
              productId={product.id}
            />
            
            {displayLocation && (
              <div className="text-sm text-gray-500 mb-4">
                Location: {displayLocation}
              </div>
            )}
            
            <p className="text-gray-700 mb-6">{product.description}</p>
            
            {/* Action buttons */}
            <ProductActions 
              product={product} 
              onAddToCart={handleAddToCart} 
              onBidPlaced={handleBidPlaced}
            />
            
            {/* Shipping information */}
            <div className="mt-6">
              <ShippingSection
                location={displayLocation}
                shipping_options={product.shipping_data}
                free_shipping={product.free_shipping}
                local_pickup={product.local_pickup}
                mzadkumsooq_delivery={product.mzadkumsooq_delivery}
                provides_shipping={product.provides_shipping}
                handling_time={product.handling_time}
              />
            </div>
            
            {/* Additional product details */}
            <ProductSpecs 
              condition={product.condition}
              location={displayLocation}
              shipping={product.shipping}
              id={product.id}
            />
          </div>
        </div>
        
        {/* Highest bid section (only for auctions) */}
        {product.is_auction && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Gavel className="mr-2 h-5 w-5" />
              Current Highest Bid
            </h2>
            <BidHistory productId={product.id} currency={product.currency} />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetail;
