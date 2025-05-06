
import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { Suspense, lazy } from "react";

// Pages
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import ProductDetail from "@/pages/Product/ProductDetail";
import AddProduct from "@/pages/Product/AddProduct";
import BrowseProducts from "@/pages/Browse/BrowseProducts";
import BidPage from "@/pages/Bids/BidPage";

// Auth
import Login from "@/pages/Auth/Login";
import Register from "@/pages/Auth/Register";
import ResetPassword from "@/pages/Auth/ResetPassword";
import RequireAuth from "@/components/auth/RequireAuth";

// User account pages
import Profile from "@/pages/Profile/Profile";
import MyListings from "@/pages/Profile/MyListings";
import WishlistPage from "@/pages/Wishlist/WishlistPage";
import CartPage from "@/pages/Cart/CartPage";
import SellPage from "@/pages/Sell/SellPage";

// Seller pages
import SellerDashboard from "@/pages/Seller/SellerDashboard";
import SellerProfile from "@/pages/Seller/SellerProfile";
import SellerSubscriptions from "@/pages/Seller/SellerSubscriptions";
import SellerAccount from "@/pages/Seller/SellerAccount";
import SavedSellersPage from "@/pages/Seller/SavedSellersPage";

// New messaging page
import MessagesPage from "@/pages/Messages/MessagesPage";

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <CartProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/browse" element={<BrowseProducts />} />
              
              {/* Auth routes - Update to include both /auth/ prefix and direct paths */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/register" element={<Register />} />
              <Route path="/auth/reset-password" element={<ResetPassword />} />
              
              {/* Protected routes */}
              <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
              <Route path="/my-listings" element={<RequireAuth><MyListings /></RequireAuth>} />
              <Route path="/wishlist" element={<RequireAuth><WishlistPage /></RequireAuth>} />
              <Route path="/cart" element={<RequireAuth><CartPage /></RequireAuth>} />
              <Route path="/sell" element={<RequireAuth><SellPage /></RequireAuth>} />
              <Route path="/add-product" element={<RequireAuth><AddProduct /></RequireAuth>} />
              <Route path="/messages" element={<RequireAuth><MessagesPage /></RequireAuth>} />
              <Route path="/my-bids" element={<RequireAuth><BidPage /></RequireAuth>} />
              <Route path="/saved-sellers" element={<RequireAuth><SavedSellersPage /></RequireAuth>} />
              
              {/* Seller routes */}
              <Route path="/seller/dashboard" element={<RequireAuth><SellerDashboard /></RequireAuth>} />
              <Route path="/seller/profile/:sellerId" element={<SellerProfile />} />
              <Route path="/seller/profile/:sellerId/feedback" element={<RequireAuth><SellerProfile /></RequireAuth>} />
              <Route path="/seller/subscriptions" element={<RequireAuth><SellerSubscriptions /></RequireAuth>} />
              <Route path="/seller/account" element={<RequireAuth><SellerAccount /></RequireAuth>} />
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </CartProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
