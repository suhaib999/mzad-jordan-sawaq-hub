
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import HeroBanner from '@/components/home/HeroBanner';
import CategoriesSection from '@/components/home/CategoriesSection';
import ProductSections from '@/components/home/ProductSections';
import SellCTA from '@/components/home/SellCTA';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const SecondaryNavBar = () => {
  const { t } = useTranslation();
  
  return (
    <div className="w-full bg-white dark:bg-gray-800 shadow-sm py-3 mb-4">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/browse" className="text-lg font-medium hover:text-mzad-primary dark:text-gray-200">
            {t('browse')}
          </Link>
          <Link to="/sell" className="text-lg font-medium hover:text-mzad-primary dark:text-gray-200">
            {t('sell')}
          </Link>
          <Link to="/about" className="text-lg font-medium hover:text-mzad-primary dark:text-gray-200">
            {t('about')}
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link to="/cart" className="p-2">
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </Link>
          
          <button className="bg-white dark:bg-gray-700 rounded-full px-4 py-1 text-base font-medium dark:text-white border border-gray-300 dark:border-gray-600">
            العربية
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-lg font-semibold">
              A
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <MainLayout>
      <SecondaryNavBar />
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
