
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: {
      en: {
        translation: {
          welcome: 'Welcome to MzadKumSooq',
          home: 'Home',
          browse: 'Browse',
          sell: 'Sell',
          about: 'About',
          login: 'Login',
          register: 'Register',
          logout: 'Logout',
          profile: 'Profile',
          daily_deals: 'Daily Deals',
          brand_outlet: 'Brand Outlet',
          gift_cards: 'Gift Cards',
          help_contact: 'Help & Contact',
          watchlist: 'Watchlist',
          my_account: 'My Account',
          hi: 'Hi',
          guest: 'Guest',
          favorites: 'Favorites',
          recently_viewed: 'Recently Viewed',
          my_listings: 'My Listings',
          following: 'Following',
        },
      },
    },
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
