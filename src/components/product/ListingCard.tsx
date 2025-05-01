
import { Link } from 'react-router-dom';
import { Edit, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductWithImages } from '@/services/productService';

interface ListingCardProps {
  product: ProductWithImages;
  activeTab: string;
  onStatusChange: (productId: string, newStatus: string) => Promise<void>;
}

const ListingCard = ({ product, activeTab, onStatusChange }: ListingCardProps) => {
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
                      onClick={() => onStatusChange(product.id, "draft")}
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
                      onClick={() => onStatusChange(product.id, "active")}
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
                    onClick={() => onStatusChange(product.id, "draft")}
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
};

export default ListingCard;
