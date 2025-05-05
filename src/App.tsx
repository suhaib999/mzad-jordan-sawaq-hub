
import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext"; // Make sure we import AuthProvider
import { Suspense, lazy } from "react";

// Pages
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import ProductDetail from "@/pages/Product/ProductDetail";
import AddProduct from "@/pages/Product/AddProduct";
import BrowseProducts from "@/pages/Browse/BrowseProducts";

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
              <Route path="/" element={<Index />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/browse" element={<BrowseProducts />} />
              
              {/* Auth routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Protected routes */}
              <Route path="/" element={<RequireAuth>
                <Routes>
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/my-listings" element={<MyListings />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/sell" element={<SellPage />} />
                  <Route path="/add-product" element={<AddProduct />} />
                  <Route path="/messages" element={<MessagesPage />} />
                </Routes>
              </RequireAuth>} />
              
              {/* Seller routes */}
              <Route path="/seller" element={<RequireAuth>
                <Routes>
                  <Route path="dashboard" element={<SellerDashboard />} />
                  <Route path="profile/:sellerId" element={<SellerProfile />} />
                  <Route path="profile/:sellerId/feedback" element={<SellerProfile />} />
                  <Route path="subscriptions" element={<SellerSubscriptions />} />
                  <Route path="account" element={<SellerAccount />} />
                </Routes>
              </RequireAuth>} />
              
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
