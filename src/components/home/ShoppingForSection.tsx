
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Smartphone, Laptop, Car, Home, ShoppingBag, 
  Shirt, Dumbbell, Tv
} from 'lucide-react';

const shoppingCategories = [
  { 
    name: 'Mobile Phones', 
    icon: Smartphone, 
    slug: 'electronics/mobile-phones-tablets/phones', 
    bgColor: 'bg-soft-blue'
  },
  { 
    name: 'Laptops', 
    icon: Laptop, 
    slug: 'electronics/computers-laptops/laptops', 
    bgColor: 'bg-soft-green' 
  },
  { 
    name: 'Cars', 
    icon: Car, 
    slug: 'vehicles/cars', 
    bgColor: 'bg-soft-yellow' 
  },
  { 
    name: 'Real Estate', 
    icon: Home, 
    slug: 'real-estate-sale', 
    bgColor: 'bg-soft-orange' 
  },
  { 
    name: 'Women\'s Fashion', 
    icon: Shirt, 
    slug: 'womens-fashion', 
    bgColor: 'bg-soft-pink' 
  },
  { 
    name: 'Sports & Fitness', 
    icon: Dumbbell, 
    slug: 'sports-fitness', 
    bgColor: 'bg-soft-purple' 
  },
  { 
    name: 'Home Electronics', 
    icon: Tv, 
    slug: 'electronics/tv-audio', 
    bgColor: 'bg-soft-peach' 
  },
  { 
    name: 'All Categories', 
    icon: ShoppingBag, 
    slug: 'browse', 
    bgColor: 'bg-soft-gray' 
  },
];

const ShoppingForSection = () => {
  return (
    <div className="mt-12">
      <h2 className="text-xl font-bold mb-6">Shopping For</h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-4">
        {shoppingCategories.map((category, index) => (
          <Link 
            key={index}
            to={`/browse?category=${category.slug}`}
            className="flex flex-col items-center p-4 rounded-xl hover:shadow-md transition-shadow border border-gray-100 hover:border-gray-200"
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 text-mzad-primary ${category.bgColor || 'bg-gray-100'}`}>
              <category.icon size={24} />
            </div>
            <span className="text-sm font-medium text-center">{category.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ShoppingForSection;
