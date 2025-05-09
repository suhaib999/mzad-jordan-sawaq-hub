
import React from 'react';
import ProductCard from './ProductCard';
import { ProductCardProps } from '@/services/product/types';

interface ProductGridProps {
  products: ProductCardProps[];
  title?: string;
  viewAllLink?: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, title, viewAllLink }) => {
  return (
    <div className="mb-10">
      {title && (
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          {viewAllLink && (
            <a href={viewAllLink} className="text-mzad-primary hover:underline">
              See all
            </a>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;
