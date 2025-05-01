
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import HeroBanner from '@/components/home/HeroBanner';
import CategoriesSection from '@/components/home/CategoriesSection';
import ProductSections from '@/components/home/ProductSections';
import SellCTA from '@/components/home/SellCTA';

const Index = () => {
  return (
    <MainLayout>
      <HeroBanner />
      <div className="container mx-auto px-4 py-8">
        <CategoriesSection />
        <ProductSections />
        <SellCTA />
      </div>
    </MainLayout>
  );
};

export default Index;
