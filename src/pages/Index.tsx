
import React from 'react';
import Layout from '@/components/layout/Layout';
import HeroBanner from '@/components/home/HeroBanner';
import CategoriesSection from '@/components/home/CategoriesSection';
import ProductSections from '@/components/home/ProductSections';
import SellCTA from '@/components/home/SellCTA';
import RecentlyViewedProducts from '@/components/home/RecentlyViewedProducts';
import FeaturedCategories from '@/components/home/FeaturedCategories';
import TestimonialsSection from '@/components/home/TestimonialsSection';

const Index = () => {
  return (
    <Layout>
      <HeroBanner />
      <div className="container mx-auto px-4 py-8">
        <CategoriesSection />
      </div>
      <FeaturedCategories />
      <div className="container mx-auto px-4 py-8">
        <ProductSections />
        <RecentlyViewedProducts />
      </div>
      <TestimonialsSection />
      <div className="container mx-auto px-4 py-8">
        <SellCTA />
      </div>
    </Layout>
  );
};

export default Index;
