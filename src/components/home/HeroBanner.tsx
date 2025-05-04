
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const HeroBanner = () => {
  return (
    <div className="bg-gradient-to-r from-mzad-primary to-mzad-secondary text-white">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Welcome to MzadKumSooq
            </h1>
            <p className="text-xl mb-6">
              Jordan's premier online marketplace for auctions and direct sales.
              Buy, sell, and discover amazing deals NOW!
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-white text-mzad-primary hover:bg-gray-100">
                <Link to="/browse">Browse Products</Link>
              </Button>
              <Button size="lg" className="bg-mzad-accent text-mzad-dark hover:bg-mzad-accent/90">
                <Link to="/sell">Start Selling</Link>
              </Button>
            </div>
          </div>
          <div className="md:w-1/2">
            <img 
              src="/public/lovable-uploads/82bb57d2-9c39-42c3-8646-d34822d0d6b3.png" 
              alt="Marketplace" 
              className="rounded-lg shadow-lg max-h-[300px] object-cover w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
