
import { Link } from 'react-router-dom';

const featuredCategories = [
  {
    id: 'electronics',
    name: 'Electronics',
    description: 'Latest gadgets and tech devices',
    image: '/public/lovable-uploads/82bb57d2-9c39-42c3-8646-d34822d0d6b3.png',
    link: '/browse?category=Electronics'
  },
  {
    id: 'fashion',
    name: 'Fashion',
    description: 'Trendy clothing and accessories',
    image: '/public/lovable-uploads/82bb57d2-9c39-42c3-8646-d34822d0d6b3.png',
    link: '/browse?category=Fashion'
  },
  {
    id: 'home',
    name: 'Home & Garden',
    description: 'Decorate and improve your space',
    image: '/public/lovable-uploads/82bb57d2-9c39-42c3-8646-d34822d0d6b3.png',
    link: '/browse?category=Home%20%26%20Garden'
  }
];

const FeaturedCategories = () => {
  return (
    <section className="py-12 bg-mzad-primary/5">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">Featured Categories</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {featuredCategories.map((category) => (
            <Link 
              key={category.id}
              to={category.link}
              className="group rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow bg-white"
            >
              <div className="h-48 overflow-hidden">
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-mzad-primary">{category.name}</h3>
                <p className="text-gray-600">{category.description}</p>
                <div className="mt-4 font-medium text-mzad-secondary">
                  Browse Category →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;
