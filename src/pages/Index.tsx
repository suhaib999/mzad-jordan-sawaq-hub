import Layout from '@/components/layout/Layout';
import HeroBanner from '@/components/home/HeroBanner';
import CategoriesSection from '@/components/home/CategoriesSection';
import ProductGrid from '@/components/product/ProductGrid';
import { ProductCardProps } from '@/components/product/ProductCard';
import { Link } from 'react-router-dom';

// Sample product data
const featuredProducts: ProductCardProps[] = [
  {
    id: '1',
    title: 'Apple MacBook Pro 13" M1 8GB RAM 256GB SSD',
    price: 799.99,
    currency: 'JOD',
    imageUrl: '/public/lovable-uploads/0bd7877a-0725-40f8-8292-cd4d69ab06ef.png',
    condition: 'Pre-owned',
    shipping: 'Free shipping',
    location: 'Amman'
  },
  {
    id: '2',
    title: 'Samsung Galaxy S23 Ultra 256GB - Phantom Black',
    price: 649.99,
    currency: 'JOD',
    imageUrl: '/public/lovable-uploads/8fb76dea-fcf5-46af-9836-578964a4f7ca.png',
    condition: 'New',
    shipping: '+10.00 shipping',
    location: 'Irbid'
  },
  {
    id: '3',
    title: 'OnePlus Pad Go 28.85cm (11.35 inch) 2.4K Display',
    price: 269.00,
    currency: 'JOD',
    imageUrl: '/public/lovable-uploads/48e92a81-8038-455f-a3aa-db3567b0da7c.png',
    condition: 'New',
    shipping: 'Free shipping',
    location: 'Zarqa'
  },
  {
    id: '4',
    title: 'Canon EOS Rebel T2i DSLR Camera',
    price: 150.00,
    currency: 'JOD',
    imageUrl: '/public/lovable-uploads/12f0e13e-f59b-4e63-8f3c-862b091352d1.png',
    condition: 'Pre-owned',
    shipping: 'Free local pickup',
    location: 'Aqaba'
  },
  {
    id: '5',
    title: 'Microsoft Xbox Series X 1TB Gaming Console',
    price: 450.00,
    currency: 'JOD',
    imageUrl: 'https://via.placeholder.com/300x200',
    condition: 'New',
    shipping: 'Free shipping',
    location: 'Amman'
  }
];

const auctionProducts: ProductCardProps[] = [
  {
    id: '6',
    title: 'Antique Persian Rug - Handmade 6x9 ft',
    price: 599.99,
    currentBid: 599.99,
    currency: 'JOD',
    imageUrl: 'https://via.placeholder.com/300x200',
    condition: 'Pre-owned',
    isAuction: true,
    endTime: '2d 5h left',
    location: 'Amman'
  },
  {
    id: '7',
    title: 'Limited Edition Jordan 4 Retro Sneakers - Size 42',
    price: 320.00,
    currentBid: 320.00,
    currency: 'JOD',
    imageUrl: 'https://via.placeholder.com/300x200',
    condition: 'New',
    isAuction: true,
    endTime: '1d 12h left',
    location: 'Amman'
  },
  {
    id: '8',
    title: 'Vintage 1960s Arabic Vinyl Records Collection',
    price: 125.50,
    currentBid: 125.50,
    currency: 'JOD',
    imageUrl: 'https://via.placeholder.com/300x200',
    condition: 'Pre-owned',
    isAuction: true,
    endTime: '4h 30m left',
    location: 'Madaba'
  },
  {
    id: '9',
    title: '2019 Toyota Land Cruiser Prado',
    price: 25999.00,
    currentBid: 25999.00,
    currency: 'JOD',
    imageUrl: 'https://via.placeholder.com/300x200',
    condition: 'Pre-owned',
    isAuction: true,
    endTime: '3d left',
    location: 'Amman'
  },
  {
    id: '10',
    title: 'Gold Necklace 18k - Traditional Jordanian Design',
    price: 1200.00,
    currentBid: 1200.00,
    currency: 'JOD',
    imageUrl: 'https://via.placeholder.com/300x200',
    condition: 'New',
    isAuction: true,
    endTime: '2d 8h left',
    location: 'Irbid'
  }
];

const Index = () => {
  return (
    <Layout>
      <HeroBanner />
      <div className="container mx-auto px-4 py-8">
        <CategoriesSection />
        <div className="mt-12">
          <ProductGrid 
            title="Featured Products" 
            products={featuredProducts} 
            viewAllLink="/browse/featured" 
          />
          
          <ProductGrid 
            title="Hot Auctions" 
            products={auctionProducts} 
            viewAllLink="/browse/auctions" 
          />
        </div>
        
        <div className="bg-mzad-accent/20 p-6 rounded-lg my-12">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0 md:mr-6">
              <h2 className="text-2xl font-bold mb-2">Ready to sell on MzadKumSooq?</h2>
              <p className="text-gray-700">Join thousands of sellers in Jordan's leading marketplace.</p>
            </div>
            <Link 
              to="/sell" 
              className="px-6 py-3 bg-mzad-secondary text-white font-medium rounded-md hover:bg-mzad-secondary/90 transition-colors"
            >
              Start Selling
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
