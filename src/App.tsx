
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
import './App.css';
import './i18n'; // Import i18n configuration

const queryClient = new QueryClient();

function AppRoutes(): ReactNode {
  return (
    <div className="flex flex-col min-h-screen">
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="reset-password" element={<ResetPassword />} />
        </Route>
        <Route path="/product/:id" element={<Layout><ProductDetail /></Layout>} />
        <Route path="/add-product" element={<Layout><AddProduct /></Layout>} />
        <Route path="/browse" element={<Layout><BrowseProducts /></Layout>} />
        <Route path="/profile" element={<Layout><Profile /></Layout>} />
        <Route path="/my-listings" element={<Layout><MyListings /></Layout>} />
        <Route path="/sell" element={<Layout><SellPage /></Layout>} />
        <Route path="/cart" element={<Layout><CartPage /></Layout>} />
        <Route path="/language" element={<Layout><div className="container mx-auto p-8"><h1 className="text-2xl font-bold mb-4">Language Settings</h1><p>Language preference options will appear here</p></div></Layout>} />
        <Route path="/theme" element={<Layout><div className="container mx-auto p-8"><h1 className="text-2xl font-bold mb-4">Theme Settings</h1><p>Theme options will appear here</p></div></Layout>} />
        <Route path="/about" element={<Layout><div className="container mx-auto p-8"><h1 className="text-2xl font-bold mb-4">About MzadKumSooq</h1><p>Information about our platform</p></div></Layout>} />
        
        {/* Add placeholder routes for the new sidebar items */}
        <Route path="/chats" element={<Layout><div className="container mx-auto p-8"><h1 className="text-2xl font-bold mb-4">Chats</h1><p>Chat functionality coming soon</p></div></Layout>} />
        <Route path="/notifications" element={<Layout><div className="container mx-auto p-8"><h1 className="text-2xl font-bold mb-4">Notifications</h1><p>Notification center coming soon</p></div></Layout>} />
        <Route path="/draft-listings" element={<Layout><div className="container mx-auto p-8"><h1 className="text-2xl font-bold mb-4">Draft Listings</h1><p>Your draft listings will appear here</p></div></Layout>} />
        <Route path="/favorite-listings" element={<Layout><div className="container mx-auto p-8"><h1 className="text-2xl font-bold mb-4">Favorite Listings</h1><p>Your favorite listings will appear here</p></div></Layout>} />
        <Route path="/recently-viewed" element={<Layout><div className="container mx-auto p-8"><h1 className="text-2xl font-bold mb-4">Recently Viewed</h1><p>Recently viewed listings will appear here</p></div></Layout>} />
        <Route path="/following-listings" element={<Layout><div className="container mx-auto p-8"><h1 className="text-2xl font-bold mb-4">Following Listings</h1><p>Listings you follow will appear here</p></div></Layout>} />
        <Route path="/job-applications" element={<Layout><div className="container mx-auto p-8"><h1 className="text-2xl font-bold mb-4">Job Applications</h1><p>Your job applications will appear here</p></div></Layout>} />
        <Route path="/saved-searches" element={<Layout><div className="container mx-auto p-8"><h1 className="text-2xl font-bold mb-4">Saved Searches</h1><p>Your saved searches will appear here</p></div></Layout>} />
        <Route path="/recent-searches" element={<Layout><div className="container mx-auto p-8"><h1 className="text-2xl font-bold mb-4">Recent Searches</h1><p>Your recent searches will appear here</p></div></Layout>} />
        <Route path="/products" element={<Layout><div className="container mx-auto p-8"><h1 className="text-2xl font-bold mb-4">Products</h1><p>Product catalog coming soon</p></div></Layout>} />
        <Route path="/invite-friends" element={<Layout><div className="container mx-auto p-8"><h1 className="text-2xl font-bold mb-4">Invite Friends</h1><p>Invite your friends to join</p></div></Layout>} />
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
