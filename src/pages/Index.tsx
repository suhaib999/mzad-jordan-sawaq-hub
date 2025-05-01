
import React from 'react';
import HeroBanner from '@/components/home/HeroBanner';
import CategoriesSection from '@/components/home/CategoriesSection';
import ProductSections from '@/components/home/ProductSections';
import SellCTA from '@/components/home/SellCTA';

const Index = () => {
  return (
    <>
      <HeroBanner />
      <div className="container mx-auto px-4 py-8">
        <CategoriesSection />
        <ProductSections />
        <SellCTA />
      </div>
    </>
  );
};

export default Index;
