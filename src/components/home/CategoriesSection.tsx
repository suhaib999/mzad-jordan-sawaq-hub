
import { Link } from 'react-router-dom';
import { 
  Smartphone, Laptop, Camera, Car, Home, ShoppingBag, 
  Watch, Gem, Tv, Shirt, Briefcase, Dumbbell
} from 'lucide-react';

const categories = [
  { name: 'Electronics', icon: Smartphone, link: '/category/electronics' },
  { name: 'Computers', icon: Laptop, link: '/category/computers' },
  { name: 'Cameras', icon: Camera, link: '/category/cameras' },
  { name: 'Vehicles', icon: Car, link: '/category/vehicles' },
  { name: 'Home & Garden', icon: Home, link: '/category/home-garden' },
  { name: 'Fashion', icon: Shirt, link: '/category/fashion' },
  { name: 'Collectibles', icon: ShoppingBag, link: '/category/collectibles' },
  { name: 'Jewelry & Watches', icon: Watch, link: '/category/jewelry-watches' },
  { name: 'Luxury', icon: Gem, link: '/category/luxury' },
  { name: 'Consumer Electronics', icon: Tv, link: '/category/consumer-electronics' },
  { name: 'Business & Industrial', icon: Briefcase, link: '/category/business' },
  { name: 'Sporting Goods', icon: Dumbbell, link: '/category/sporting-goods' }
];

const CategoriesSection = () => {
  return (
    <div className="py-10 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8 text-center">Shop by Category</h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((category, index) => (
            <Link 
              key={index}
              to={category.link}
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
