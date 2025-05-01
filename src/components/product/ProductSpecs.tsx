
import React from 'react';

interface ProductSpecsProps {
  condition: string;
  location?: string;
  shipping?: string;
  id: string;
}

export const ProductSpecs: React.FC<ProductSpecsProps> = ({
  condition,
  location,
  shipping,
  id
}) => {
  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-2">Item Specifics</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-sm">
          <span className="text-gray-500">Condition:</span> {condition}
        </div>
        {location && (
          <div className="text-sm">
            <span className="text-gray-500">Location:</span> {location}
          </div>
        )}
        {shipping && (
          <div className="text-sm">
            <span className="text-gray-500">Shipping:</span> {shipping}
          </div>
        )}
        <div className="text-sm">
          <span className="text-gray-500">Item ID:</span> {id.substring(0, 8)}
        </div>
      </div>
    </div>
  );
};
