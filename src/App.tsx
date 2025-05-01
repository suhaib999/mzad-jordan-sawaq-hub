
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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "./components/ui/toaster";
import { AuthProvider } from './contexts/AuthContext';
import './App.css';

const queryClient = new QueryClient();

function AppRoutes(): ReactNode {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="reset-password" element={<ResetPassword />} />
      </Route>
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/add-product" element={<AddProduct />} />
      <Route path="/browse" element={<BrowseProducts />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/my-listings" element={<MyListings />} />
      <Route path="/sell" element={<SellPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
