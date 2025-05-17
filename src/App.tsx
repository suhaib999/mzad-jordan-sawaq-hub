
import { Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { Toaster } from '@/components/ui/sonner';
import Index from './pages/Index';
import BrowseProducts from './pages/Browse/BrowseProducts';
import ProductDetail from './pages/Product/ProductDetail';
import AddProduct from './pages/Product/AddProduct';
import CreateListing from './pages/Product/CreateListing';
import CartPage from './pages/Cart/CartPage';
import WishlistPage from './pages/Wishlist/WishlistPage';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ResetPassword from './pages/Auth/ResetPassword';
import NotFound from './pages/NotFound';
import BidPage from './pages/Bids/BidPage';
import RequireAuth from './components/auth/RequireAuth';
import Profile from './pages/Profile/Profile';
import MyListings from './pages/Profile/MyListings';
import SellerProfile from './pages/Seller/SellerProfile';
import SavedSellersPage from './pages/Seller/SavedSellersPage';
import SellerAccount from './pages/Seller/SellerAccount';
import SellerDashboard from './pages/Seller/SellerDashboard';
import SellerSubscriptions from './pages/Seller/SellerSubscriptions';
import MessagesPage from './pages/Messages/MessagesPage';
import SellPage from './pages/Sell/SellPage';
import './App.css';

// Create a new React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/browse" element={<BrowseProducts />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              
              {/* Sell routes */}
              <Route path="/sell" element={<SellPage />} />
              <Route 
                path="/sell/create" 
                element={
                  <RequireAuth>
                    <CreateListing />
                  </RequireAuth>
                } 
              />
              <Route 
                path="/sell/add-product" 
                element={
                  <RequireAuth>
                    <AddProduct />
                  </RequireAuth>
                } 
              />
              
              {/* Cart and Wishlist */}
              <Route 
                path="/cart" 
                element={
                  <RequireAuth>
                    <CartPage />
                  </RequireAuth>
                } 
              />
              <Route 
                path="/wishlist" 
                element={
                  <RequireAuth>
                    <WishlistPage />
                  </RequireAuth>
                } 
              />
              
              {/* Auth routes - updated to use direct components instead of Outlet */}
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/register" element={<Register />} />
              <Route path="/auth/reset-password" element={<ResetPassword />} />
              
              {/* Bids */}
              <Route 
                path="/bids" 
                element={
                  <RequireAuth>
                    <BidPage />
                  </RequireAuth>
                } 
              />
              
              {/* Profile routes */}
              <Route 
                path="/profile" 
                element={
                  <RequireAuth>
                    <Profile />
                  </RequireAuth>
                } 
              />
              <Route 
                path="/profile/listings" 
                element={
                  <RequireAuth>
                    <MyListings />
                  </RequireAuth>
                } 
              />
              
              {/* Seller routes */}
              <Route path="/seller/:id" element={<SellerProfile />} />
              <Route 
                path="/seller/saved" 
                element={
                  <RequireAuth>
                    <SavedSellersPage />
                  </RequireAuth>
                } 
              />
              <Route 
                path="/seller/account" 
                element={
                  <RequireAuth>
                    <SellerAccount />
                  </RequireAuth>
                } 
              />
              <Route 
                path="/seller/dashboard" 
                element={
                  <RequireAuth>
                    <SellerDashboard />
                  </RequireAuth>
                } 
              />
              <Route 
                path="/seller/subscriptions" 
                element={
                  <RequireAuth>
                    <SellerSubscriptions />
                  </RequireAuth>
                } 
              />
              
              {/* Messages */}
              <Route 
                path="/messages" 
                element={
                  <RequireAuth>
                    <MessagesPage />
                  </RequireAuth>
                } 
              />
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
