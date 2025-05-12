
import { Link } from 'react-router-dom';
import { 
  Smartphone, Laptop, Camera, Car, Home, ShoppingBag, 
  Watch, Gem, Tv, Shirt, Briefcase, Dumbbell
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Updated categories with correct slugs that match the standardized categories
const categories = [
  { name: 'Electronics', icon: Smartphone, slug: 'electronics', count: 1245 },
  { name: 'Mobile Phones & Tablets', icon: Smartphone, slug: 'electronics/mobile-phones-tablets', count: 876 },
  { name: 'Computers & Laptops', icon: Laptop, slug: 'electronics/computers-laptops', count: 543 },
  { name: 'Vehicles', icon: Car, slug: 'vehicles', count: 328 },
  { name: 'Home & Garden', icon: Home, slug: 'home-garden', count: 1087 },
  { name: 'Women\'s Fashion', icon: Shirt, slug: 'womens-fashion', count: 2156 },
  { name: 'Books & Hobbies', icon: ShoppingBag, slug: 'books-hobbies', count: 654 },
  { name: 'Jewelry & Watches', icon: Watch, slug: 'womens-fashion/jewelry', count: 432 },
  { name: 'TV & Audio', icon: Tv, slug: 'electronics/tv-audio', count: 765 },
  { name: 'Business Equipment', icon: Briefcase, slug: 'business-equipment', count: 321 },
  { name: 'Sports & Fitness', icon: Dumbbell, slug: 'sports-fitness', count: 546 },
  { name: 'Real Estate', icon: Home, slug: 'real-estate-sale', count: 218 }
];

const CategoriesSection = () => {
  return (
    <div className="py-10 bg-gray-50 rounded-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Shop by Category</h2>
          <Link to="/browse" className="text-mzad-primary hover:underline text-sm font-medium">
            View All Categories
          </Link>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((category, index) => (
            <Link 
              key={index}
              to={`/browse?category=${category.slug}`}
              className="flex flex-col items-center justify-center bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 group"
            >
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-mzad-primary mb-3 group-hover:bg-mzad-primary group-hover:text-white transition-colors">
                <category.icon size={24} />
              </div>
              <span className="text-sm font-medium text-center">{category.name}</span>
              <Badge variant="outline" className="mt-2 text-xs bg-gray-50">
                {category.count} items
              </Badge>
            </Link>
          ))}
        </div>
        
        <div className="flex justify-center mt-8">
          <Button variant="outline" className="font-medium" asChild>
            <Link to="/browse">View All Categories</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CategoriesSection;
