
import { Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface EmptyListingStateProps {
  activeTab: string;
}

const EmptyListingState = ({ activeTab }: EmptyListingStateProps) => {
  return (
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
  );
};

export default EmptyListingState;
