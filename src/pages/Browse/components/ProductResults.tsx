
import ProductGrid from '@/components/product/ProductGrid';
import { ProductCardProps } from '@/services/product/types';

type ProductResultsProps = {
  products: ProductCardProps[];
  isLoading: boolean;
};

const ProductResults = ({ products, isLoading }: ProductResultsProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-mzad-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4">Loading products...</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center p-12 bg-gray-50 rounded-lg">
        <h3 className="text-xl font-medium">No products found</h3>
        <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
      </div>
    );
  }

  return <ProductGrid products={products} />;
};

export default ProductResults;
