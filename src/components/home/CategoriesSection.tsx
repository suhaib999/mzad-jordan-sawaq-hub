
import { Link } from 'react-router-dom';
import { 
  Smartphone, Laptop, Camera, Car, Home, ShoppingBag, 
  Watch, Gem, Tv, Shirt, Briefcase, Dumbbell
} from 'lucide-react';

const categories = [
  { name: 'Electronics', icon: Smartphone, slug: 'electronics' },
  { name: 'Computers', icon: Laptop, slug: 'computers-laptops' },
  { name: 'Cameras', icon: Camera, slug: 'cameras' },
  { name: 'Vehicles', icon: Car, slug: 'vehicles' },
  { name: 'Home & Garden', icon: Home, slug: 'home-garden' },
  { name: 'Fashion', icon: Shirt, slug: 'womens-fashion' },
  { name: 'Collectibles', icon: ShoppingBag, slug: 'books-hobbies' },
  { name: 'Jewelry & Watches', icon: Watch, slug: 'womens-fashion/jewelry' },
  { name: 'Luxury', icon: Gem, slug: 'mens-fashion' },
  { name: 'Consumer Electronics', icon: Tv, slug: 'electronics/tv-audio' },
  { name: 'Business & Industrial', icon: Briefcase, slug: 'business-equipment' },
  { name: 'Sporting Goods', icon: Dumbbell, slug: 'sports-fitness' }
];

const CategoriesSection = () => {
  return (
    <div className="py-10 bg-gray-50 rounded-lg">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8 text-center">Shop by Category</h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((category, index) => (
            <Link 
              key={index}
              to={`/browse?category=${category.slug}`}
              className="flex flex-col items-center justify-center bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200"
            >
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-mzad-primary mb-3">
                <category.icon size={24} />
              </div>
              <span className="text-sm font-medium text-center">{category.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoriesSection;
