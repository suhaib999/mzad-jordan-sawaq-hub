
import { ReactNode } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ResetPassword from './pages/Auth/ResetPassword';
import NotFound from './pages/NotFound';
import AuthLayout from './pages/Auth/AuthLayout';
import ProductDetail from './pages/Product/ProductDetail';
import AddProduct from './pages/Product/AddProduct';
import BrowseProducts from './pages/Browse/BrowseProducts';
import Profile from './pages/Profile/Profile';
import MyListings from './pages/Profile/MyListings';
import SellPage from './pages/Sell/SellPage';
import CartPage from './pages/Cart/CartPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "./components/ui/toaster";
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/layout/Layout';
import MainLayout from './components/layout/MainLayout';
import './App.css';
import './i18n'; // Import i18n configuration

const queryClient = new QueryClient();

// Routes that should use the MainLayout with sidebar
const mainLayoutRoutes = [
  '/profile',
  '/my-listings',
  '/draft-listings',
  '/favorite-listings',
  '/recently-viewed',
  '/following-listings',
  '/job-applications',
  '/saved-searches',
  '/recent-searches',
  '/products',
  '/invite-friends',
  '/chats',
  '/notifications'
];

function AppRoutes(): ReactNode {
  return (
    <div className="flex flex-col min-h-screen">
      <Routes>
        <Route path="/" element={<MainLayout><Index /></MainLayout>} />
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="reset-password" element={<ResetPassword />} />
        </Route>
        <Route path="/product/:id" element={<Layout><ProductDetail /></Layout>} />
        <Route path="/add-product" element={<Layout><AddProduct /></Layout>} />
        <Route path="/browse" element={<Layout><BrowseProducts /></Layout>} />
        <Route path="/profile" element={<MainLayout><Profile /></MainLayout>} />
        <Route path="/my-listings" element={<MainLayout><MyListings /></MainLayout>} />
        <Route path="/sell" element={<Layout><SellPage /></Layout>} />
        <Route path="/cart" element={<Layout><CartPage /></Layout>} />
        
        {/* Add placeholder routes for the new sidebar items */}
        <Route path="/chats" element={<MainLayout><div className="container mx-auto p-8"><h1 className="text-2xl font-bold mb-4">Chats</h1><p>Chat functionality coming soon</p></div></MainLayout>} />
        <Route path="/notifications" element={<MainLayout><div className="container mx-auto p-8"><h1 className="text-2xl font-bold mb-4">Notifications</h1><p>Notification center coming soon</p></div></MainLayout>} />
        <Route path="/draft-listings" element={<MainLayout><div className="container mx-auto p-8"><h1 className="text-2xl font-bold mb-4">Draft Listings</h1><p>Your draft listings will appear here</p></div></MainLayout>} />
        <Route path="/favorite-listings" element={<MainLayout><div className="container mx-auto p-8"><h1 className="text-2xl font-bold mb-4">Favorite Listings</h1><p>Your favorite listings will appear here</p></div></MainLayout>} />
        <Route path="/recently-viewed" element={<MainLayout><div className="container mx-auto p-8"><h1 className="text-2xl font-bold mb-4">Recently Viewed</h1><p>Recently viewed listings will appear here</p></div></MainLayout>} />
        <Route path="/following-listings" element={<MainLayout><div className="container mx-auto p-8"><h1 className="text-2xl font-bold mb-4">Following Listings</h1><p>Listings you follow will appear here</p></div></MainLayout>} />
        <Route path="/job-applications" element={<MainLayout><div className="container mx-auto p-8"><h1 className="text-2xl font-bold mb-4">Job Applications</h1><p>Your job applications will appear here</p></div></MainLayout>} />
        <Route path="/saved-searches" element={<MainLayout><div className="container mx-auto p-8"><h1 className="text-2xl font-bold mb-4">Saved Searches</h1><p>Your saved searches will appear here</p></div></MainLayout>} />
        <Route path="/recent-searches" element={<MainLayout><div className="container mx-auto p-8"><h1 className="text-2xl font-bold mb-4">Recent Searches</h1><p>Your recent searches will appear here</p></div></MainLayout>} />
        <Route path="/products" element={<MainLayout><div className="container mx-auto p-8"><h1 className="text-2xl font-bold mb-4">Products</h1><p>Product catalog coming soon</p></div></MainLayout>} />
        <Route path="/invite-friends" element={<MainLayout><div className="container mx-auto p-8"><h1 className="text-2xl font-bold mb-4">Invite Friends</h1><p>Invite your friends to join</p></div></MainLayout>} />
        <Route path="/daily-deals" element={<Layout><div className="container mx-auto p-8"><h1 className="text-2xl font-bold mb-4">Daily Deals</h1><p>Check out our daily deals</p></div></Layout>} />
        <Route path="/outlet" element={<Layout><div className="container mx-auto p-8"><h1 className="text-2xl font-bold mb-4">Brand Outlet</h1><p>Brand outlet with discounted items</p></div></Layout>} />
        <Route path="/gift-cards" element={<Layout><div className="container mx-auto p-8"><h1 className="text-2xl font-bold mb-4">Gift Cards</h1><p>Purchase gift cards</p></div></Layout>} />
        <Route path="/help" element={<Layout><div className="container mx-auto p-8"><h1 className="text-2xl font-bold mb-4">Help & Contact</h1><p>Need help? Contact us</p></div></Layout>} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <AppRoutes />
              <Toaster />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
