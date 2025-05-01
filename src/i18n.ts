
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      // Navigation
      browse: 'Browse',
      sell: 'Sell',
      about: 'About',
      login: 'Login',
      register: 'Register',
      language: 'Language',
      
      // Common actions
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      add: 'Add',
      edit: 'Edit',
      delete: 'Delete',
      cancel: 'Cancel',
      save: 'Save',
      confirm: 'Confirm',
      
      // Product related
      products: 'Products',
      price: 'Price',
      condition: 'Condition',
      category: 'Category',
      description: 'Description',
      shipping: 'Shipping',
      location: 'Location',
      
      // Cart related
      cart: 'Cart',
      addToCart: 'Add to Cart',
      checkout: 'Checkout',
      removeFromCart: 'Remove',
      
      // User related
      profile: 'Profile',
      myListings: 'My Listings',
      myOrders: 'My Orders',
      settings: 'Settings',
      logout: 'Logout',
    }
  },
  ar: {
    translation: {
      // Navigation
      browse: 'تصفح',
      sell: 'بيع',
      about: 'حول',
      login: 'تسجيل الدخول',
      register: 'إنشاء حساب',
      language: 'اللغة',
      
      // Common actions
      search: 'بحث',
      filter: 'تصفية',
      sort: 'ترتيب',
      add: 'إضافة',
      edit: 'تعديل',
      delete: 'حذف',
      cancel: 'إلغاء',
      save: 'حفظ',
      confirm: 'تأكيد',
      
      // Product related
      products: 'المنتجات',
      price: 'السعر',
      condition: 'الحالة',
      category: 'الفئة',
      description: 'الوصف',
      shipping: 'الشحن',
      location: 'الموقع',
      
      // Cart related
      cart: 'السلة',
      addToCart: 'إضافة إلى السلة',
      checkout: 'الدفع',
      removeFromCart: 'إزالة',
      
      // User related
      profile: 'الملف الشخصي',
      myListings: 'منتجاتي',
      myOrders: 'طلباتي',
      settings: 'الإعدادات',
      logout: 'تسجيل الخروج',
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    react: {
      useSuspense: false,
    }
  });

export default i18n;
