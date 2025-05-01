
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchProductById } from '@/services/product';
import { ProductWithImages } from '@/services/product/types';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useLocalStorage } from '@/hooks/useLocalStorage';

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

  // Fix: Use a separate effect for updating recently viewed products
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

  // Fix: Separate effect for product fetching
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

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[50vh]">Loading product details...</div>;
  }

  if (!product) {
    return <div className="flex justify-center items-center min-h-[50vh]">Product not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <img src={product.main_image_url} alt={product.title} className="w-full rounded-lg" />
        </div>
        <div>
          <h1 className="text-2xl font-bold mb-2">{product.title}</h1>
          <div className="text-gray-600 mb-4">Condition: {product.condition}</div>
          <div className="text-xl font-semibold text-mzad-primary mb-4">
            {product.price.toFixed(2)} {product.currency}
          </div>
          <p className="text-gray-700 mb-4">{product.description}</p>
          
          <Button 
            className="w-full bg-mzad-secondary text-white hover:bg-mzad-primary"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
