
import React from 'react';
import Layout from '@/components/layout/Layout';

export const ProductError: React.FC = () => {
  return (
    <Layout>
      <div className="flex justify-center items-center min-h-[50vh] px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Product not found
          </h2>
          <p className="text-gray-600">
            The product you're looking for might have been removed or is no longer available.
          </p>
        </div>
      </div>
    </Layout>
  );
};
